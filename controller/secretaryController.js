const express = require("express");
const router = express.Router();
const moment = require('moment');
const momentbusinesstime = require('moment-business-time');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended: true
});

// router.get("/", (req, res) => {
//     res.render("addappointment.hbs");
// })
// External files imports

const { Appointment } = require("../model/appointment");
const { Doctor } = require("../model/doctor");
const { Process } = require("../model/process");
const { Schedule } = require("../model/schedule");
const { BreakTime } = require("../model/breaktime");
const { UnavailableDate } = require("../model/unavailableDate");

/* 
    Ty Added :)
*/

router.get("/", async function (req, res) {
    if (req.session.username != null) {
        let doctor = await Doctor.getAllDoctors();
        let process = await Process.getAllProcesses();
        res.render('page_templates/secretary_view.hbs', {
            doctor: doctor,
            process: process
        });
    } else {
        res.redirect("/login");
    }
});

/*
    Getting templates for filtering 
*/
router.post("/week_all", urlencoder, async function (request, result) {

    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for (var i = 0; i < weekData.length; i++) {
        let newDate = Date.parse(weekData[i]);
        let formattedDate = moment(newDate).format("MMM D YYYY");
        formattedWeekData.push(formattedDate);
    }

    // Load up the html template
    let all_week = fs.readFileSync('./views/module_templates/secretary_week_all.hbs', 'utf-8');

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

    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAppointments = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++) {
            let date = formattedWeekData[k].toString();


            // find all appointments in a date in a timeslot
            let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
            let appointments = [];
            for (var l = 0; l < appointmentlist.length; l++) {
                let appointment = appointmentlist[l];
                //populate necessary info
                appointment = await appointment.populateDoctorAndProcess();
                appointments.push(appointment);
            }

            if (appointmentlist.length > maxInWeek) {
                maxInWeek = appointmentlist.length;
            }

            // put in array of week appointments in a time slot
            let dayInWeek = {
                num: appointmentlist.length,
                appointments: appointments
            }

            weekAppointments.push(dayInWeek);
        }


        let data = {
            slot: timeSlot,
            max: maxInWeek,
            weekAppointments: weekAppointments
        };

        dataArray.push(data);
    }

    let final = {
        data: dataArray
    }


    result.send({
        htmlData: all_week,
        data: final
    });
});

router.post("/week_one", urlencoder, async function (request, result) {
    let weekData = request.body["dates[]"];
    let doctorID = request.body.doctor;

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for (var i = 0; i < weekData.length; i++) {
        let newDate = Date.parse(weekData[i]);
        let formattedDate = moment(newDate).format("MMM D YYYY");
        formattedWeekData.push(formattedDate);
    }

    // Load up the html template
    let one_doc = fs.readFileSync('./views/module_templates/secretary_week_one_doctor.hbs', 'utf-8');

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

    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAppointments = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++) {
            let date = formattedWeekData[k].toString();


            // find all appointments in a date in a timeslot
            let appointmentlist = await Appointment.getAppByDoctorandDateandTime(doctorID, date, timeSlot);
            let appointments = [];
            for (var l = 0; l < appointmentlist.length; l++) {
                let appointment = appointmentlist[l];
                //populate necessary info
                appointment = await appointment.populateDoctorAndProcess();
                appointments.push(appointment);
            }

            if (appointmentlist.length > maxInWeek) {
                maxInWeek = appointmentlist.length;
            }

            // put in array of week appointments in a time slot
            let dayInWeek = {
                num: appointmentlist.length,
                appointments: appointments
            }

            weekAppointments.push(dayInWeek);
        }


        let data = {
            slot: timeSlot,
            max: maxInWeek,
            weekAppointments: weekAppointments
        };

        dataArray.push(data);
    }

    let final = {
        data: dataArray
    }


    result.send({
        htmlData: one_doc,
        data: final
    });

});

router.post("/week_unavailable", async function (request, result) {
    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for (var i = 0; i < weekData.length; i++) {
        let newDate = Date.parse(weekData[i]);
        let formattedDate = moment(newDate).format("MMM D YYYY");
        formattedWeekData.push(formattedDate);
    }

    // Load up the html template
    let week_unavailable = fs.readFileSync('./views/module_templates/secretary_week_unavail.hbs', 'utf-8');

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

    let doctorsArray = await Doctor.getAllDoctors();
    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekUnavailable = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++) {
            let date = formattedWeekData[k].toString();

            let unavs = [];

            for (var l = 0; l < doctorsArray.length; l++) {
                let doctorID = doctorsArray[l]._id;
                let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, date, timeSlot);

                if (appointment) {
                    let unavDoctor = await Doctor.getDoctorByID(doctorID);
                    unavs.push(unavDoctor);
                }
            }

            if (unavs.length > maxInWeek) {
                maxInWeek = unavs.length;
            }

            // put in array of week appointments in a time slot
            let dayInWeek = {
                num: unavs.length,
                doctors: unavs
            }

            weekUnavailable.push(dayInWeek);
        }


        let data = {
            slot: timeSlot,
            max: maxInWeek,
            weekUnavailable: weekUnavailable
        };

        dataArray.push(data);
    }

    let final = {
        data: dataArray
    }


    result.send({
        htmlData: week_unavailable,
        data: final
    });
});

router.post("/week_available", async function (request, result) {

    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for (var i = 0; i < weekData.length; i++) {
        let newDate = Date.parse(weekData[i]);
        let formattedDate = moment(newDate).format("MMM D YYYY");
        formattedWeekData.push(formattedDate);
    }

    // Load up the html template
    let week_available = fs.readFileSync('./views/module_templates/secretary_week_avail.hbs', 'utf-8');

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

    let doctorsArray = await Doctor.getAllDoctors();
    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAvailable = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++) {
            let date = formattedWeekData[k].toString();

            let avs = [];

            for (var l = 0; l < doctorsArray.length; l++) {
                let doctorID = doctorsArray[l]._id;
                let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, date, timeSlot);

                if (appointment) {

                } else {
                    let avDoctor = await Doctor.getDoctorByID(doctorID);
                    avs.push(avDoctor);
                }
            }

            if (avs.length > maxInWeek) {
                maxInWeek = avs.length;
            }

            // put in array of week appointments in a time slot
            let dayInWeek = {
                num: avs.length,
                doctors: avs
            }

            weekAvailable.push(dayInWeek);
        }


        let data = {
            slot: timeSlot,
            max: maxInWeek,
            weekAvailable: weekAvailable
        };

        dataArray.push(data);
    }

    let final = {
        data: dataArray
    }


    result.send({
        htmlData: week_available,
        data: final
    });

});

router.get("/table_header", function (request, result) {
    let table_header = fs.readFileSync('./views/module_templates/secretary_weekdates.hbs', 'utf-8');
    result.send(table_header);
});

router.post("/day_all", urlencoder, async function (request, result) {

    // Get the date from sent data
    let date = request.body.date;

    // Load up the html template
    let all_day = fs.readFileSync('./views/module_templates/secretary_day_all.hbs', 'utf-8');

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

    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot
        let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
        let appointments = [];
        for (var k = 0; k < appointmentlist.length; k++) {
            let appointment = appointmentlist[k];
            //populate necessary info
            appointment = await appointment.populateDoctorAndProcess();
            appointments.push(appointment);
        }

        let data = {
            slot: timeSlot,
            appointments: appointments
        };

        dataArray.push(data);
    }

    let final = {
        data: dataArray
    }

    result.send({
        htmlData: all_day,
        data: final
    });
});

router.post("/day_one", urlencoder, async function (request, result) {
    // Get the date from sent data
    let date = request.body.date;
    let doctorID = request.body.doctor;

    // Load up the html template
    let one_day_doc = fs.readFileSync('./views/module_templates/secretary_day_one_doc.hbs', 'utf-8');

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

    let dataArray = [];
    for (var i = 0; i < timeSlotsArray.length; i++) {
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot
        let appointmentlist = await Appointment.getAppByDoctorandDateandTime(doctorID, date, timeSlot);
        let appointments = [];
        for (var k = 0; k < appointmentlist.length; k++) {
            let appointment = appointmentlist[k];
            //populate necessary info
            appointment = await appointment.populateDoctorAndProcess();
            appointments.push(appointment);
        }

        let data = {
            slot: timeSlot,
            appointments: appointments
        };

        dataArray.push(data);
    }

    let doctorFound = await Doctor.getDoctorByID(doctorID);
    let final = {
        doctor: doctorFound,
        data: dataArray
    }

    result.send({
        htmlData: one_day_doc,
        data: final
    });
});

router.post("/check_valid_appointment", urlencoder, async function (request, result) {
    // Get the date from sent data
    let date = request.body.date;
    let time = request.body.time;
    let doctors = request.body.doctors;
    console.log(date);
    console.log(time);
    console.log(doctors);



    result.send("Something");
});
/*
    End of Templates
*/

router.post("/getAppointment", urlencoder, async (req, res) => {
    let appID = req.body.appointmentID;

    let appointment = await Appointment.getAppointmentsByID(appID);
    res.send(appointment);
})

/*
    Temporary doctor adding routes for testing purposes, remove when done
*/

router.get("/adddoc", (req, res) => {
    // let doctor = new Doctor({
    //     firstname: "Jiminey",
    //     lastname: "Cricket"
    // });
    // Doctor.addDoctor(doctor, function(doctor){
    //     res.send(doctor);
    // }, (error)=>{
    //     res.send(error);
    // })
})

router.get("/addproc", (req, res) => {
    // let process = new Process({
    //     processname: "Tartar Removal"
    // });
    // Process.addProcess(process, function(process){
    //     res.send(process);
    // }, (error)=>{
    //     res.send(error);
    // })
})

/*
    End of Temp
*/

router.get("/appointmentlist", (req, res) => {
    Appointment.find({}, (err, docs) => {
        if (err) {
            res.send(err)
        }
        else {
            res.render("admin.hbs", {
                appointments: docs
            })
        }
    })
})
//Get available doctors by getting the appointment dates and if 
//wala siyang appointment on the time slot, it will mean available
router.post("/create", urlencoder, (req, res) => {

    let firstname = req.body.firstName;
    let lastname = req.body.lastName;
    let patientcontact = req.body.contact;
    let process = req.body["procedures[]"];
    let notes = req.body.notes;
    let time = req.body.timeInput;
    let date = req.body.dateInput;
    let doctor = req.body["doctors[]"];

    console.log(time);
    console.log(date);
    let newTime = Date.parse(time);
    let formattedTime = moment(newTime).format("h:mm A");

    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("MMM D YYYY");


    let appointment = new Appointment({
        firstname,
        lastname,
        patientcontact,
        process,
        notes,
        time: formattedTime,
        date: formattedDate,
        doctor
    });

    Appointment.addAppointment(appointment, function (appointment) {
        if (appointment) {
            res.redirect("/secretary");
        } else {
            res.redirect("/");
        }

    }, (error) => {
        res.send(error);
    })
})

router.post("/edit", urlencoder, async (req, res) => {
    let appointmentID = req.body.appointmentID;
    let firstname = req.body.firstName;
    let lastname = req.body.lastName;
    let patientcontact = req.body.contact;
    let process = req.body["procedures[]"];
    let notes = req.body.notes;
    let time = req.body.timeInput;
    let date = req.body.dateInput;
    let doctor = req.body["doctors[]"];

    console.log(time);
    console.log(date);
    let newTime = Date.parse(time);
    let formattedTime = moment(newTime).format("h:mm A");

    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("MMM D YYYY");


    let appointment = new Appointment({
        firstname,
        lastname,
        patientcontact,
        process,
        notes,
        time: formattedTime,
        date: formattedDate,
        doctor
    });

    let newApp = await Appointment.updateAppointment(appointmentID, appointment);

    res.send("Success");
})


router.post("/check_app_exists", urlencoder, async (req, res) => {
    let time = req.body.timeInput;
    let date = req.body.dateInput;
    let doctor = req.body["doctors[]"];

    let newTime = Date.parse(time);
    let formattedTime = moment(newTime).format("h:mm A");

    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("MMM D YYYY");

    let found = false;

    if (typeof doctor === 'object') {
        for (var i = 0; i < doctor.length; i++) {
            let doctorID = doctor[i];
            let appointment = await Appointment.getAppByDoctorandDateandTime(doctorID, formattedDate, formattedTime);

            if (appointment.length != 0) {
                found = true;
            }
        }
    } else {
        let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctor, formattedDate, formattedTime);

        if (appointment) {
            found = true;
        }
    }

    res.send(found);
});

router.post("/delete", urlencoder, async (req, res) => {
    let appID = req.body.appointmentID;

    await Appointment.delete(appID);

    res.send("Success");
})

// get available time of the doctor given doctorID and date
router.get("/getAvailable", async (req, res) => {

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

    let doctorID = req.body.doctorID;
    let doctor = await Doctor.getDoctorByID(doctorID);
    let docSched = await Schedule.getScheduleByID(doctor.schedule);
    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);
    let breaktime = await BreakTime.getBreakTimeByID(doctor.breakTime);

    // date = what date is the appointment
    let date = req.body.dateInput;
    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("YYYY-MM-DD");

    let dataArray = [];

    moment.updateLocale('en', {
        workinghours: {
            0: docSched.sunday,
            1: docSched.monday,
            2: docSched.tuesday,
            3: docSched.wednesday,
            4: docSched.thursday,
            5: docSched.friday,
            6: docSched.saturday
        }
    });

    var breakstart = "19:00:00";
    var breakend = "19:00:00";

    // gets the 'breaktime' of the doctor
    if (moment(formattedDate).isoWeekday() == 1 && breaktime.monday != "") {
        var breakstart = breaktime.monday[0];
        var breakend = breaktime.monday[1];
    } else if (moment(formattedDate).isoWeekday() == 2 && breaktime.tuesday != "") {
        var breakstart = breaktime.tuesday[0];
        var breakend = breaktime.tuesday[1];
    } else if (moment(formattedDate).isoWeekday() == 3 && breaktime.wednesday != "") {
        var breakstart = breaktime.wednesday[0];
        var breakend = breaktime.wednesday[1];
    } else if (moment(formattedDate).isoWeekday() == 4 && breaktime.thursday != "") {
        var breakstart = breaktime.thursday[0];
        var breakend = breaktime.thursday[1];
    } else if (moment(formattedDate).isoWeekday() == 5 && breaktime.friday != "") {
        var breakstart = breaktime.friday[0];
        var breakend = breaktime.friday[1];
    } else if (moment(formattedDate).isoWeekday() == 6 && breaktime.saturday != "") {
        var breakstart = breaktime.saturday[0];
        var breakend = breaktime.saturday[1];
    } else if (moment(formattedDate).isoWeekday() == 7 && breaktime.sunday != "") {
        var breakstart = breaktime.sunday[0];
        var breakend = breaktime.sunday[1];
    }

    let breakstartFormat = moment(formattedDate + ' ' + breakstart, 'YYYY-MM-DD HH:mm');
    let breakendFormat = moment(formattedDate + ' ' + breakend, 'YYYY-MM-DD HH:mm');

    var dates = []; 
    if (doctorUnAvail != "") {
        for(var k = 0; k < doctorUnAvail.length; k++){
            var start = new Date(doctorUnAvail[k].stringDate1);
            let startformattedDate = moment(start).format("YYYY-MM-DD");
            var end = new Date(doctorUnAvail[k].stringDate2);
            let endformattedDate = moment(end).format("YYYY-MM-DD");

            // console.log("DOCTOR:" + doctor.firstname + "-------" + startformattedDate)
            // console.log("DOCTOR:" + doctor.firstname + "-------" + endformattedDate)
            var getDates = function(startDate, endDate) {
                var dates = [],
                    currentDate = startDate,
                    addDays = function(days) {
                        var date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    };
                while (currentDate <= endDate) {
                    dates.push(currentDate);
                    currentDate = addDays.call(currentDate, 1);
                }
                return dates;
                };
                
                // Usage
                dates = getDates(new Date(startformattedDate), new Date(endformattedDate));                                                                                                           
        }  
    }

    var something = dates.filter((value) => {
        return moment(value).format("YYYY-MM-DD") == formattedDate;
    })           

    //Checks if the dentist is available based on schedule
    if (moment(formattedDate).isWorkingDay()) {
        for (var i = 0; i < timeSlotsArray.length; i++) {
            let timeSlot = timeSlotsArray[i];

            let newTime = Date.parse(timeslot);
            let formattedTime = moment(newTime).format("HH:mm");

            let datetime = moment(formattedDate + ' ' + formattedTime, 'YYYY-MM-DD HH:mm');

            let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, formattedDate, formattedTime);

            // if working time of dentist and the time is not in the 'break time' adds to the list of available times
            if (moment(datetime.format('YYYY-MM-DD HH:mm')).isWorkingTime() && something == ""
            && !(moment(datetime.format('YYYY-MM-DD HH:mm')).isBetween(breakstartFormat.format('YYYY-MM-DD HH:mm'), breakendFormat.format('YYYY-MM-DD HH:mm'), 'minute')) && appointment == "") {
                let data = {
                    slot: timeSlot,
                };

                dataArray.push(data);
            }
        }
    }
    result.send({ /* Send the available time somewhere*/
        htmlData: all_day,
        data: dataArray
    });
})

// get unavailable time of the doctor given doctorID and date
router.get("/getUnavailable", async (req, res) => {

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

    let doctorID = req.body.doctorID;
    let doctor = await Doctor.getDoctorByID(doctorID);
    let docSched = await Schedule.getScheduleByID(doctor.schedule);
    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);
    let breaktime = await BreakTime.getBreakTimeByID(doctor.breakTime);

    // date = what date is the appointment
    let date = req.body.dateInput;
    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("YYYY-MM-DD");

    let dataArray = [];

    moment.updateLocale('en', {
        workinghours: {
            0: docSched.sunday,
            1: docSched.monday,
            2: docSched.tuesday,
            3: docSched.wednesday,
            4: docSched.thursday,
            5: docSched.friday,
            6: docSched.saturday
        }
    });
    var breakstart = "19:00:00";
    var breakend = "19:00:00";

   // gets the 'breaktime' of the doctor
    if (moment(formattedDate).isoWeekday() == 1 && breaktime.monday != "") {
        var breakstart = breaktime.monday[0];
        var breakend = breaktime.monday[1];
    } else if (moment(formattedDate).isoWeekday() == 2 && breaktime.tuesday != "") {
        var breakstart = breaktime.tuesday[0];
        var breakend = breaktime.tuesday[1];
    } else if (moment(formattedDate).isoWeekday() == 3 && breaktime.wednesday != "") {
        var breakstart = breaktime.wednesday[0];
        var breakend = breaktime.wednesday[1];
    } else if (moment(formattedDate).isoWeekday() == 4 && breaktime.thursday != "") {
        var breakstart = breaktime.thursday[0];
        var breakend = breaktime.thursday[1];
    } else if (moment(formattedDate).isoWeekday() == 5 && breaktime.friday != "") {
        var breakstart = breaktime.friday[0];
        var breakend = breaktime.friday[1];
    } else if (moment(formattedDate).isoWeekday() == 6 && breaktime.saturday != "") {
        var breakstart = breaktime.saturday[0];
        var breakend = breaktime.saturday[1];
    } else if (moment(formattedDate).isoWeekday() == 7 && breaktime.sunday != "") {
        var breakstart = breaktime.sunday[0];
        var breakend = breaktime.sunday[1];
    }

    let breakstartFormat = moment(formattedDate + ' ' + breakstart, 'YYYY-MM-DD HH:mm');
    let breakendFormat = moment(formattedDate + ' ' + breakend, 'YYYY-MM-DD HH:mm');

    var dates = []; 
    if (doctorUnAvail != "") {
        for(var k = 0; k < doctorUnAvail.length; k++){
            var start = new Date(doctorUnAvail[k].stringDate1);
            let startformattedDate = moment(start).format("YYYY-MM-DD");
            var end = new Date(doctorUnAvail[k].stringDate2);
            let endformattedDate = moment(end).format("YYYY-MM-DD");

            // console.log("DOCTOR:" + doctor.firstname + "-------" + startformattedDate)
            // console.log("DOCTOR:" + doctor.firstname + "-------" + endformattedDate)
            var getDates = function(startDate, endDate) {
                var dates = [],
                    currentDate = startDate,
                    addDays = function(days) {
                        var date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    };
                while (currentDate <= endDate) {
                    dates.push(currentDate);
                    currentDate = addDays.call(currentDate, 1);
                }
                return dates;
                };
                
                // Usage
                dates = getDates(new Date(startformattedDate), new Date(endformattedDate));                                                                                                           
        }  
    }

    var something = dates.filter((value) => {
        return moment(value).format("YYYY-MM-DD") == formattedDate;
    })       

    // if it is not working day then sends the whole timeslot array
    if (!moment(formattedDate).isWorkingDay()) {
        dataArray = timeSlotsArray;
    } else {
        for (var i = 0; i < timeSlotsArray.length; i++) {
            let timeSlot = timeSlotsArray[i];

            let newTime = Date.parse(timeslot);
            let formattedTime = moment(newTime).format("HH:mm");

            let datetime = moment(formattedDate + ' ' + formattedTime, 'YYYY-MM-DD HH:mm');

            let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, formattedDate, formattedTime);

            //checks if the time is not working time or in between break adds to the unavailable times
            if (!moment(datetime.format('YYYY-MM-DD HH:mm')).isWorkingTime() || something == ""
            && (moment(datetime.format('YYYY-MM-DD HH:mm')).isBetween(breakstartFormat.format('YYYY-MM-DD HH:mm'), breakendFormat.format('YYYY-MM-DD HH:mm'), 'minute')) || appointment != "") {
                let data = {
                    slot: timeSlot,
                };

                dataArray.push(data);
            }
        }
    }
    result.send({ /* Send the available time somewhere*/
        htmlData: all_day,
        data: dataArray
    });
})

// given date and time, will return the available doctors
router.post("/getAvailableDoctors", urlencoder, async (req, res) => {
    console.log("POST /secretary/getAvailableDoctors")
    let addDoctorField = fs.readFileSync('./views/module_templates/secretary_add_doctor_field.hbs', 'utf-8');

    let time = req.body.timeInput;
    let date = req.body.dateInput;
 

    let newTime = Date.parse(time);
    let formattedTime = moment(newTime).format("HH:mm");
    let schemaFormattedTime = moment(newTime).format("h:mm A")

    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("YYYY-MM-DD");
    let schemaFormattedDate = moment(newDate).format("MMM D YYYY")

    let datetime = moment(formattedDate + ' ' + formattedTime, 'YYYY-MM-DD HH:mm');
    let doctors = await Doctor.getAllDoctors();
    let doctorsArray = [];

    for (var i = 0; i < doctors.length; i++) {
        let doctor = doctors[i];
        let docSched = await Schedule.getScheduleByID(doctor.schedule);
        let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctor._id);
        let breaktime = await BreakTime.getBreakTimeByID(doctor.breakTime);
        let appointment = await Appointment.getAppByDoctorandDateandTime(doctor._id, schemaFormattedDate, schemaFormattedTime);
        // console.log(appointment)
        moment.updateLocale('en', {
            workinghours: {
                0: docSched.sunday,
                1: docSched.monday,
                2: docSched.tuesday,
                3: docSched.wednesday,
                4: docSched.thursday,
                5: docSched.friday,
                6: docSched.saturday
            }
        });

        var breakstart = "19:00:00";
        var breakend = "19:00:00";

       // gets the 'breaktime' of the doctor
        if (moment(formattedDate).isoWeekday() == 1 && breaktime.monday != "") {
            var breakstart = breaktime.monday[0];
            var breakend = breaktime.monday[1];
        } else if (moment(formattedDate).isoWeekday() == 2 && breaktime.tuesday != "") {
            var breakstart = breaktime.tuesday[0];
            var breakend = breaktime.tuesday[1];
        } else if (moment(formattedDate).isoWeekday() == 3 && breaktime.wednesday != "") {
            var breakstart = breaktime.wednesday[0];
            var breakend = breaktime.wednesday[1];
        } else if (moment(formattedDate).isoWeekday() == 4 && breaktime.thursday != "") {
            var breakstart = breaktime.thursday[0];
            var breakend = breaktime.thursday[1];
        } else if (moment(formattedDate).isoWeekday() == 5 && breaktime.friday != "") {
            var breakstart = breaktime.friday[0];
            var breakend = breaktime.friday[1];
        } else if (moment(formattedDate).isoWeekday() == 6 && breaktime.saturday != "") {
            var breakstart = breaktime.saturday[0];
            var breakend = breaktime.saturday[1];
        } else if (moment(formattedDate).isoWeekday() == 7 && breaktime.sunday != "") {
            var breakstart = breaktime.sunday[0];
            var breakend = breaktime.sunday[1];
        }

        // console.log("DOCTOR:" + doctor.firstname + "-------" + formattedDate + " " + breakstart)
        // console.log(breaktime.monday[0])
        // console.log("DOCTOR:" + doctor.firstname + "-------" + formattedDate + " " + breakend)
        // console.log(breaktime.monday[1])

        let breakstartFormat = moment(formattedDate + ' ' + breakstart, 'YYYY-MM-DD HH:mm');
        let breakendFormat = moment(formattedDate + ' ' + breakend, 'YYYY-MM-DD HH:mm');

        var dates = []; 
        if (doctorUnAvail != "") {
            for(var k = 0; k < doctorUnAvail.length; k++){
                var start = new Date(doctorUnAvail[k].stringDate1);
                let startformattedDate = moment(start).format("YYYY-MM-DD");
                var end = new Date(doctorUnAvail[k].stringDate2);
                let endformattedDate = moment(end).format("YYYY-MM-DD");

                // console.log("DOCTOR:" + doctor.firstname + "-------" + startformattedDate)
                // console.log("DOCTOR:" + doctor.firstname + "-------" + endformattedDate)
                var getDates = function(startDate, endDate) {
                    var dates = [],
                        currentDate = startDate,
                        addDays = function(days) {
                          var date = new Date(this.valueOf());
                          date.setDate(date.getDate() + days);
                          return date;
                        };
                    while (currentDate <= endDate) {
                      dates.push(currentDate);
                      currentDate = addDays.call(currentDate, 1);
                    }
                    return dates;
                  };
                  
                  // Usage
                  dates.add(getDates(new Date(startformattedDate), new Date(endformattedDate)));                                                                                                           
            }  
        }

        var something = dates.filter((value) => {
            return moment(value).format("YYYY-MM-DD") == formattedDate;
        })
        
        //Checks if the dentist is available based on schedule
        if (moment(datetime.format('YYYY-MM-DD HH:mm')).isWorkingTime() && something == "" && doctor.status == "active"
        && !(moment(datetime.format('YYYY-MM-DD HH:mm')).isBetween(breakstartFormat.format('YYYY-MM-DD HH:mm'), breakendFormat.format('YYYY-MM-DD HH:mm'), 'minute')) && appointment == "") {
            
            let data = {
                doctor: doctor,
            };

            doctorsArray.push(data);
        }
       
    }
    let final = {
        data: doctorsArray
    }

    res.send({ /* Send the doctors somewhere*/
        htmlData: addDoctorField,
        data: final
    });
})


router.post("/info1", urlencoder, async function (request, result) {
    let info1 = fs.readFileSync('./views/module_templates/info1.hbs', 'utf-8');
    result.send({
        htmlData:info1
    })

})

router.post("/info2", urlencoder, async function (request, result) {
    let info2 = fs.readFileSync('./views/module_templates/info2.hbs', 'utf-8');
    result.send({
        htmlData:info2
    })
})

router.post("/info3", urlencoder, async function (request, result) {
    let info3 = fs.readFileSync('./views/module_templates/info3.hbs', 'utf-8');
    result.send({
        htmlData:info3
    })
})

router.post("/info4", urlencoder, async function (request, result) {
    let info4 = fs.readFileSync('./views/module_templates/info4.hbs', 'utf-8');
    result.send({
        htmlData:info4
    })
})



module.exports = router;