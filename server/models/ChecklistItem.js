const mongoose = require('mongoose')

// One checklist step in one language; seeded 1:1 from data/checklist.json and data/checklist_hi.json.
const ChecklistItemSchema = new mongoose.Schema({
  lang: { type: String, enum: ['en', 'hi'], required: true },
  order: { type: Number, required: true },
  id: { type: String, required: true },
  title: String,
  description: String,
  steps: [String],
  officialLink: String,
  category: String,
  category_label: String,
  source: String,
  verified_on: String,
})
ChecklistItemSchema.index({ lang: 1, id: 1 }, { unique: true })

module.exports = mongoose.model('checklistitems', ChecklistItemSchema)
