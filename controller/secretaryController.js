const express = require("express");
const router = express.Router();
const {Appointment} = require("../model/appointment");

router.get("/", (req, res) => {
    res.render("addappointment.hbs");
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

router.post("/update", (req, res) => {

})

router.post("/delete", (req, res) => {

})

module.exports = router;