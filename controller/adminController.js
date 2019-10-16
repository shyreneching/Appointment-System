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

router.get("/", function(req, res) {
    res.redirect("/user");
})

router.get("/user", async function(req, res) {
    let account = new Account();
    let user = await account.getAllAccounts();
    //send the page
})

router.get("/dentist", async function(req, res) {
    let account = new Doctor();
    let user = await account.getAllDoctors();
    //send the page
})

router.get("/procedure", async function(req, res) {
    let account = new Process();
    let user = await account.getAllProcesses();
    //send the page;
})

router.post("/user/edit", function(req, res) {
    Account.updateAccount(req.body.accountID, req.body.account);
    res.redirect("/user");
})

router.post("/user/add", function(req, res) {
    Account.addAccount(req.body.account, function(account) {
        res.redirect("/user");
    });
})

router.post("/user/delete", function(req, res) {
    Account.delete(req.body.accountID);
    res.redirect("/user");
})

router.post("/dentist/edit", function(req, res) {
    Doctor.updateDoctor(req.body.doctorID, req.body.doctor);
    res.redirect("/dentist");
})

router.post("/dentist/add", function(req, res) {
    Doctor.addDoctor(req.body.doctor, function(doctor) {
        res.redirect("/dentist");
    });
})

router.post("/dentist/delete", function(req, res) {
    Doctor.delete(req.body.doctorID);
    res.redirect("/dentist");
})

router.post("/procedure/edit", function(req, res) {
    Process.updateProcess(req.body.processID, req.body.process);
    res.redirect("/procedure");
})

router.post("/procedure/add", function(req, res) {
    Process.addProcess(req.body.process, function(process) {
        res.redirect("/procedure");
    })
})

router.post("/procedure/delete", function(req, res) {
    Process.delete(req.body.processID);
    res.redirect("/procedure");
})

module.exports = router;
