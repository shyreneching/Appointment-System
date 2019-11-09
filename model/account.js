const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var accountSchema = new Schema({
    username: String,
    password: String, 
    accountType: String,
    doctorID: String,
    lastLogin: String
})

accountSchema.statics.addAccount = function(account, callback){
    account.save().then(callback);
};

accountSchema.statics.getAllAccounts = async function(){
    return await this.find();
}

accountSchema.statics.getAccountByUsername = async function(username){
    return await this.findOne({
        username: username
    });
}

accountSchema.statics.getAccountWithoutAdmin = async function(){
    return await this.find({
        username: {$ne: "admin"}
    });
}

accountSchema.statics.delete = async function(accountID){
    return await this.deleteOne({
        _id : accountID
    });
}

accountSchema.statics.updateAccount = async function(accountID, username, password){
    return await this.updateOne({
        _id: accountID
    }, {
        username,
        password
    }, {
        new: true
    }); 
};

accountSchema.statics.updateLogin = async function(accountID, lastLogin) {
    return await this.updateOne({
        _id: accountID
    }, { $set: {
        lastLogin
    }})
}

accountSchema.statics.updatePassword = async function(accountID, password) {
    return await this.updateOne({
        _id: accountID
    }, { $set: {
        password
    }})
}

var Account = mongoose.model("account", accountSchema)

module.exports = {
    Account
}