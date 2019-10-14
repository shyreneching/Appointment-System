const mongoose = require("mongoose")

var Process = mongoose.model("process",{
    process: String

})


module.exports = {
   Process
}