const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var doctorSchema = new Schema({
    firstname: String,
    lastname: String,
    schedule: {
        type: Schema.Types.ObjectId,
        ref: "Schedule"
    }
})

doctorSchema.statics.getDoctorByID = async function(doctorID){
    return await this.findOne({
        _id: doctorID
    }); 
};

doctorSchema.statics.addDoctor = function(doctor, callback){
    doctor.save().then(callback);
};

doctorSchema.statics.getAllDoctors = async function(){
    return await this.find({}).sort({'lastname': 1});
}

doctorSchema.statics.delete = async function(doctorID){
    return await this.deleteOne({
        _id : doctorID
    });
}

doctorSchema.statics.updateDoctor = async function(doctorID, firstname, lastname){
    return await this.updateOne({
        _id: doctorID
    }, {
        firstname,
        lastname
    }, {
        new: true
    }); 
};

doctorSchema.statics.updateDoctorSchedule = async function(doctorID, schedule){
    return await this.updateOne({
        _id: doctorID
    }, {
        schedule
    }, {
        new: true
    }); 
};

doctorSchema.methods.populateSchedule = async function(){
    return await Appointment.findOne({
        _id: this._id
    }).populate("schedule");
};

var Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = {
    Doctor
}