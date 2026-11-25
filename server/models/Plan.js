const mongoose = require('mongoose')

// The lab's CRUD resource: one first-time voter's plan for polling day.
const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 60 },
  constituency: { type: String, trim: true, maxlength: 100, default: '' },
  pollingStation: { type: String, trim: true, maxlength: 150, default: '' },
  pollingDate: { type: Date },
  idDocument: { type: String, trim: true, maxlength: 40, default: 'epic' },
}, { timestamps: true })

module.exports = mongoose.model('plans', PlanSchema)
