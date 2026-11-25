const mongoose = require('mongoose')

// Invented sample records (data/voters.json). Never real ECI data.
const DemoVoterSchema = new mongoose.Schema({
  epic_no: { type: String, required: true, unique: true, uppercase: true },
  name: String,
  status: String,
  polling_station: String,
  assembly_constituency: String,
  reason: String,
  action_required: String,
  demo: { type: Boolean, default: true },
})

module.exports = mongoose.model('demovoters', DemoVoterSchema)
