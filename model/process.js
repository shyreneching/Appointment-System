const mongoose = require("mongoose")
const Schema = mongoose.Schema;

var processSchema = new Schema({
    processname: String
})

processSchema.statics.addProcess = function(process, callback){
    process.save().then(callback);
};


var Process = mongoose.model('process', processSchema)

module.exports = {
    Process
}