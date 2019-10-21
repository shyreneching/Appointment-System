const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var accountSchema = new Schema({
    username: String,
    password: String, 
    accountType: String,
    doctorID: String
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

accountSchema.statics.updateAccount = async function(accountID, updated){
    return await this.updateOne({
        _id: accountID
    }, {
        username,
        password,
        accountType
    }, {
        new: true
    }); 
};

accountSchema.statics.updateAdminPassword = async function(accountID, password) {
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