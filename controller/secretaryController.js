const express = require("express");
const router = express.Router();
const {Appointment} = require("../model/appointment");
const fs = require('fs');

// router.get("/", (req, res) => {
//     res.render("addappointment.hbs");
// })


/*
    Ty Added :)
*/

router.get("/", (req, res) => {
    res.render('page_templates/secretary_view.hbs');
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

router.get("/day_all", function (request, result){
    let all_week = fs.readFileSync('./views/module_templates/secretary_day_all.hbs', 'utf-8');
    result.send(all_week);
});
/*
    End of Templates
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

router.post("/create", (req, res) => {

    let patientname = req.body.pn
    let patientcontact = req.body.pc
    let process = req.body.pp
    let notes = req.body.note
    let time = req.body.time
    let date = req.body.date
    let doctor = req.body.doc
 
    console.log("hahaha")

    let appointment = new Appointment({
        patientname,
        patientcontact,
        process,
        notes,
        time,
        date,
        doctor
    })
    appointment.save().then(() => {
        res.session.msg = "Successfully added " + doc.patientname
        res.redirect("/")
    }, (err) => {
        res.send(err)
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