require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const PlanModel = require('./models/Plan')
const StateModel = require('./models/State')
const ChecklistItemModel = require('./models/ChecklistItem')
const DemoVoterModel = require('./models/DemoVoter')
const ConstituencyModel = require('./models/Constituency')
const { askGemini } = require('./ask')

const app = express()
const port = process.env.PORT || 3001
// The Vercel MongoDB Atlas integration names the variable after a chosen prefix; accept the usual ones.
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.STORAGE_URL

// Vercel runs this file as a serverless function (no listen) and pauses it once a response is
// sent, so connecting and seeding an empty database must finish before a request is handled.
// ponytail: two cold starts racing on an empty DB could both seed; fine for a one-time first run.
const ready = process.env.VERCEL && MONGO_URI
  ? mongoose.connect(MONGO_URI)
    .then(async () => { if (!(await StateModel.estimatedDocumentCount())) await require('./seed')() })
    .catch(err => console.error('MongoDB startup failed:', err.message))
  : null

app.set('trust proxy', 1) // behind Vercel's proxy; needed for per-IP rate limits
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true }))
app.use(express.json({ limit: '20kb' }))
if (ready) app.use(async (req, res, next) => { await ready; next() })

const PLAN_FIELDS = ['name', 'state', 'constituency', 'pollingStation', 'pollingDate', 'idDocument']
const pick = (body = {}) => Object.fromEntries(PLAN_FIELDS.filter(k => k in body).map(k => [k, body[k]]))
const notFound = res => res.status(404).json({ error: 'Plan not found' })
const validId = id => mongoose.isValidObjectId(id)

// ---- Health ----
app.get('/health', (req, res) => {
  const ok = mongoose.connection.readyState === 1
  res.status(ok ? 200 : 503).json({ ok, db: ok ? 'connected' : 'disconnected' })
})

// ---- Plan CRUD (the lab's five routes) ----
app.get('/plans', async (req, res) => {
  res.json(await PlanModel.find({}).sort({ createdAt: -1 }))
})

app.get('/getplan/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res)
  const plan = await PlanModel.findById(req.params.id)
  plan ? res.json(plan) : notFound(res)
})

app.post('/createplan', async (req, res) => {
  res.status(201).json(await PlanModel.create(pick(req.body)))
})

app.put('/updateplan/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res)
  const plan = await PlanModel.findByIdAndUpdate(req.params.id, pick(req.body), { returnDocument: 'after', runValidators: true })
  plan ? res.json(plan) : notFound(res)
})

app.delete('/deleteplan/:id', async (req, res) => {
  if (!validId(req.params.id)) return notFound(res)
  const plan = await PlanModel.findByIdAndDelete(req.params.id)
  plan ? res.json({ deleted: plan._id }) : notFound(res)
})

// ---- Reference data ----
app.get('/checklist', async (req, res) => {
  const lang = req.query.lang === 'hi' ? 'hi' : 'en'
  res.json(await ChecklistItemModel.find({ lang }, { _id: 0, __v: 0, lang: 0 }).sort({ order: 1 }))
})

app.get('/states', async (req, res) => {
  res.json(await StateModel.find({}, { _id: 0, __v: 0 }).sort({ name: 1 }))
})

app.get('/states/:name/constituencies', async (req, res) => {
  res.json(await ConstituencyModel.find({ state: req.params.name }, { _id: 0, __v: 0 }).sort({ no: 1 }))
})

app.post('/epic/lookup', async (req, res) => {
  const epic = String(req.body?.epic_no || '').trim().toUpperCase().slice(0, 20)
  if (!epic) return res.status(400).json({ error: 'epic_no is required' })
  const voter = await DemoVoterModel.findOne({ epic_no: epic }, { _id: 0, __v: 0 })
  res.json({ demo: true, voter }) // voter is null when the number is not in the demo data
})

// ---- AI Q&A (Gemini key stays on the server) ----
app.post('/ask', rateLimit({ windowMs: 60_000, limit: 10 }), async (req, res) => {
  const { status, body } = await askGemini(req.body || {})
  res.status(status).json(body)
})

// ---- Errors: correct codes, never a stack trace ----
app.use((req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

if (require.main === module) {
  mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/voteready')
    .then(() => app.listen(port, () => console.log(`Server is running on port ${port}`)))
    .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1) })
}

module.exports = app
