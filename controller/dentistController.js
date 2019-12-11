const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended : false
});

const {Account} = require("../model/account");
const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");

router.get("/", async function(req, res) {
    let dentist = await Account.getAccountByUsername(req.session.doctorUsername);
    if (req.session.doctorUsername != null) {
        res.render("page_templates/dentist_view.hbs", {
            id: dentist.doctorID
        });
    } else {
        res.redirect("/login");
    }
})

router.post("/getAppointment", async function(req, res) {
    let appointment = await Appointment.getAppointmentsByID(req.body.appID);
    res.send(await appointment.populateDoctorAndProcess());
})

router.get("/table_header", function (request, result) {
    let table_header = fs.readFileSync('./views/module_templates/dentist-table-header.hbs', 'utf-8');
    result.send(table_header);
});

router.post("/weekly_view", urlencoder, async function (request, result) {
    let dentist = await Account.getAccountByUsername(request.session.doctorUsername);

    // Get the date from sent data
    let date = Date.parse(request.body.date);

    // Load up the html template
    let all_day = fs.readFileSync('./views/module_templates/dentist-weekly-view.hbs', 'utf-8');

    var dates = [];
    var startOfWeek = moment(date).startOf('week');
    var endOfWeek = moment(date).endOf('week');

    var day = startOfWeek;
    while (day <= endOfWeek) {        
        let appntmts = await Appointment.getAppByDoctorandDate(dentist.doctorID, moment(day).format("MMM D YYYY"));
        let appointments = [];
        for (var k = 0; k < appntmts.length; k++) {
            let appointment = appntmts[k];
            //populate necessary info
            appointment = await appointment.populateDoctorAndProcess();
            appointments.push(appointment);
        }
        dates.push(new Object({
            dayCaps: moment(day).format("dddd").toUpperCase(),
            dateShort: moment(day).format("D MMM").toUpperCase(),
            appointment: appointments
        }));
        day = day.clone().add(1, 'd');
    }

    let final = {
        data: dates
    }

    result.send({
        htmlData: all_day,
        data: final
    })
    
});

module.exports = router;