const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Doctor = mongoose.model("doctor",{
    name: String
})

module.exports = {
    Doctor
}