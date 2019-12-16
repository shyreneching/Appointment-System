const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended: false
});

const {Account} = require("../model/account");
const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");

router.get("/", async function (req, res) {
    let dentist = await Account.getAccountByUsername(req.session.doctorUsername);
    if (req.session.doctorUsername != null) {
        res.render("page_templates/dentist_view.hbs", {
            id: dentist.doctorID
        });
    } else {
        res.redirect("/login");
    }
})

router.post("/getAppointment", async function (req, res) {
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
        // let appntmts = await Appointment.getAppByDoctorandDate(dentist.doctorID, moment(day).format("MMM D YYYY"));
        let timeSlotsArray = ["8:00 AM", "8:30 AM",
            "9:00 AM", "9:30 AM",
            "10:00 AM", "10:30 AM",
            "11:00 AM", "11:30 AM",
            "12:00 PM", "12:30 PM",
            "1:00 PM", "1:30 PM",
            "2:00 PM", "2:30 PM",
            "3:00 PM", "3:30 PM",
            "4:00 PM", "4:30 PM",
            "5:00 PM", "5:30 PM",
            "6:00 PM"
        ];

        let appntmts = [];
        for (var i = 0; i < timeSlotsArray.length; i++) {
            let timeSlot = timeSlotsArray[i];
            // get all appointments in this date and time slot
            let appointment = await Appointment.getOneAppByDoctorandDateandTime(dentist.doctorID, moment(day).format("MMM D YYYY"), timeSlot);
            if(appointment != null){
                //populate necessary info
                appointment = await appointment.populateDoctorAndProcess();
                appntmts.push(appointment);
            }
        }
         
        dates.push(new Object({
            dayCaps: moment(day).format("dddd").toUpperCase(),
            dateShort: moment(day).format("D MMM").toUpperCase(),
            appointment: appntmts
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

router.get("/getCurrentDentist", async (req, res) => {
    var account = await Account.findOne({username: req.session.doctorUsername});
    var doctor = await Doctor.findOne({_id: account.doctorID});
    res.send(doctor);
})

module.exports = router;