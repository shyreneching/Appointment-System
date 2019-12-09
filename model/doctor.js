const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var doctorSchema = new Schema({
    firstname: String,
    lastname: String,
    status: String,
    schedule: {
        type: Schema.Types.ObjectId,
        ref: "Schedule"
    },
    breakTime: {
        type: Schema.Types.ObjectId,
        ref: "BreakTime"
    },
    lastLogin: String
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
        lastname,
    }, {
        new: true
    }); 
};

doctorSchema.statics.updateDoctorStatus = async function(doctorID, status) {
    return await this.updateOne({
        _id: doctorID
    }, {
        status
    });
}

doctorSchema.statics.updateDoctorSchedule = async function(doctorID, schedule){
    return await this.updateOne({
        _id: doctorID
    }, {
        schedule
    }, {
        new: true
    }); 
};

doctorSchema.statics.updateDoctorBreakTime = async function(doctorID, breakTime){
    return await this.updateOne({
        _id: doctorID
    }, {
        breakTime
    }, {
        new: true
    }); 
};

doctorSchema.methods.populateSchedule = async function(){
    return await Doctor.findOne({
        _id: this._id
    }).populate("schedule");
};

doctorSchema.methods.populateBreakTime = async function(){
    return await Doctor.findOne({
        _id: this._id
    }).populate("breakTime");
};

doctorSchema.statics.updateLogin = async function(doctorID, lastLogin) {
    return await this.updateOne({
        _id: doctorID
    }, { $set: {
        lastLogin
    }})
}

var Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = {
    Doctor
}