const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended : true
});

const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");
const {Account} = require("../model/account");

router.get("/", async (req, res) => {
    let admin = await Account.getAccountByUsername("admin");
    if(req.session.username == "admin") {
        res.render("page_templates/admin-view.hbs", {
            password: admin.password
        });
    } else {
        res.redirect("/login");
    }
})

router.post("/updateAccountPassword", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if(req.body.username == "admin") {
        Account.updateAccount(account.id, req.body.newPassword);
        res.send({message: true});
    } else {
        if(account == undefined) {
            res.send({message: false});
        } else {
            Account.updateAccount(account.id, req.body.newPassword);
            res.send({message: true});
        }
    }
})

router.post("/editAccount", (req, res) => {
    Account.updateAccount(req.body.accountID, req.body.accountPassword);
    res.send(true);
})

router.post("/addAccount", async (req, res) => {
    let user = await Account.getAccountByUsername(req.body.username);
    if(user == undefined) {
        Account.addAccount(new Account({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.type,
            doctorID: "",
            lastLogin: ""
        }), (value) => {
            res.send({message: true});
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({message: false});
    }
})

router.post("/deleteAccount", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.accountUsername);
    if(account.accountType == "dentist") {
        Doctor.delete(account.doctorID);
    } 
    Account.delete(req.body.accountID);
    res.send({message: true});
})

router.post("/validateUsername", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if(account == undefined) {
        res.send({message: false});
    } else {
        res.send({message: true});
    }
})

router.post("/editDentist", async (req, res) => {
    let account = await Account.findOne({_id: req.body.accountID});
    Account.updateAccount(account.id, req.body.password);
    Doctor.updateDoctor(account.doctorID, req.body.firstname, req.body.lastname);
    res.send(true);
})

router.post("/addDentist", async (req, res) => {
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

router.post("/editProcess", async (req, res) => {
    let process = await Process.findOne({processname: req.body.name});
    if(process == undefined || process._id == req.body.procedureID) {
        Process.updateProcess(req.body.procedureID, req.body.name);
        res.send({message: true});
    } else {
        res.send({message: false});
    }
})

router.post("/addProcess", async (req, res) => {
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

router.post("/deleteProcess", (req, res) => {
    Process.delete(req.body.processID);
    res.send({message: true});
})

router.post("/getUser", async (req, res) => {
    let user = await Account.findOne({username: req.body.username});
    let doctor;
    if(user.doctorID != "") {
        doctor = await Doctor.getDoctorByID(user.doctorID);
    }
    res.send({
        user,
        doctor
    });
})

router.post("/filterUser", async (req, res) => {
    let account;
    if(req.body.userType == "all") {
        account = await Account.getAccountWithoutAdmin();
    } else if (req.body.userType == "secretary") {
        account = await Account.getSecretary();
    } else if(req.body.userType == "dentist") {
        account = await Account.getDentist();
    }
    let table = fs.readFileSync('./views/module_templates/admin-users-table.hbs', 'utf-8');
    let sendData = {
        user: account
    }
    res.send({
        htmlData: table,
        data: sendData
    })
})

router.get("/adminUsers", urlencoder, async (req, res) => {
    let accounts = await Account.getAccountWithoutAdmin();
    let header = fs.readFileSync('./views/module_templates/admin-users.hbs', 'utf-8');
    let table = fs.readFileSync('./views/module_templates/admin-users-table.hbs', 'utf-8');
    let sendData = {
        user: accounts
    }
    res.send({
        htmlData: {
            header,
            table
        },
        data: sendData
    })
    
})

router.get("/adminDentist", urlencoder, async (req, res) => {
    let doctors = await Doctor.getAllDoctors();
    let header = fs.readFileSync('./views/module_templates/admin-dentist.hbs', 'utf-8');
    let table = fs.readFileSync('./views/module_templates/admin-dentist-table.hbs', 'utf-8');
    let sendData = {
        dentist: doctors
    }
    res.send({
        htmlData: {
            header,
            table
        },
        data: sendData
    })
})

router.get("/adminProcedure", urlencoder, async (req, res) => {
    let processes = await Process.getAllProcesses();
    let header = fs.readFileSync('./views/module_templates/admin-procedure.hbs', 'utf-8');
    let table = fs.readFileSync('./views/module_templates/admin-procedure-table.hbs', 'utf-8');
    let sendData = {
        procedure: processes
    }
    res.send({
        htmlData: {
            header,
            table
        },
        data: sendData
    })
})

module.exports = router;
