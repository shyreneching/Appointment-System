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

    // Array for iterating time slots
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
        "6:00 PM"];

    // let dataArray = [];
    // for (var i = 0; i < timeSlotsArray.length; i++) {
    //     let timeSlot = timeSlotsArray[i];
    //     // get all appointments in this date and time slot
    //     let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
    //     let appointments = [];
    //     for (var k = 0; k < appointmentlist.length; k++) {
    //         let appointment = appointmentlist[k];
    //         //populate necessary info
    //         appointment = await appointment.populateDoctorAndProcess();
    //         appointments.push(appointment);
    //     }

    //     let data = {
    //         appointments: appointments
    //     };

    //     dataArray.push(data);
    // }

    var dates = [];
    var startOfWeek = moment(date).startOf('week');
    var endOfWeek = moment(date).endOf('week');

    var day = startOfWeek;
    while (day <= endOfWeek) {
        dates.push(new Object({
            dayCaps: moment(day).format("ddd").toUpperCase(),
            dateShort: moment(day).format("D MMM").toUpperCase()
        }));
        day = day.clone().add(1, 'd');
    }
    var apps = []

    var findAllAppointments = new Promise(async (resolve, reject) => {
        dates.forEach(async (date, index, array) => {
            var d = await Appointment.getAppByDoctorandDate(dentist.doctorID, moment(date).format("MMM D YYYY"))
            var populatedAppointments = []

            for(var i = 0; i < d.length; i++){
                d[i] = await d[i].populateDoctorAndProcess()
                populatedAppointments.push(d[i])
            }
            
            apps.push(populatedAppointments)
            if (index === array.length -1) resolve();
        });
    });

  
    

    findAllAppointments.then(() => {
        let final = {
            sun: moment(dates[0]).format("D MMM"),
            mon: moment(dates[1]).format("D MMM"),
            tue: moment(dates[2]).format("D MMM"),
            wed: moment(dates[3]).format("D MMM"),
            thu: moment(dates[4]).format("D MMM"),
            fri: moment(dates[5]).format("D MMM"),
            sat: moment(dates[6]).format("D MMM"),
            appointments:apps
        }
    
        result.send({
            htmlData: all_day,
            data: final
        });
    });
    
    
});

module.exports = router;