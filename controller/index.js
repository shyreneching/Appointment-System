const express = require("express");
const router = express.Router();
const model = require("../model/appointment");

router.use("/appointment", require("./appointment"));

router.get("/", (req, res) => {
    
})

router.get("/home", (req, res) => {
    
})

router.get("/schedule", (req, res) => {
    
})

module.exports = router;