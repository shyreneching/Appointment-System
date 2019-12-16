const express = require("express");
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended: true
});

const { Appointment } = require("../model/appointment");
const { Doctor } = require("../model/doctor");
const { Process } = require("../model/process");
const { Account } = require("../model/account");
const { Schedule } = require("../model/schedule");
const { BreakTime } = require("../model/breaktime");
const { UnavailableDate } = require("../model/unavailableDate");

// GET ADMIN PAGE
router.get("/", async (req, res) => {
    let admin = await Account.getAccountByUsername("admin");
    if (req.session.username == "admin") {
        res.render("page_templates/admin_view.hbs", {
            password: admin.password
        });
    } else {
        res.redirect("/login");
    }
})

// VALIDATION
router.post("/checkCurrentAdminPassword", async (req, res) => {
    let admin = await Account.getAccountByUsername("admin");
    var temp = await Account.authenticate(admin.username, req.body.newPassword, admin.salt);
    if(temp != null) {
        res.send(true);
    } else {
        res.send(false);
    }
})

router.post("/checkCurrentSecretaryPassword", async (req, res) => {
    let user = await Account.getAccountByUsername("secretary");
    var temp = await Account.authenticate(user.username, req.body.newPassword, user.salt);
    if(temp != null) {
        res.send(true);
    } else {
        res.send(false);
    }
})

router.post("/validateUsername", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if (account == undefined) {
        res.send({ message: false });
    } else {
        res.send({ message: true });
    }
})

// ALL ACCOUNT SETTING
router.post("/updateAccountPassword", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if (req.body.username == "admin" || req.body.username == "secretary") {
        Account.updateAccount(account.id, req.body.newPassword);
        res.send({ message: true });
    } else {
        if (account == undefined) {
            res.send({ message: false });
        } else {
            Account.updateAccount(account.id, req.body.newPassword);
            res.send({ message: true });
        }
    }
})

router.post("/addAccount", async (req, res) => {
    let user = await Account.getAccountByUsername(req.body.username);
    if (user == undefined) {
        Account.addAccount(new Account({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.type
        }), (value) => {
            res.send({ message: true });
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({ message: false });
    }
})

router.post("/editAccount", (req, res) => {
    Account.updateAccount(req.body.accountID, req.body.accountPassword);
    res.send(true);
})

router.post("/deleteAccount", async (req, res) => {
    let account = await Account.findOne({ doctorID: req.body.doctorID });
    if (account.accountType == "dentist") {
        let unavailableDate = await UnavailableDate.getDoctorUnavailableDates(account.doctorID);
        for (var i = 0; i < unavailableDate.length; i++) {
            let unAvID = unavailableDate[i]._id;
            await UnavailableDate.delete(unAvID);
        }
        let doctor = await Doctor.getDoctorByID(account.doctorID);
        await BreakTime.delete(doctor.breaktime);
        await Schedule.delete(doctor.schedule);
        await Doctor.delete(account.doctorID); 
        let appointments = await Appointment.getDoctorAppointment(account.doctorID);
        for (var i = 0; i < appointments.length; i++) {
            let appID = appointments[i]._id;
            var ary = appointments[i].doctor;
            ary.pull(account.doctorID)
            if(ary.length == 0){
                await Appointment.delete(appID);
            }else{
                let temp = new Appointment({
                    firstname: appointments[i].firstname,
                    lastname: appointments[i].lastname,
                    patientcontact: appointments[i].patientcontact,
                    process: appointments[i].process,
                    notes: appointments[i].notes,
                    time: appointments[i].time,
                    date: appointments[i].date,
                    doctor: ary
                });
                await Appointment.updateAppointment(appointments, temp);
            }
        }
    }
    Account.delete(account._id);
    res.send({ message: true });
})

// DENTIST SETTING
router.post("/addDentist", async (req, res) => {
    let user = await Account.getAccountByUsername(req.body.username);
    if (user == undefined) {
        Doctor.addDoctor(new Doctor({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            status: req.body.status,
            lastLogin: ""
        }), (value) => {
            Account.addAccount(new Account({
                username: req.body.username,
                password: req.body.password,
                accountType: req.body.type,
                doctorID: value._id
            }), (val) => {
                let time = ['8:00', '18:00'];
                let defaultschedule = new Schedule({
                    sunday: null,
                    monday: time,
                    tuesday: time,
                    wednesday: time,
                    thursday: time,
                    friday: time,
                    saturday: time
                })
                let breaktime = new BreakTime({
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: []
                })

                BreakTime.addBreakTime(breaktime, function (data) {
                    Doctor.updateDoctorBreakTime(value._id, data._id);
                }, (error) => {
                    res.send(error);
                })

                Schedule.addschedule(defaultschedule, function (data) {
                    Doctor.updateDoctorSchedule(value._id, data._id);
                }, (error) => {
                    res.send(error);
                })

                res.send({
                    message: true,
                    doctor: value
                });
            }, (err) => {
                res.send(err);
            })
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({ message: false });
    }
})

router.post("/editDentist", async (req, res) => {
    let account = await Account.findOne({ doctorID: req.body.doctorID });
    
    Account.updateAccount(account.id, req.body.password);
    Doctor.updateDoctor(account.doctorID, req.body.firstname, req.body.lastname);
    res.send(true);
})

router.post("/updateDentistStatus", async (req, res) => {
    Doctor.updateDoctorStatus(req.body.doctorID, req.body.status);
})

// ADD PROCESS
router.post("/addProcess", async (req, res) => {
    let process = await Process.findOne({
        processname: req.body.name
    });
    if (process == undefined) {
        Process.addProcess(new Process({
            processname: req.body.name
        }), (value) => {
            res.send({ message: true });
        })
    } else {
        res.send({ message: false });
    }
})

router.post("/editProcess", async (req, res) => {
    let process = await Process.findOne({ processname: req.body.name });
    if (process == undefined || process._id == req.body.procedureID) {
        Process.updateProcess(req.body.procedureID, req.body.name);
        res.send({ message: true });
    } else {
        res.send({ message: false });
    }
})

router.post("/deleteProcess", async (req, res) => {
    let processID = req.body.processID;
    let apps = await Appointment.getAll();
        for (var i = 0; i < apps.length; i++) {
            let appID = apps[i]._id;
            var ary = apps[i].process;
            ary.pull(processID)
            if(ary.length == 0){
                await Appointment.delete(appID);
            }else{
                let temp = new Appointment({
                    firstname: apps[i].firstname,
                    lastname: apps[i].lastname,
                    patientcontact: apps[i].patientcontact,
                    process: ary,
                    notes: apps[i].notes,
                    time: apps[i].time,
                    date: apps[i].date,
                    doctor: apps[i].doctor
                });
                await Appointment.updateAppointment(apps, temp);
            }
        }
    Process.delete(processID);
    res.send({ message: true });
})

// GET USER BY USERNAME
router.post("/getUser", async (req, res) => {
    let user = await Account.findOne({ doctorID: req.body.doctorID });
    let doctor = await Doctor.getDoctorByID(req.body.doctorID);
    res.send({
        user,
        doctor
    });
})

// GET SPECIFIC TYPE OF USER
router.post("/filterUser", async (req, res) => {
    let account;
    if (req.body.userType == "all") {
        account = await Account.getAccountWithoutAdmin();
    } else if (req.body.userType == "secretary") {
        account = await Account.getSecretary();
    } else if (req.body.userType == "dentist") {
        account = await Account.getDentist();
    }
    let table = fs.readFileSync('./views/module_templates/admin-users-table.hbs', 'utf-8');
    let sendData = {
        user: account
    }
    res.send({
        htmlData: table,
        data: sendData
    })
})

// LOAD TABLES FOR ALL DENTISTS
router.get("/adminDentist", urlencoder, async (req, res) => {
    let doctors = await Doctor.getAllDoctors();
    let table = fs.readFileSync('./views/module_templates/admin-dentist-table.hbs', 'utf-8');
    let sendData = {
        dentist: doctors
    }
    res.send({
        htmlData: {
            table
        },
        data: sendData
    })
})

// LOAD TABLES FOR ALL PROCEDURES
router.get("/adminProcedure", urlencoder, async (req, res) => {
    let processes = await Process.getAllProcesses();
    let table = fs.readFileSync('./views/module_templates/admin-procedure-table.hbs', 'utf-8');
    let sendData = {
        procedure: processes
    }
    res.send({
        htmlData: {
            table
        },
        data: sendData
    })
})

// DENTIST SCHEDULE SETTING
router.post("/addSchedule", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
    let doctor = await Doctor.getDoctorByID(doctorID);
    let defaultschedule;
    let mondayBreak = [];
    let tuesdayBreak = [];
    let wednesdayBreak = [];
    let thursdayBreak = [];
    let fridayBreak = [];
    let saturdayBreak = [];

    if (req.body.defaultTime == 'false') {
        let monday, tuesday, wednesday, thursday, friday, saturday;

        monday = req.body["monday[]"]; // whole bracket
        tuesday = req.body["tuesday[]"]; // whole bracket
        wednesday = req.body["wednesday[]"]; // whole bracket
        thursday = req.body["thursday[]"]; // whole bracket
        friday = req.body["friday[]"]; // whole bracket
        saturday = req.body["saturday[]"]; // whole bracket
        mondayBreak = req.body["mondaydifference[]"]; // the difference of end of first session and start of second session
        tuesdayBreak = req.body["tuesdaydifference[]"];
        wednesdayBreak = req.body["wednesdaydifference[]"];
        thursdayBreak = req.body["thursdaydifference[]"];
        fridayBreak = req.body["fridaydifference[]"];
        saturdayBreak = req.body["saturdaydifference[]"];

        defaultschedule = new Schedule({
            sunday: null,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday
        })
        
        let breaktime = new BreakTime({
            monday: mondayBreak,
            tuesday: tuesdayBreak,
            wednesday: wednesdayBreak,
            thursday: thursdayBreak,
            friday: fridayBreak,
            saturday: saturdayBreak
        })

        BreakTime.updateBreakTime(doctor.breakTime, breaktime);

        Schedule.updateSchedule(doctor.schedule, defaultschedule);

    }


    res.send(true);
})

router.post("/editSchedule", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
    let doctor = await Doctor.getDoctorByID(doctorID);


    let mondayBreak = [];
    let tuesdayBreak = [];
    let wednesdayBreak = [];
    let thursdayBreak = [];
    let fridayBreak = [];
    let saturdayBreak = [];

    let monday, tuesday, wednesday, thursday, friday, saturday;

    monday = req.body["monday[]"]; // whole bracket
    tuesday = req.body["tuesday[]"]; // whole bracket
    wednesday = req.body["wednesday[]"]; // whole bracket
    thursday = req.body["thursday[]"]; // whole bracket
    friday = req.body["friday[]"]; // whole bracket
    saturday = req.body["saturday[]"]; // whole bracket
    mondayBreak = req.body["mondaydifference[]"]; // the difference of end of first session and start of second session
    tuesdayBreak = req.body["tuesdaydifference[]"];
    wednesdayBreak = req.body["wednesdaydifference[]"];
    thursdayBreak = req.body["thursdaydifference[]"];
    fridayBreak = req.body["fridaydifference[]"];
    saturdayBreak = req.body["saturdaydifference[]"];

    let schedule = new Schedule({
        sunday: null,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday
    })

    let breaktime = new BreakTime({
        monday: mondayBreak,
        tuesday: tuesdayBreak,
        wednesday: wednesdayBreak,
        thursday: thursdayBreak,
        friday: fridayBreak,
        saturday: saturdayBreak
    })

    BreakTime.updateBreakTime(doctor.breakTime, breaktime);

    Schedule.updateSchedule(doctor.schedule, schedule);

    res.send(true);
})

router.post("/getDoctorSchedule", async (req, res) => {
    let doctor = await Doctor.getDoctorByID(req.body.doctorID);
    let schedule = await Schedule.getScheduleByID(doctor.schedule);
    let breakTime = await BreakTime.getBreakTimeByID(doctor.breakTime);

    res.send({
        docSched: schedule,
        breakTime
    })
})

router.post("/getSchedule", urlencoder, async (req, res) => {
    let doctorID = req.body.doctorID;
    let doctor = await Doctor.getDoctorByID(doctorID);
    let docSched = await Schedule.getScheduleByID(doctor.schedule);
    let breaktime = await BreakTime.getBreakTimeByID(doctor.breakTime);
    let table = fs.readFileSync('./views/module_templates/admin-dentist-schedule.hbs', 'utf-8');

    let array = [], docID;
    if (docSched != undefined) {
        array = getObject(docSched, breaktime);
        docID = docSched._id;
    } else {
        docID = "";
    }

    let sendData = {
        sched: array,
        schedID: docID
    }
    res.send({
        htmlData: table,
        data: sendData,
    })
})

function getObject(object, breakTime) {
    let array = [];
    array.push(object.monday);
    array.push(breakTime.monday);
    array.push(object.tuesday);
    array.push(breakTime.tuesday);
    array.push(object.wednesday);
    array.push(breakTime.wednesday);
    array.push(object.thursday);
    array.push(breakTime.thursday);
    array.push(object.friday);
    array.push(breakTime.friday);
    array.push(object.saturday);
    array.push(breakTime.saturday);

    let objectTimeList = [];
    objectTimeList.push(new Object({
        name: "Monday",
        time: []
    }));
    objectTimeList.push(new Object({
        name: "Tuesday",
        time: []
    }));
    objectTimeList.push(new Object({
        name: "Wednesday",
        time: []
    }));
    objectTimeList.push(new Object({
        name: "Thursday",
        time: []
    }));
    objectTimeList.push(new Object({
        name: "Friday",
        time: []
    }));
    objectTimeList.push(new Object({
        name: "Saturday",
        time: []
    }));

    var ctr = 0;
    while (ctr < array.length) {
        var temp = array[ctr];
        if (temp != "") {
            if (array[ctr + 1] == "") {
                var sc = array[ctr][0] + " - " + array[ctr][1];
                objectTimeList[Math.floor(ctr / 2)].time.push({
                    range: sc
                })
            } else {
                var sc1 = array[ctr][0] + " - " + array[ctr + 1][0];
                objectTimeList[Math.floor(ctr / 2)].time.push({
                    range: sc1
                })
                var sc2 = array[ctr + 1][1] + " - " + array[ctr][1];
                objectTimeList[Math.floor(ctr / 2)].time.push({
                    range: sc2
                })
            }
        } else {
            if (ctr % 2 == 0) {
                objectTimeList[Math.floor(ctr / 2)].time.push({
                    range: "-"
                })
            }
        }
        ctr += 2;
    }
    return objectTimeList;
}

router.post("/addUnavailableDates", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;

    let startnewDate = Date.parse(startDate);
    let startformattedDate = moment(startnewDate).format("YYYY-MM-DD");
    let endnewDate = Date.parse(endDate);
    let endformattedDate = moment(endnewDate).format("YYYY-MM-DD");

    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);

    let unavailableDate = new UnavailableDate({
        momentDate1: req.body.startdate,
        stringDate1: startformattedDate,
        momentDate2: req.body.enddate,
        stringDate2: endformattedDate,
        doctor: doctorID
    })

    if (doctorUnAvail != "") {
        var check = true;
        for(var k = 0; k < doctorUnAvail.length && check; k++) {
            var start = new Date(doctorUnAvail[k].stringDate1);
            let starttemp = moment(start).format("YYYY-MM-DD");
            var end = new Date(doctorUnAvail[k].stringDate2);
            let endtemp = moment(end).format("YYYY-MM-DD");

            if(moment(startformattedDate).isBefore(starttemp) && moment(endformattedDate).isAfter(endtemp)) {
                await UnavailableDate.updateUnavailableDate(doctorUnAvail[k]._id, unavailableDate);
                check = false;
            }
        }
        if(check) {
            await UnavailableDate.addUnavailableDate(unavailableDate, function (val) {
                res.send(true);
            }, (error) => {
                res.send(error);
            })
        } else {
            res.send(true);
        }
    } else {
        await UnavailableDate.addUnavailableDate(unavailableDate, function (val) {
            res.send(true);
        }, (error) => {
            res.send(error);
        })
    }
})

router.post("/getUnavailableDates", urlencoder, async (req, res) => {
    let doctorID = req.body.doctorID;
    let data = await UnavailableDate.getDoctorUnavailableDates(doctorID);
    let table = fs.readFileSync('./views/module_templates/admin-dentist-unavailable.hbs', 'utf-8');

    let sendData = {
        sched: modifyArray(data)
    }

    res.send({
        htmlData: table,
        data: sendData
    })
})

function modifyArray(object) {
    var objectUnavailable = [];
    for (var i = 0; i < object.length; i++) {
        if (object[i].momentDate1 == object[i].momentDate2) {
            objectUnavailable.push({
                _id: object[i]._id,
                time: object[i].momentDate1
            })
        } else {
            objectUnavailable.push({
                _id: object[i]._id,
                time: object[i].momentDate1 + " - " + object[i].momentDate2
            })
        }
    }
    return objectUnavailable;
}

router.post("/deleteUnavailableDates", urlencoder, async (req, res) => {
    UnavailableDate.delete(req.body.unavailableDateID);
    res.send(true);
})

router.post("/editUnavailableDates", urlencoder, async (req, res) => {
    let unavailableDateID = req.body.unavailableDateID;

    var start = new Date(req.body.startdate);
    let startformattedDate = moment(start).format("YYYY-MM-DD");
    var end = new Date(req.body.enddate);
    let endformattedDate = moment(end).format("YYYY-MM-DD");

    let unavailableDate = new UnavailableDate({
        momentDate1: req.body.startdate,
        stringDate1: startformattedDate,
        momentDate2: req.body.enddate,
        stringDate2: endformattedDate,
        doctor: UnavailableDate.getUnavailableDateByID(unavailableDateID).doctor
    })

    UnavailableDate.updateUnavailableDate(unavailableDateID, unavailableDate);
})

router.post("/doctorHasAppointment", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
    let startdate = req.body.startDate;
    let enddate = req.body.endDate

    let startnewDate = Date.parse(startdate);
    let startformattedDate = moment(startnewDate).format("MMM D YYYY");
    let endnewDate = Date.parse(enddate);
    let endformattedDate = moment(endnewDate).format("MMM D YYYY");

    let startappointments = await Appointment.getAppByDoctorandDate(doctorID, startformattedDate);
    let endappointments = await Appointment.getAppByDoctorandDate(doctorID, endformattedDate);

    if(startappointments == "" || endappointments == ""){
        res.send(false)
    } else {
        res.send(true)
    }

})

router.post("/unavailableTaken", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;

    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);
    let appointments = await Appointment.getDoctorAppointment(doctorID);

    var dates = []; 
    if (doctorUnAvail != "") {
        for(var k = 0; k < doctorUnAvail.length; k++){
            var start = new Date(doctorUnAvail[k].stringDate1);
            let startformattedDate = moment(start).format("YYYY-MM-DD");
            var end = new Date(doctorUnAvail[k].stringDate2);
            let endformattedDate = moment(end).format("YYYY-MM-DD");

            var getDates = function(startDate, endDate) {
                var datesget = [];
                if(dates != ""){
                    datesget = dates;
                }

                var currentDate = startDate,
                    addDays = function(days) {
                        var date = new Date(this.valueOf());
                        date.setDate(date.getDate() + days);
                        return date;
                    };
                while (currentDate <= endDate) {
                    datesget.push(new Object({
                        date: currentDate,
                        message: "Doctor is not available"
                    }));
                    currentDate = addDays.call(currentDate, 1);
                }
                return datesget;
            };
                
            // Usage
            dates = getDates(new Date(startformattedDate), new Date(endformattedDate));                                                                                                           
        }  
    }
    if (appointments != "") {
        for(var k = 0; k < appointments.length; k++){
            var araw = new Date(appointments[k].date);
            let formattedDate = moment(araw).format("YYYY-MM-DD");

            var something = dates.filter((value) => {
                return moment(value).format("YYYY-MM-DD") == formattedDate;
            })

            if(something == ""){
                dates.push(new Object({
                    date: formattedDate,
                    message: "Doctor has appointment"
                }));
            }
        }
    } 

    res.send(dates);
})

router.get("/exportData", async (req, res) => {
    var data = await Appointment.getAll();
    var csv = "First Name,Last Name,Contact,Procedures,Notes,Date,Time,Doctor\n";
    for(var i = 0; i < data.length; i++) {
        var row = data[i];
        csv += row.firstname + ",";
        csv += row.lastname + ",";
        csv += row.patientcontact + ",";
        for(var j = 0; j < row.process.length; j++) {
            var proc = await Process.findOne({_id: row.process[j]._id});
            csv += proc.processname + " - ";
        }
        csv = csv.substring(0, csv.length - 3);
        csv += ",";
        csv += row.notes + ",";
        csv += row.date + ",";
        csv += row.time + ",";
        if(row.doctor.length > 0) {
            for(var k = 0; k < row.doctor.length; k++) {
                var doc = await Doctor.findOne({_id: row.doctor[k]._id});
                csv += doc.firstname + " " + doc.lastname + " - ";
            }
        }
        csv = csv.substring(0, csv.length - 3);
        csv += ",";
        csv += "\n";
    }
    res.send(csv);
})


module.exports = router;