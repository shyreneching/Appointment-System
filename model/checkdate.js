const mongoose = require("mongoose")
const Schema = mongoose.Schema;

var checkdateSchema = new Schema({
    type: String,
    checkdate: String
})

var CheckDate = mongoose.model('CheckDate', checkdateSchema)

module.exports = {
    CheckDate
}