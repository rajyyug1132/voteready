const mongoose = require('mongoose')

// Lok Sabha constituencies, seeded from data/constituencies.json (cleaned from the Kaggle CC0 dataset
// jainaru/lok-sabha-2024-results-and-candidates by scripts/clean-kaggle.js).
const ConstituencySchema = new mongoose.Schema({
  state: { type: String, required: true },
  no: { type: Number, required: true },
  name: { type: String, required: true },
  phase: Number,            // 2024 general election phase
  pollingDate2024: String,  // as published in the dataset
})
ConstituencySchema.index({ state: 1, no: 1 }, { unique: true })

module.exports = mongoose.model('constituencies', ConstituencySchema)
