const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var doctorSchema = new Schema({
    firstname: String,
    lastname: String
})

doctorSchema.statics.addDoctor = function(doctor, callback){
    doctor.save().then(callback);
};

doctorSchema.statics.getAllDoctors = async function(){
    return await this.find();
}

var Doctor = mongoose.model("doctor", doctorSchema)

module.exports = {
    Doctor
}