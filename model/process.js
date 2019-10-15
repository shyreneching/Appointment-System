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

processSchema.statics.delete = async function(processID){
    return await this.deleteOne({
        _id : processID
    });
}

processSchema.methods.updateProcess = async function(processID, updated){
    return await this.updateOne({
        _id: processID
    }, {
        processname
    }, {
        new: true
    }); 
};

var Process = mongoose.model('process', processSchema)

module.exports = {
    Process
}