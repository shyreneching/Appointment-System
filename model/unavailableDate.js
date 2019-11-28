const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var unavailableDateSchema = new Schema({
    momentDate1: String,
    stringDate1: String,
    momentDate2: String,
    stringDate2: String,
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor"
    }
});

unavailableDateSchema.statics.getUnavailableDateByID = async function(unavailableDateID){
    return await this.findOne({
        _id: unavailableDateID
    }); 
};

unavailableDateSchema.statics.addUnavailableDate = function(unavailableDate, callback){
    unavailableDate.save().then(callback);
};

unavailableDateSchema.statics.delete = async function(unavailableDateID){
    return await this.deleteOne({
        _id : unavailableDateID
    });
}

unavailableDateSchema.statics.updateUnavailableDate = async function(unavailableDateID, updated){
    return await this.updateOne({
        _id: unavailableDateID
    }, {
        momentDate1: updated.momentDate1,
        stringDate1: updated.stringDate1,
        momentDate2: updated.momentDate2,
        stringDate2: updated.stringDate2
    }, {
        new: true
    }); 
};

unavailableDateSchema.statics.getDoctorUnavailableDates = async function(doctorID){
    return await this.find({
        doctor:{
            "$in": [doctorID]
        }        
    }).sort({'stringDate1': 1});
};

unavailableDateSchema.methods.populateDoctor = async function(){
    return await Appointment.findOne({
        _id: this._id
    }).populate("doctor");
};

var UnavailableDate = mongoose.model("UnavailableDate", unavailableDateSchema);


module.exports = {
    UnavailableDate
}