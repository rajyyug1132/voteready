const mongoose = require('mongoose')

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capital: String,
  ceo: { type: String, default: null }, // CEO portal domain, null when none is listed
  ls: Number, // Lok Sabha seats
  vs: Number, // Vidhan Sabha seats (0 = no legislature)
})

module.exports = mongoose.model('states', StateSchema)
