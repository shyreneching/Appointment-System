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
        let accounts = await Account.getAccountWithoutAdmin();
        let admin = await Account.getAccountByUsername("admin");
        let doctors = await Doctor.getAllDoctors();
        let processes = await Process.getAllProcesses();
        res.render("page_templates/admin_view.hbs", {
            user: accounts,
            dentist: doctors, 
            procedure: processes,
            password: admin.password
        })
    } else {
        res.redirect("/login");
    }
})

router.post("/updateAdminPassword", async function(req, res) {
    let admin = await Account.getAccountByUsername("admin");
    Account.updateAdminPassword(admin.id, req.body.newPassword);
    res.redirect("/");
})

router.post("/editAccount", function(req, res) {
    Account.updateAccount(req.body.accountID, req.body.account);
    res.redirect("/");
})

router.post("/addAccount", function(req, res) {
    Account.addAccount(new Account({
        username: req.body.username,
        password: req.body.password,
        accountType: req.body.type,
        doctorID: ""
    }), (value) => {
        res.redirect("/login");
    }, (err) => {
        res.send(err);
    })
})

router.post("/deleteAccount", async function(req, res) {
    let account = await Account.getAccountByUsername(req.body.accountUsername);
    Account.delete(req.body.accountID);
    if(account.accountType == "dentist") {
        Doctor.delete(account.doctorID);
    }
    res.redirect("/");
})

router.post("/editDentist", async function(req, res) {
    if(req.body.change == "status") {
        Doctor.updateDoctorStatus(req.body.doctorID, req.body.status);
        res.redirect("/");
    } else if(req.body.change == "edit") {

    }
})

router.post("/addDentist", function(req, res) {
    Doctor.addDoctor(new Doctor({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        status: req.body.status
    }), (value) => {
        Account.addAccount(new Account({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.type,
            doctorID: value.id
        }), (val) => {
            res.redirect("/login");
        }, (err) => {
            res.send(err);
        })
    }, (err) => {
        res.send(err);
    })
})

router.post("/editProcess", function(req, res) {
    Process.updateProcess(req.body.processID, req.body.process);
    res.redirect("/");
})

router.post("/addProcess", function(req, res) {
    Process.addProcess(new Process({
        processname: req.body.name
    }), (value) => {
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
