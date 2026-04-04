const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  date: String,   // 🔥 "2026-03-20"
  time: String,   // 🔥 "14:00"
  notes: String
});

module.exports = mongoose.model('Appointment', AppointmentSchema);