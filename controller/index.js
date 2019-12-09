const express = require("express");
const router = express.Router();
const fs = require('fs');
const { Account } = require("../model/account");
const { Doctor } = require("../model/doctor");
const initial = require("../model/file");

router.use("/secretary", require("./secretaryController"));
router.use("/admin", require("./adminController"));
router.use("/dentist", require("./dentistController"));

router.get("/", async (req, res) => {
    //username is subject to change
    let account = await Account.getAccountByUsername("admin");
    if (account == undefined) {
        Account.addAccount(new Account({
            username: "admin",
            password: initial.admin,
            accountType: "admin",
            doctorID: ""
        }), (value) => {
            Account.addAccount(new Account({
                username: "secretary",
                password: initial.secretary,
                accountType: "secretary",
                doctorID: ""
            }), (val) => {
                res.redirect("/login");
            }, (err) => {   
                res.send(err);
            })    
        }, (err) => {   
            res.send(err);
        })
    } else {
        if (req.session.username == null) {
            res.redirect("/login");
        } else {
            let account = await Account.getAccountByUsername(req.session.username);
            if (account.accountType == "secretary") {
                res.redirect("/secretary");
            } else if (account.accountType == "admin") {
                res.redirect("/admin");
            } else if (account.accountType == "dentist") {
                res.redirect("/dentist");
            }
        }
    }
})

router.get("/login", async (req, res) => {
    // req.session.username = "admin";
    if (req.session.username != null) {
        if (req.session.username == "secretary") {
            res.redirect("/secretary");
        } else if (req.session.username == "dentist") {
            res.redirect("/dentist");
        } else if (req.session.username == "admin") {
            res.redirect("/admin");
        }
    } else {
        let acc = await Account.getAllAccounts();
        res.render("page_templates/login_view.hbs", {
            account: JSON.stringify(acc)
        })
    }
})

router.post("/validateLogin", async (req, res) => {
    var account = await Account.getAccountByUsername(req.body.username);
    if (account != undefined) {
        account = await Account.authenticate(account.username, req.body.password, account.salt);
        if (account != undefined) {
            req.session.username = account.accountType;
            if(account.accountType == "dentist") {
                req.session.doctorUsername = req.body.username;
                Doctor.updateLogin(account.doctorID, req.body.date);
            }
            res.send({ message: 1 });
        } else {
            res.send({ message: 2 })
        }
    } else {
        res.send({ message: 0 });
    }
})

router.get("/logout", (req, res) => {
    req.session.username = null;
    req.session.doctorUsername = null;
    req.session.id = null
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    res.redirect("/login");
})

module.exports = router;