// npm run seed — fills reference collections from ../data/*.json. Safe to re-run: it replaces
// states, checklist items and demo voters, and never touches plans.
require('dotenv').config()
const path = require('path')
const mongoose = require('mongoose')
const StateModel = require('./models/State')
const ChecklistItemModel = require('./models/ChecklistItem')
const DemoVoterModel = require('./models/DemoVoter')
const ConstituencyModel = require('./models/Constituency')

const data = file => require(path.join(__dirname, '..', 'data', file))

async function seed() {
  const states = data('states.json')
  const checklist = [
    ...data('checklist.json').map((item, order) => ({ ...item, lang: 'en', order })),
    ...data('checklist_hi.json').map((item, order) => ({ ...item, lang: 'hi', order })),
  ]
  const voters = data('voters.json').test_voters
  // Optional until the Kaggle CSV has been cleaned (npm run clean:kaggle); the form falls back to free text.
  let constituencies = []
  try { constituencies = data('constituencies.json') } catch { console.warn('data/constituencies.json missing: run npm run clean:kaggle') }

  await Promise.all([StateModel.deleteMany({}), ChecklistItemModel.deleteMany({}), DemoVoterModel.deleteMany({}), ConstituencyModel.deleteMany({})])
  await StateModel.insertMany(states)
  await ChecklistItemModel.insertMany(checklist)
  await DemoVoterModel.insertMany(voters)
  await ConstituencyModel.insertMany(constituencies)
  return { states: states.length, checklist: checklist.length, voters: voters.length, constituencies: constituencies.length }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voteready')
    .then(seed)
    .then(counts => { console.log('Seeded', counts); return mongoose.disconnect() })
    .catch(err => { console.error(err.message); process.exit(1) })
}

module.exports = seed
