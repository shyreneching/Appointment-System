const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const urlencoder = bodyParser.urlencoded({
    extended: false
}) 

const session = require("express-session");
const path = require("path");
var app = new express();

mongoose.Promise = global.Promise
const MONGOLAB_URI = process.env.MONGOLAB_URI || "mongodb://localhost:27017/appointmentsys"

mongoose.connect(MONGOLAB_URI, {
    useNewUrlParser: true
  }).catch(err => console.log(err))

app.use(urlencoder);
app.use(session({
    resave: true,
    name: "appointment-system",
    saveUninitialized: true, 
    secret: "secretpass"
}))
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(require("./controller"));

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000...");
})

