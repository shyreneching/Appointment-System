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

router.get("/", async (req, res) => {
    let admin = await Account.getAccountByUsername("admin");
    if (req.session.username == "admin") {
        res.render("page_templates/admin-view.hbs", {
            password: admin.password
        });
    } else {
        res.redirect("/login");
    }
})

router.post("/checkCurrentAdminPassword", async (req, res) => {
    let admin = await Account.getAccountByUsername("admin");
    var temp = await Account.authenticate(admin.username, req.body.newPassword, admin.salt);
    if(temp != undefined) {
        res.send(true);
    } else {
        res.send(false);
    }
})

router.post("/updateAccountPassword", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if (req.body.username == "admin") {
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

router.post("/editAccount", (req, res) => {

    Account.updateAccount(req.body.accountID, req.body.accountPassword);
    res.send(true);
})

router.post("/addAccount", async (req, res) => {
    let user = await Account.getAccountByUsername(req.body.username);
    if (user == undefined) {
        Account.addAccount(new Account({
            username: req.body.username,
            password: req.body.password,
            accountType: req.body.type,
            doctorID: "",
            lastLogin: ""
        }), (value) => {
            res.send({ message: true });
        }, (err) => {
            res.send(err);
        })
    } else {
        res.send({ message: false });
    }
})

router.post("/deleteAccount", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.accountUsername);
    if (account.accountType == "dentist") {
        let unavailableDate = await UnavailableDate.getDoctorUnavailableDates(account.doctorID);
        for (var i = 0; i < unavailableDate.length; i++) {
            let unAvID = unavailableDate[i]._id;
            await UnavailableDate.delete(unAvID);
        }
        let doctor = Doctor.getDoctorByID(account.doctorID);
        await BreakTime.delete(doctor.breaktime);
        await Schedule.delete(doctor.schedule);
        await Doctor.delete(account.doctorID);
        let appointments = await Appointment.getDoctorAppointment(account.doctorID);
        for (var i = 0; i < appointments.length; i++) {
            let appID = appointments[i]._id;
            if(appointments[i].doctor == "" || appointments[i].doctor.length == 0) {
                await Appointment.delete(appID);
            }
        }
    }
    Account.delete(req.body.accountID);
    res.send({ message: true });
})

router.post("/validateUsername", async (req, res) => {
    let account = await Account.getAccountByUsername(req.body.username);
    if (account == undefined) {
        res.send({ message: false });
    } else {
        res.send({ message: true });
    }
})

router.post("/editDentist", async (req, res) => {
    let account = await Account.findOne({ _id: req.body.accountID });
    Account.updateAccount(account.id, req.body.password);
    Doctor.updateDoctor(account.doctorID, req.body.firstname, req.body.lastname, req.body.status);
    res.send(true);
})

router.post("/addDentist", async (req, res) => {
    let user = await Account.getAccountByUsername(req.body.username);
    if (user == undefined) {
        Doctor.addDoctor(new Doctor({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            status: req.body.status
        }), (value) => {
            Account.addAccount(new Account({
                username: req.body.username,
                password: req.body.password,
                accountType: req.body.type,
                doctorID: value.id
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

router.post("/editProcess", async (req, res) => {
    let process = await Process.findOne({ processname: req.body.name });
    if (process == undefined || process._id == req.body.procedureID) {
        Process.updateProcess(req.body.procedureID, req.body.name);
        res.send({ message: true });
    } else {
        res.send({ message: false });
    }
})

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

router.post("/deleteProcess", (req, res) => {
    Process.delete(req.body.processID);
    res.send({ message: true });
})

router.post("/getUser", async (req, res) => {
    let user = await Account.findOne({ username: req.body.username });
    let doctor;
    if (user.doctorID != "") {
        doctor = await Doctor.getDoctorByID(user.doctorID);
    }
    res.send({
        user,
        doctor
    });
})

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

router.get("/adminUsers", urlencoder, async (req, res) => {
    let accounts = await Account.getAccountWithoutAdmin();
    let table = fs.readFileSync('./views/module_templates/admin-users-table.hbs', 'utf-8');
    let sendData = {
        user: accounts
    }
    res.send({
        htmlData: {
            table
        },
        data: sendData
    })

})

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

router.post("/addSchedule", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;

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
    }

    let breaktime = new BreakTime({
        monday: mondayBreak,
        tuesday: tuesdayBreak,
        wednesday: wednesdayBreak,
        thursday: thursdayBreak,
        friday: fridayBreak,
        saturday: saturdayBreak
    })

    BreakTime.addBreakTime(breaktime, function (val) {
        Doctor.updateDoctorBreakTime(doctorID, val._id);
    }, (error) => {
        res.send(error);
    })

    Schedule.addschedule(defaultschedule, function (value) {
        Doctor.updateDoctorSchedule(doctorID, value._id);
        res.send(true);
    }, (error) => {
        res.send(error);
    })
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

    var start = new Date(req.body.startdate);
    let startformattedDate = moment(start).format("YYYY-MM-DD");
    var end = new Date(req.body.enddate);
    let endformattedDate = moment(end).format("YYYY-MM-DD");

    let unavailableDate = new UnavailableDate({
        momentDate1: req.body.startdate,
        stringDate1: startformattedDate,
        momentDate2: req.body.enddate,
        stringDate2: endformattedDate,
        doctor: doctorID
    })

    UnavailableDate.addUnavailableDate(unavailableDate, function (val) {
        res.send(true);
    }, (error) => {
        res.send(error);
    })

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
    let date = req.body.dateInput;

    let newDate = Date.parse(date);
    let formattedDate = moment(newDate).format("MMM D YYYY");

    let appointments = await Appointment.getAppByDoctorandDate(doctorID, formattedDate);

    if(appointments == ""){
        res.send({
            data: "false"
        })
    }else{
        res.send({
            data: "true"
        })
    }

})

router.post("/unavailableTaken", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;

    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);

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
                    datesget.push(currentDate);
                    currentDate = addDays.call(currentDate, 1);
                }
                return datesget;
            };
                
            // Usage
            dates = getDates(new Date(startformattedDate), new Date(endformattedDate));                                                                                                           
        }  
    }

    res.send(dates);
})


router.post("/combineIfOverarching", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
    let startDate = req.body.startInput;
    let endDate = req.body.endInput;

    let newDate = Date.parse(startDate);
    let startformattedDate = moment(newDate).format("YYYY-MM-DD");
    let newDate = Date.parse(endDate);
    let endformattedDate = moment(newDate).format("YYYY-MM-DD");

    let doctorUnAvail = await UnavailableDate.getDoctorUnavailableDates(doctorID);

    if (doctorUnAvail != "") {
        for(var k = 0; k < doctorUnAvail.length; k++){
            var start = new Date(doctorUnAvail[k].stringDate1);
            let starttemp = moment(start).format("YYYY-MM-DD");
            var end = new Date(doctorUnAvail[k].stringDate2);
            let endtemp = moment(end).format("YYYY-MM-DD");

            if(moment(startformattedDate).isSameOrBefore(starttemp) && moment(endformattedDate).isSameOrAfter(endtemp)){
                let addstart = moment(start)("MMM D YYYY");
                let addend = moment(end).format("MMM D YYYY");

                let temp =  new UnavailableDate({
                    momentDate1: addstart,
                    stringDate1: startformattedDate,
                    momentDate2: addend,
                    stringDate2: endformattedDate,
                    doctor: doctorID
                })

                await UnavailableDate.updateUnavailableDate(doctorUnAvail[k]._id, temp);
                res.send("changed");
            }

        }
    }
})

router.post("/unavailableTaken", urlencoder, async (req, res) => {

    let doctorID = req.body.doctorID;
   
    let appointments = await Appointment.getDoctorAppointment(doctorID);

    var dates = []; 
    if (appointments != "") {
        for(var k = 0; k < appointments.length; k++){
            var araw = new Date(appointments[k].date);
            let formattedDate = moment(araw).format("YYYY-MM-DD");

            var something = dates.filter((value) => {
                return moment(value).format("YYYY-MM-DD") == formattedDate;
            })

            if(something == ""){
                dates.add(formattedDate);
            }
        }
    }
    res.send(dates);
})

module.exports = router;