const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended : true
});

const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");
const {Account} = require("../model/account");

router.get("/", async function(req, res) {
    let admin = await Account.getAccountByUsername("admin");
    if(req.session.username == "admin") {
        res.render("page_templates/admin-view.hbs", {
            password: admin.password
        });
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
    res.redirect("/adminUsers");
})

router.post("/addAccount", async function(req, res) {
    let user = await Account.getAccountByUsername(req.body.username);
    if(user == undefined) {
        Account.addAccount(new Account({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.type,
            doctorID: ""
        }), (value) => {
            res.send({message: true});
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({message: false});
    }
})

router.post("/deleteAccount", async function(req, res) {
    let account = await Account.getAccountByUsername(req.body.accountUsername);
    if(account.accountType == "dentist") {
        Doctor.delete(account.doctorID);
    } 
    Account.delete(req.body.accountID);
    res.send({message: true});
})

router.post("/editDentist", async function(req, res) {
    if(req.body.change == "status") {
        Doctor.updateDoctorStatus(req.body.doctorID, req.body.status);
        res.redirect("/adminDentist");
    } else if(req.body.change == "edit") {

    }
})

router.post("/addDentist", async function(req, res) {
    let user = await Account.getAccountByUsername(req.body.username);
    if(user == undefined) {
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
                res.send({message: true});
            }, (err) => {
                res.send(err);
            })
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({message: false});
    }
})

router.post("/editProcess", function(req, res) {
    Process.updateProcess(req.body.processID, req.body.process);
    res.redirect("/adminProcedure");
})

router.post("/addProcess", async function(req, res) {
    let process = await Process.findOne({
        processname: req.body.name
    });
    if(process == undefined) {
        Process.addProcess(new Process({
            processname: req.body.name
        }), (value) => {
            res.send({message: true});
        })
    } else {
        res.send({message: false});
    }
})

router.post("/deleteProcess", function(req, res) {
    Process.delete(req.body.processID);
    res.send({message: true});
})

router.get("/adminUsers", urlencoder, async (req, res) => {
    let accounts = await Account.getAccountWithoutAdmin();
    let template = fs.readFileSync('./views/module_templates/admin-users.hbs', 'utf-8');
    let sendData = {
        user: accounts
    }
    res.send({
        htmlData: template,
        data: sendData
    })
    
})

router.get("/adminDentist", urlencoder, async (req, res) => {
    let doctors = await Doctor.getAllDoctors();
    let template = fs.readFileSync('./views/module_templates/admin-dentist.hbs', 'utf-8');
    let sendData = {
        dentist: doctors
    }
    res.send({
        htmlData: template,
        data: sendData
    })
})

router.get("/adminProcedure", urlencoder, async (req, res) => {
    let processes = await Process.getAllProcesses();
    let template = fs.readFileSync('./views/module_templates/admin-procedure.hbs', 'utf-8');
    let sendData = {
        procedure: processes
    }
    res.send({
        htmlData: template,
        data: sendData
    })
})

module.exports = router;
