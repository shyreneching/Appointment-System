const mongoose = require("mongoose")
const Schema = mongoose.Schema;

var processSchema = new Schema({
    processname: String
})

processSchema.statics.addProcess = function(process, callback){
    process.save().then(callback);
};

processSchema.statics.getAllProcesses = async function(){
    return await this.find();
}


var Process = mongoose.model('process', processSchema)

module.exports = {
    Process
}