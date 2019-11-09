const mongoose = require("mongoose")
const Schema = mongoose.Schema;

var processSchema = new Schema({
    processname: String
})

processSchema.statics.addProcess = function(process, callback){
    process.save().then(callback);
};

processSchema.statics.getAllProcesses = async function(){
    return await this.find({}).sort({'processname': 1});
}

processSchema.statics.delete = async function(processID){
    return await this.deleteOne({
        _id : processID
    });
}

processSchema.statics.updateProcess = async function(processID, processname){
    return await this.updateOne({
        _id: processID
    }, {
        processname
    }, {
        new: true
    }); 
};

var Process = mongoose.model('Process', processSchema)

module.exports = {
    Process
}