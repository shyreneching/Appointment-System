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
    let accounts = await Account.getAllAccounts();
    let doctors = await Doctor.getAllDoctors();
    let processes = await Process.getAllProcesses();
    res.render("page_templates/admin_view.hbs", {
        user: accounts,
        dentist: doctors, 
        procedure: processes
    })
})

router.post("/user/edit", function(req, res) {
    Account.updateAccount(req.body.accountID, req.body.account);
    res.redirect("/");
})

router.post("/user/add", function(req, res) {
    Account.addAccount(req.body.account, function(account) {
        res.redirect("/");
    });
})

router.post("/user/delete", function(req, res) {
    Account.delete(req.body.accountID);
    res.redirect("/");
})

router.post("/dentist/edit", function(req, res) {
    Doctor.updateDoctor(req.body.doctorID, req.body.doctor);
    res.redirect("/");
})

router.post("/dentist/add", function(req, res) {
    Doctor.addDoctor(req.body.doctor, function(doctor) {
        res.redirect("/");
    });
})

router.post("/dentist/delete", function(req, res) {
    Doctor.delete(req.body.doctorID);
    res.redirect("/");
})

router.post("/procedure/edit", function(req, res) {
    Process.updateProcess(req.body.processID, req.body.process);
    res.redirect("/");
})

router.post("/procedure/add", function(req, res) {
    Process.addProcess(req.body.process, function(process) {
        res.redirect("/");
    })
})

router.post("/procedure/delete", function(req, res) {
    Process.delete(req.body.processID);
    res.redirect("/");
})

module.exports = router;
