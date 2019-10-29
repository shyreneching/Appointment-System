const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var unavailableDateSchema = new Schema({
    momentTo: String,
    stringTo: String,
    momentFrom: String,
    momentTo: String,
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor"
    }
});

unavailableDateSchema.statics.addUnavailableDate = function(unavailableDate, callback){
    unavailableDate.save().then(callback);
};

unavailableDateSchema.statics.delete = async function(unavailableDateID){
    return await this.deleteOne({
        _id : unavailableDateID
    });
}

unavailableDateSchema.statics.updateDoctor = async function(unavailableDateID, updated){
    return await this.updateOne({
        _id: unavailableDateID
    }, {
        momentTo,
        stringTo,
        momentFrom,
        momentTo
    }, {
        new: true
    }); 
};

var UnavailableDate = mongoose.model("UnavailableDate", unavailableDateSchema);


module.exports = {
    UnavailableDate
}