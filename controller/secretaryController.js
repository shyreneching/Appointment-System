const express = require("express");
const router = express.Router();
const {Appointment} = require("../model/appointment");

router.get("/", (req, res) => {
    res.render("addappointment.hbs");
})

router.get("/appointmentlist", (req, res) => {
    Appointment.find({}, (err, docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.render("admin.hbs",{
                appointments: docs
            })
        }
    })
})

router.post("/create", (req, res) => {

    let patientname = req.body.pn
    let patientcontact = req.body.pc
    let process = req.body.pp
    let notes = req.body.note
    let time = req.body.time
    let date = req.body.date
    let doctor = req.body.doc
 
    console.log("hahaha")

    let appointment = new Appointment({
        patientname,
        patientcontact,
        process,
        notes,
        time,
        date,
        doctor
    })
    appointment.save().then(() => {
        res.session.msg = "Successfully added " + doc.patientname
        res.redirect("/")
    }, (err) => {
        res.send(err)
    })
})

router.get("/edit", (req, res)=>{
    //just find the user given the id
    console.log("GET /edit" + req.query.id)
    Appointment.findOne({
        _id: req.query.id

    }, (err, doc)=>{
        if(err){
            res.send(err)
        }else{
            console.log(doc)
            //send all the details of the user to edit.hbs
            res.render("edit.hbs", {
                appointment: doc
            })
        }
    })
})


router.post("/update", (req, res) => {
    Appointment.update({
        _id: req.body.id
    }, {
        patientname:  req.body.pn,
        patientcontact: req.body.pc,
        process: req.body.pp,
        notes: req.body.note,
        time: req.body.time,
        date: req.body.date,
        doctor: req.body.doc
    }, (err, doc)=>{
       if(err){
           res.send(err)
       }else{
           res.redirect("/")
       }
    })
})

router.post("/delete", (req, res) => {
    Appointment.deleteOne({
        _id: req.body.id
    }, (err, doc)=>{
       if(err){
           res.send(err)
       }else{
           //res.redirect("/users")
           res.send(doc)
       }
    })
})

module.exports = router;