const express = require("express");
const router = express.Router();
const fs = require('fs');
const {Account} = require("../model/account");
const initial = require("../model/file");

router.use("/secretary", require("./secretaryController"));
router.use("/admin", require("./adminController"));
router.use("/doctor", require("./doctorController"));

router.get("/", async (req, res) => {
    //username is subject to change
    let account = await Account.getAccountByUsername("admin");
    if(account == undefined) {
        Account.addAccount(new Account({
            username: "admin",
            password: initial.input,
            accountType: "admin",
            doctorID: ""
        }), (value) => {
            res.redirect("/login");
        }, (err) => {
            res.send(err);
        })
    } else {
        if(req.session.username == null) {
            res.redirect("/login");
        } else {
            let account = await Account.getAccountByUsername(req.session.username);
            if(account.accountType == "secretary") {
                res.redirect("/secretary");
            } else if(account.accountType == "admin") {
                res.redirect("/admin");
            } else if(account.accountType == "doctor") {
                res.redirect("/doctor");
            } 
        }
    }
})

router.get("/login", async (req, res) => {
    let acc = await Account.getAllAccounts();
    res.render("page_templates/login_view.hbs", {
        account: JSON.stringify(acc)
    })
})

router.post("/login", async (req, res) => {
    req.session.username = req.body.username;
    let account = await Account.getAccountByUsername(req.session.username);
    if(account.accountType == "secretary") {
        res.redirect("/secretary");
    } else if(account.accountType == "doctor") {

    } else if(account.accountType == "admin") {
        res.redirect("/admin");
    }
})

router.get("/logout", (req, res) => {
    req.session.username = null;
    res.redirect("/login");
})

module.exports = router;