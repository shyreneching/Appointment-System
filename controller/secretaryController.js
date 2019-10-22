const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended : true
});

// router.get("/", (req, res) => {
//     res.render("addappointment.hbs");
// })
// External files imports

const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");

/* 
    Ty Added :)
*/

router.get("/", async function(req, res) {
    if(req.session.username == "secretary") {
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
router.post("/week_all", urlencoder, async function (request, result){

    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for(var i = 0; i < weekData.length; i++){
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAppointments = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++){
            let date = formattedWeekData[k].toString();
            

            // find all appointments in a date in a timeslot
            let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
            let appointments = [];
            for (var l = 0; l < appointmentlist.length; l++){
                let appointment = appointmentlist[l];
                //populate necessary info
                appointment = await appointment.populateDoctorAndProcess();
                appointments.push(appointment);
            }

            if (appointmentlist.length > maxInWeek){
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

router.post("/week_one", urlencoder, async function (request, result){
    let weekData = request.body["dates[]"];
    let doctorID = request.body.doctor;

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for(var i = 0; i < weekData.length; i++){
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAppointments = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++){
            let date = formattedWeekData[k].toString();
            

            // find all appointments in a date in a timeslot
            let appointmentlist = await Appointment.getAppByDoctorandDateandTime(doctorID, date, timeSlot);
            let appointments = [];
            for (var l = 0; l < appointmentlist.length; l++){
                let appointment = appointmentlist[l];
                //populate necessary info
                appointment = await appointment.populateDoctorAndProcess();
                appointments.push(appointment);
            }

            if (appointmentlist.length > maxInWeek){
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

router.post("/week_unavailable", async function (request, result){
    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for(var i = 0; i < weekData.length; i++){
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekUnavailable = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++){
            let date = formattedWeekData[k].toString();
            
            let unavs = [];
            
            for (var l = 0; l < doctorsArray.length; l++){
                let doctorID = doctorsArray[l]._id;
                let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, date, timeSlot);

                if (appointment){
                    let unavDoctor = await Doctor.getDoctorByID(doctorID);
                    unavs.push(unavDoctor);
                }
            }

            if (unavs.length > maxInWeek){
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

router.post("/week_available", async function (request, result){

    let weekData = request.body["dates[]"];

    //Convert data to MMM D YYYY
    let formattedWeekData = [];

    for(var i = 0; i < weekData.length; i++){
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot

        // appointments in a week for a time slot
        let weekAvailable = [];
        let maxInWeek = 0;

        // loop through all weekdates in one time slot
        for (var k = 0; k < formattedWeekData.length; k++){
            let date = formattedWeekData[k].toString();
            
            let avs = [];
            
            for (var l = 0; l < doctorsArray.length; l++){
                let doctorID = doctorsArray[l]._id;
                let appointment = await Appointment.getOneAppByDoctorandDateandTime(doctorID, date, timeSlot);

                if (appointment){
                    
                } else {
                    let avDoctor = await Doctor.getDoctorByID(doctorID);
                    avs.push(avDoctor);
                }
            }

            if (avs.length > maxInWeek){
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

router.get("/table_header", function (request, result){
    let table_header = fs.readFileSync('./views/module_templates/secretary_weekdates.hbs', 'utf-8');
    result.send(table_header);
});

router.post("/day_all", urlencoder, async function (request, result){
    
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot
        let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
        let appointments = [];
        for (var k = 0; k < appointmentlist.length; k++){
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

router.post("/day_one", urlencoder, async function (request, result){
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
    for (var i = 0; i < timeSlotsArray.length; i++){
        let timeSlot = timeSlotsArray[i];
        // get all appointments in this date and time slot
        let appointmentlist = await Appointment.getAppByDoctorandDateandTime(doctorID, date, timeSlot);
        let appointments = [];
        for (var k = 0; k < appointmentlist.length; k++){
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

router.post("/check_valid_appointment", urlencoder, async function (request, result){
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

router.post("/getAppointment",urlencoder, async (req, res) => {
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
    Appointment.find({}, (err, docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.render("admin.hbs",{
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
        time : formattedTime,
        date : formattedDate,
        doctor
    });

    Appointment.addAppointment(appointment, function(appointment){
        if (appointment){
            res.redirect("/secretary");
        } else {
            res.redirect("/");
        }
        
    }, (error)=>{
        res.send(error);
    })
})

router.get("/edit", (req, res)=>{
    //just find the user given the id
    console.log("GET /edit" + req.query.id)
    Appointment.findOne({
        _id: req.query.id

    }, (err, doc)=>{
        if(err){
            res.send(err)
        }else{
            console.log(doc)
            //send all the details of the user to edit.hbs
            res.render("edit.hbs", {
                appointment: doc
            })
        }
    })
})


router.post("/update", (req, res) => {
    Appointment.update({
        _id: req.body.id
    }, {
        patientname:  req.body.pn,
        patientcontact: req.body.pc,
        process: req.body.pp,
        notes: req.body.note,
        time: req.body.time,
        date: req.body.date,
        doctor: req.body.doc
    }, (err, doc)=>{
       if(err){
           res.send(err)
       }else{
           res.redirect("/")
       }
    })
})

router.post("/delete", urlencoder, async (req, res) => {
    let appID = req.body.appointmentID;

    await Appointment.delete(appID);

    res.send("Success");
})

module.exports = router;