const mongoose = require("mongoose")

var Appointment = mongoose.model("appointment",{
    patientname: String,
    patientcontact: String,
    process: String,
    notes: String,
    time: Number,
    date: Date,
    doctor: String
})

module.exports = {
    Appointment
}