const mongoose = require("mongoose")
const Schema = mongoose.Schema;

var Appointment = mongoose.model("appointment",{
    patientname: String,
    patientcontact: String,
    process: [{
        type: Schema.Types.ObjectId,
        ref: "Process"
    }],
    notes: String,
    time: String,
    date: String,
    doctor: [{
        type: Schema.Types.ObjectId,
        ref: "Doctor"
    }]
})

module.exports = {
    Appointment
}