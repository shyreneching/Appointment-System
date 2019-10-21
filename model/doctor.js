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
        status: "Available"
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

doctorSchema.statics.updateDoctor = async function(doctorID, updated){
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

doctorSchema.statics.updateDoctorStatus = async function(doctorID, status) {
    return await this.updateOne({
        _id: doctorID
    }, { $set: {
        status,
    }})
}

var Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = {
    Doctor
}