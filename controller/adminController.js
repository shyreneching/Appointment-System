const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended : false
});

const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");
const {Account} = require("../model/account");

router.get("/", async function(req, res) {
    if(req.session.username == "admin") {
        let accounts = await Account.getAllAccounts();
        let doctors = await Doctor.getAllDoctors();
        let processes = await Process.getAllProcesses();
        res.render("page_templates/admin_view.hbs", {
            user: accounts,
            dentist: doctors, 
            procedure: processes
        })
    } else {
        res.redirect("/login");
    }
})

router.post("/editAccount", function(req, res) {
    Account.updateAccount(req.body.accountID, req.body.account);
    res.redirect("/");
})

router.post("/addAccount", function(req, res) {
    // Account.addAccount(req.body.account, function(account) {
    //     res.redirect("/");
    // });
    let account = new Account({
        username: "admin",
        password: "@dmin"
    })
    Account.addAccount(account, (value) => {
        res.redirect("/");  
    }, (err) => {
        res.send(err);
    })
})

router.post("/deleteAccount", function(req, res) {
    Account.delete(req.body.accountID);
    res.redirect("/");
})

router.post("/editDentist", function(req, res) {
    Doctor.updateDoctor(req.body.doctorID, req.body.doctor);
    res.redirect("/");
})

router.post("/addDentist", function(req, res) {
    // Doctor.addDoctor(req.body.doctor, function(doctor) {
    //     res.redirect("/");
    // });
    let doctor = new Doctor({
        firstname: "Stanley",
        lastname: "Sie"
    });
    Doctor.addDoctor(doctor, (value) => {
        res.redirect("/");
    }, (err) => {
        res.send(err);
    })
})

router.post("/deleteDentist", function(req, res) {
    Doctor.delete(req.body.doctorID);
    res.redirect("/");
})

router.post("/editProcess", function(req, res) {
    Process.updateProcess(req.body.processID, req.body.process);
    res.redirect("/");
})

router.post("/addProcess", function(req, res) {
    // Process.addProcess(req.body.process, function(process) {
    //     res.redirect("/");
    // })
    let process = new Process({
        processname: "Tooth Removal"
    });
    Process.addProcess(process, (value) => {
        res.redirect("/");
    }, (err) => {
        res.send(err);
    })
})

router.post("/deleteProcess", function(req, res) {
    Process.delete(req.body.processID);
    res.redirect("/");
})

module.exports = router;
