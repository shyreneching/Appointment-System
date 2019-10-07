const mongoose = require("mongoose")

var Appointment = mongoose.model("appointment",{
    patientname: String,
    patientcontact: String,
    process: String,
    notes: String,
    time: Number,
    date: Number,
    doctor: String
})

module.exports = {
    Appointment
}


exports.create = function() {

}

exports.update = function() {

}

exports.delete = function() {

}