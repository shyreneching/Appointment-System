const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var doctorSchema = new Schema({
    firstname: String,
    lastname: String,
    status: String
})

doctorSchema.statics.getDoctorByID = async function(doctorID){
    return await this.findOne({
        _id: doctorID
    }); 
};

doctorSchema.statics.getAvailableDoctor = async function(){
    return await this.find({
        status: "available"
    }); 
};

doctorSchema.statics.addDoctor = function(doctor, callback){
    doctor.save().then(callback);
};

doctorSchema.statics.getAllDoctors = async function(){
    return await this.find();
}

doctorSchema.statics.delete = async function(doctorID){
    return await this.deleteOne({
        _id : doctorID
    });
}

doctorSchema.methods.updateDoctor = async function(doctorID, updated){
    return await this.updateOne({
        _id: doctorID
    }, {
        firstname,
        lastname,
        status
    }, {
        new: true
    }); 
};

var Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = {
    Doctor
}