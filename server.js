const express = require("express");
const bodyParser = require("body-parser");
const urlencoder = bodyParser.urlencoded({
    extended: false
})

const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
var app = new express();

app.use(cookieParser());
app.use(urlencoder);
app.use(session({
    resave: true,
    name: "appointment-system",
    saveUninitialized: true, 
    secret: "secretpass",
    cookie: {
        maxAge: 100*60*60*1000
    }
}))
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(require("./controller"));

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000...");
})

