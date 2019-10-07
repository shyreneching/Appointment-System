const mongoose = require("mongoose")

var Doctor = mongoose.model("doctor",{
    name: String,
    status: String,
    
})

module.exports = {
    Doctor
}