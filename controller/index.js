const express = require("express");
const router = express.Router();
const fs = require('fs');
const {Account} = require("../model/account");

router.use("/secretary", require("./secretaryController"));
router.use("/admin", require("./adminController"));
router.use("/doctor", require("./doctorController"));

router.get("/", (req, res) => {
    //username is subject to change
    if(req.session.username == "secretary") {
        res.redirect("/secretary");
    } else if(req.session.username == "admin") {
        res.redirect("/admin");
    } else if(req.session.username == "doctor") {
        res.redirect("/doctor");
    } else {
        res.redirect("/login");
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
    if(req.body.username == "secretary") {
        res.redirect("/secretary");
    } else if(req.body.username == "doctor") {

    } else if(req.body.username == "admin") {
        res.redirect("/admin");
    }
})

router.get("/logout", (req, res) => {
    req.session.username = null;
    res.redirect("/login");
})

module.exports = router;