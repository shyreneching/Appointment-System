const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//If no break for the day array = none
var breakTimeSchema = new Schema({
    sunday: Array,
    monday: Array,
    tuesday: Array,
    wednesday: Array,
    thursday: Array,
    friday: Array,
    saturday: Array
})


breakTimeSchema.statics.getBreakTimeByID = async function(breakTimeID){
    return await this.findOne({
        _id: breakTimeID
    }); 
};

breakTimeSchema.statics.addBreakTime = function(breakTime, callback){
    breakTime.save().then(callback);
};


breakTimeSchema.statics.delete = async function(breakTimeID){
    return await this.deleteOne({
        _id : breakTimeID
    });
}

breakTimeSchema.statics.updateBreakTime = async function(breakTimeID, breakTime){
    return await this.updateOne({
        _id: breakTimeID
    }, {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday
    }, {
        new: true
    }); 
};

breakTimeSchema.statics.findLast = async function(){
    return await this.find({}).sort({_id:-1}).limit(1);
};

var BreakTime= mongoose.model("BreakTime", breakTimeSchema)

module.exports = {
    BreakTime
}