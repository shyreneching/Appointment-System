const express = require("express");
const router = express.Router();
const {Appointment} = require("../model/appointment");
const {Doctor} = require("../model/doctor");
const {Process} = require("../model/process");
const moment = require('moment');
const fs = require('fs');

// router.get("/", (req, res) => {
//     res.render("addappointment.hbs");
// })


/*
    Ty Added :)
*/

router.get("/", async function(req, res) {
    let doctor = await Doctor.getAllDoctors();
    let process = await Process.getAllProcesses();
    res.render('page_templates/secretary_view.hbs', {
        doctor: doctor,
        process: process
    });
});

/*
    Getting templates for filtering 
*/
router.get("/week_all", function (request, result){
    let all_week = fs.readFileSync('./views/module_templates/secretary_week_all.hbs', 'utf-8');
    result.send(all_week);
});

router.get("/week_one", function (request, result){
    let one_doc = fs.readFileSync('./views/module_templates/secretary_week_one_doctor.hbs', 'utf-8');
    result.send(one_doc);
});

router.get("/week_unavailable", function (request, result){
    let week_unavailable = fs.readFileSync('./views/module_templates/secretary_week_unavail.hbs', 'utf-8');
    result.send(week_unavailable);
});

router.get("/week_available", function (request, result){
    let week_available = fs.readFileSync('./views/module_templates/secretary_week_avail.hbs', 'utf-8');
    result.send(week_available);
});

router.get("/table_header", function (request, result){
    let table_header = fs.readFileSync('./views/module_templates/secretary_weekdates.hbs', 'utf-8');
    result.send(table_header);
});

router.post("/day_all", async function (request, result){
    let stuff = request.body.sentData;
    console.log(stuff + "server");
    let date = moment();
    let all_week = fs.readFileSync('./views/module_templates/secretary_day_all.hbs', 'utf-8');
    let timeSlotsArray = ["8:00 AM", "8:30 AM",
    "9:00 AM", "9:30 AM",
    "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM",
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
        let appointmentlist = await Appointment.getAppointmentsByDateandTime(date, timeSlot);
        let appointments = [];
        for (var k = 0; k < appointmentlist.length; k++){
            let appointment = appointmentlist[i];
            appointment = await appointment.populateDoctor();
            appointment = await appointment.populateProcess();
            // populate the procedure
            appointments.push(appointment);
        }

        let data = {
            slot: timeSlot,
            appointments: appointments
        };

        dataArray.push(data);
    }



    result.send({
        htmlData: all_week,
        data: dataArray
    });
});

router.get("/day_one", function (request, result){
    let one_day_doc = fs.readFileSync('./views/module_templates/secretary_day_one_doc.hbs', 'utf-8');
    result.send(one_day_doc);
});
/*
    End of Templates
*/

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
router.post("/create", (req, res) => {

    let patientname = req.body.pn
    let patientcontact = req.body.pc
    let process = req.body.pp
    let notes = req.body.note
    let time = req.body.time
    let date = req.body.date
    let doctor = req.body.doc

    let appointment = new Appointment({
        patientname,
        patientcontact,
        process,
        notes,
        time,
        date,
        doctor
    })

    Appointment.addAppointment(appointment, function(appointment){
        if (req.session.colors_from_home){
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

router.post("/delete", (req, res) => {
    Appointment.deleteOne({
        _id: req.body.id
    }, (err, doc)=>{
       if(err){
           res.send(err)
       }else{
           //res.redirect("/users")
           res.send(doc)
       }
    })
})

module.exports = router;