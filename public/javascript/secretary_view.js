
$(document).ready(function () {


    //Initializes dropdown
    $('.ui.dropdown').dropdown();
    setViewToDay();
    $('#filter-dropdown').dropdown('set selected', 'all');

    //Sets Calendar
    $('#standard_calendar').calendar({
        type: 'date',
        today: false,
        initialDate: moment().toDate(),
        onChange: function () {
            let date = $(this).calendar('get focusDate');
            setViewToDay();
            initializeTHead(date);
            updateTableRows(date);
        }
    });

    // Set view chooser
    $('#view-chooser').dropdown({
        onChange: function (value) {
            if (value == "week-view") {
                $('.docs-avail').removeClass('disabled');
            } else if (value = "day-view") {
                $('.docs-avail').addClass('disabled');
                let filterChoice = $('#filter-dropdown').dropdown('get value');

                if (filterChoice == "unav" || filterChoice == "av") {
                    $('#filter-dropdown').dropdown('set selected', 'all');
                }
            }
            let date = $('#standard_calendar').calendar('get date');
            initializeTHead(date);
            updateTableRows(date);
        }
    });

    //Set Today
    $('#today').click(function () {
        setViewToDay();
        $('#standard_calendar').calendar('set date', moment().toDate(), true, false);
        initializeTHead(moment().toDate());
        updateTableRows(moment().toDate());
    });

    //Set Next and Prev Buttons
    $('#next-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view') {
            let nextDay = moment(date).clone().add(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
            updateTableRows(nextDay.toDate());
        } else {
            let nextWeek = moment(date).clone().add(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            updateTableRows(nextWeek.toDate());
        }
    });

    $('#prev-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view') {
            let nextDay = moment(date).clone().subtract(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
            updateTableRows(nextDay.toDate());
        } else {
            let nextWeek = moment(date).clone().subtract(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            updateTableRows(nextWeek.toDate());
        }
    });



    // Initialize Table header
    initializeTHead(moment().toDate());

    let focusDate = $('#standard_calendar').calendar('get focusDate');
    let choice = $('#filter-dropdown').dropdown('get value');
    let viewType = $('#view-chooser').dropdown('get value');

    let momentDate = moment(focusDate).format("MMM D YYYY").toString();
    let sentData = {
        date: momentDate
    };

    $.post("/secretary/day_all", sentData, function (data) {
        $('.active.dimmer').toggle();
        // Compile Data
        let template = Handlebars.compile(data.htmlData);
        $('#the-body').html(template(data.data));
        //Set up sticky top
        $('#main-menu').sticky({
            context: '#schedule-table'
        });



    });

    // Filter dropdown ajax calls
    $('#filter-dropdown').dropdown('setting', 'onChange', function () {
        let date = $('#standard_calendar').calendar('get date');
        updateTableRows(date);
    });

    // Initializes form-------------------------------------------------
    $('.ui.form').form({
        fields: {
            'add-lastName': 'empty',
            'add-firstName': 'empty',
            'add-time_calendar': 'empty',
            'add-date_calendar': 'empty',
            'add-doctors': 'empty',
            'add-procedures': 'empty'
        }
    });

    $('#add-save-button').on('click', function () {
        addAppointment();
    });

    //INFO SHORTCUTS---------------------------------------------------------------------------------------------------------
    var page = 1
    var maxPages = 4;
    $("#info-modal").modal({
        onVisible: function () {
            getInfoShortcuts()
            $(document).unbind('keydown')
        },
        onHide: function () {
            initializeShortcutsMain()
        },
        onApprove: function () {
            page++
            if (page > 1) {
                $("#demoBack").removeClass("disabled")
            }
            if (page == maxPages) {
                $("#demoNext>").remove()
                $("#demoNext").text("")
                $("#demoNext").append("Done")
                $("#demoNext").append("<i class='checkmark icon'></i>")
            } else {
                $("#demoNext>").remove()
                $("#demoNext").text("")
                $("#demoNext").append("Next")
                $("#demoNext").append("<i class='chevron right icon'></i>")
            }


            if (page <= maxPages) {

                getInfoShortcuts()
                return false;
            } else {
                $('#infoContainer>').remove();
                return true;
            }
        },
        onDeny: function () {
            page--
            if (page == 1) { $("#demoBack").addClass("disabled") }
            if (page == maxPages) {
                $("#demoNext>").remove()
                $("#demoNext").text("")
                $("#demoNext").append("Done")
                $("#demoNext").append("<i class='checkmark icon'></i>")
            } else {
                $("#demoNext>").remove()
                $("#demoNext").text("")
                $("#demoNext").append("Next")
                $("#demoNext").append("<i class='chevron right icon'></i>")
            }
            getInfoShortcuts()

            return false
        }
    })

    $('#demoExit').on('click', function () {
        $('#info-modal').modal('hide')
        $('#infoContainer>').remove();
    })

    $('#shortcutsInfo').on('click', function () {
        page = 1;
        $("#demoBack").addClass("disabled")
        $('#info-modal').modal('show')
    })

    $('#shortcutsInfo').hover(function () {
        $(this).addClass("blue");
    }, function () {
        $(this).removeClass("blue");
    })

    var getInfoShortcuts = async function () {
        var info = 'info'
        var link = info + page;
        var htmlData = await $.post("/secretary/" + link, 'someData', function (data) {
            return data.htmlData
        })


        let template = Handlebars.compile(htmlData.htmlData);
        $('#infoContainer').html(template());
    }





    initializeShortcutsMain();

});

function updateTableRows(date) {
    let choice = $('#filter-dropdown').dropdown('get value');
    let viewType = $('#view-chooser').dropdown('get value');

    let sentData = {
        "date": moment(date).format("MMM D YYYY").toString()
    };

    // console.log(`table row updated for ${date} with view ${viewType} and fitler choice ${choice}`);
    let actualName = $('#filter-dropdown').dropdown('get text');

    // Dates for week view
    var startOfWeek = moment(date).startOf('week');
    var endOfWeek = moment(date).endOf('week');

    // gets days of week-------------------------------------------------
    var days = [];
    var day = startOfWeek;
    while (day <= endOfWeek) {
        days.push(day.toDate().toString());
        day = day.clone().add(1, 'd');
    }



    if (viewType == "week-view") {
        if (choice == 'all' || choice == 'all1') {
            let weekData = {
                "dates": days
            }
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.post("/secretary/week_all", weekData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));
                console.log(data.data)
                $(".slot.in.week").each(function () {
                    let oneSlot = this;
                    $(oneSlot).find(".less-cell-count").each(function () {
                        $(this).height($(oneSlot).find(".max-cell-count").height());
                    });

                })

                $('.active.dimmer').toggle();

                // $(".hoverable.swa").popup({
                //     inline: true,
                //     delay: {
                //         show: 500,
                //         hide: 50
                //     },
                //     boundary: ".hoverable.swa",
                //     position: "right center",
                //     lastResort: "right center"

                // })

            });
        }
        else if (choice == "unav") {
            let weekData = {
                "dates": days
            }
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.post("/secretary/week_unavailable", weekData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));

                $(".slot.in.week").each(function () {
                    let oneSlot = this;
                    $(oneSlot).find(".less-cell-count").each(function () {
                        $(this).height($(oneSlot).find(".max-cell-count").height());
                    });

                })
                $('.active.dimmer').toggle();

            });
        }
        else if (choice == "av") {
            let weekData = {
                "dates": days
            }
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.post("/secretary/week_available", weekData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));

                $(".slot.in.week").each(function () {
                    let oneSlot = this;
                    $(oneSlot).find(".less-cell-count").each(function () {
                        $(this).height($(oneSlot).find(".max-cell-count").height());
                    });
                })
                $('.active.dimmer').toggle();

            });
        }
        else {
            let weekData = {
                "dates": days,
                "doctor": choice
            }
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.post("/secretary/week_one", weekData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));

                $(".slot.in.week").each(function () {
                    let oneSlot = this;
                    $(oneSlot).find(".less-cell-count").each(function () {
                        $(this).height($(oneSlot).find(".max-cell-count").height());
                    });

                })
                $("#filter-heading-title").html(`Weekly Appointments of ${actualName}`);

                $('.active.dimmer').toggle();
            });
        }
    }
    else {
        if (choice == "all" || choice == 'all1') {
            // Some Screen flair
            $('#the-body').html("");
            $('.active.dimmer').toggle();

            // The ajax query
            $.post("/secretary/day_all", sentData, function (data) {
                // console.log(data.data)
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));
                $('.active.dimmer').toggle();
                if (isPast()) {
                    $(".tsda").removeClass("hoverable")
                } else {
                    $(".tsda").addClass("hoverable")
                }
            });


        } else {

            //Some Screen flair
            $('#the-body').html("");
            $('.active.dimmer').toggle();


            console.log(choice);
            let sendData = {
                "date": moment(date).format("MMM D YYYY").toString(),
                "doctor": choice
            };


            // The ajax query
            $.post("/secretary/day_one", sendData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('#the-body').html(template(data.data));
                $('.active.dimmer').toggle();
                if (isPast()) {
                    $(".tsdo").removeClass("hoverable")
                } else {
                    $(".tsdo").addClass("hoverable")
                }

            });
        }
    }
}

/*
 
    This function sets the view type to day view.
    This also disables the option to filter the view by availability of doctors.
 
*/
function setViewToDay() {
    $('#view-chooser').dropdown('set selected', 'day-view');
    $('.docs-avail').addClass('disabled');
}

/*
 
    This function governs how the week's view of dates are show in the table header.
    This is also where the on clicks are set for each.
 
*/
async function initializeTHead(date) {

    $('.active.dimmer').toggle();
    let today = moment().toDate();
    var startOfWeek = moment(date).startOf('week');
    var endOfWeek = moment(date).endOf('week');

    // gets days of week-------------------------------------------------
    var days = [];
    var day = startOfWeek;
    while (day <= endOfWeek) {
        days.push(day.toDate());
        day = day.clone().add(1, 'd');
    }

    //Get viewType-------------------------------------------------
    let viewType = $('#view-chooser').dropdown('get value');

    // Set header Text
    if (viewType == "week-view") {
        $('#focus-date-header').text(`${moment(startOfWeek).format('MMMM D, YYYY')} - ${moment(endOfWeek).format('MMMM D, YYYY')}`);
    } else {
        $('#focus-date-header').text(`${moment(date).format('MMMM D, YYYY')}`);
    }

    // Retrieve data-------------------------------------------------
    let theadData = [];
    for (var i = 0; i < 7; i++) {
        let oneDate = days[i];
        let singleDate = moment(oneDate);
        //if chosen
        let chosenDay = "";

        //if today
        let todayDay = "";
        if (singleDate.isSame(today, 'date')) {
            todayDay = "yes";
        }

        if (viewType == "day-view") {
            if (singleDate.isSame(date, 'date')) {
                chosenDay = "yes";
            }
        }

        let oneDay = {
            "day": moment(singleDate).format("dddd").toString(),
            "date": moment(singleDate).format("D").toString(),
            "chosen": chosenDay,
            "today": todayDay
        };
        theadData.push(oneDay);
    }
    let htmlData = await $.get("/secretary/table_header", function (data) {
        return data;
    });

    // Compiles date data-------------------------------------------------
    $('.active.dimmer').toggle();
    let template = Handlebars.compile(htmlData);
    $('#the-header').html(template(theadData));





    //Initializes Add button-------------------------------------------
    $("#add-button").on("click", function () {
        addAppointmentModal()
    });

    $(".with.tooltip").popup({
        delay: {
            show: 500,
            hide: 50
        }
    })



    // Sets up the on click of the week dates displayed----------------------------------------
    for (var i = 0; i < 7; i++) {
        let oneDate = days[i];
        let singleDate = moment(oneDate);
        let dayID = moment(singleDate).format("dddd").toString();

        let dateString = moment(singleDate).format("D").toString();
        let compareDate = parseInt(dateString);

        if (compareDate < 10) {
            $(`#${dayID}`).addClass('thin');
        } else {
            $(`#${dayID}`).addClass('fat');
        }

        $(`#${dayID}`).click(function () {
            setViewToDay();
            initializeTHead(oneDate);
            $('#standard_calendar').calendar('set date', singleDate.toDate(), true, false);
            updateTableRows(oneDate);
        });
    }

};



var resetModalState = function () {
    $("#add-multiDoctor").dropdown("clear")
    $("#add-multiProcedure").dropdown("clear")
    $("#add-lastName").val("");
    $("#add-firstName").val("");
    $("#add-notes").val("");
    $("#add-contact").val("");

    $("#add-fieldProcedures").removeClass("error")
    $("#add-fieldDoctors").removeClass("error")
    $("#add-fieldContact").removeClass("error")
    $("#add-fieldFirstName").removeClass("error")
    $("#add-fieldLastName").removeClass("error")
    //rebinding keydown
    console.log("BIND SHORTCUTS")
    initializeShortcutsMain();
}

$('#discard').on('click', function () {
    resetModalState()
})

var addAppointmentModal = function () {
    $(document).unbind('keydown')

    $("#add-date_calendar").removeClass("disabled")
    $("#add-time_calendar").removeClass("disabled")
    // $('#add-appointment-modal').modal('toggle');
    // Initialize popup stuff




    $('#add-multiProcedure').dropdown();

    $("#add-lastName").keypress(function () {
        $("#add-fieldLastName").removeClass("error")
    })

    $("#add-firstName").keypress(function () {
        $("#add-fieldFirstName").removeClass("error")
    })

    $("#add-contact").keypress(function () {
        $("#add-fieldContact").removeClass("error")
    })

    $("#add-date_calendar").on("click", function () {
        $("#add-fieldDateCalendar").removeClass("error")
    })

    $("#add-time_calendar").on("click", function () {
        $("#add-fieldTimeCalendar").removeClass("error")
    })

    $("#add-fieldDoctors").on("click", function () {
        $("#add-fieldDoctors").removeClass("error")
    })

    $("#add-fieldProcedures").on("click", function () {
        $("#add-fieldProcedures").removeClass("error")
    })



    var unbindShorcuts = function () {
        console.log("UNBINDED")
        $(document).unbind("keydown")
    }


    $('#add-appointment-date-modal').modal({
        transition: "fade",
        closable: false,
        duration: 500,
        queue: true,
        onApprove: async function () {
            var date = $('#add-date_calendar').calendar('get date')
            var time = $('#add-time_calendar').calendar('get date')

            var datetime = {
                dateInput: date.toString(),
                timeInput: time.toString()
            }

            await $.post("/secretary/getAvailableDoctors", datetime, function (data) {

                let template = Handlebars.compile(data.htmlData);
                $('#add-fieldDoctors').html(template(data.data));
                $('#add-multiDoctor').dropdown();
            });
        },
        onDeny: function () {
            $('#cancelConfirmation').modal('show')

            $('#cancelDiscard').on('click', function () {
                $("#add-appointment-date-modal").modal("show")
                $('#cancelDiscard').unbind('click')
            })
        },
        onShow: function () {
            $(document).keydown(modalDateHandler);
        },
        onHidden: function () {
            $(document).unbind('keydown', modalDateHandler);
        }

    })

    $('#add-appointment-modal').modal({
        transition: "fade",
        closable: false,
        duration: 500,
        queue: true,
        onApprove: function () {
            resetModalState()
        },
        onShow: function () {
            unbindShorcuts()
            $(document).keydown(modalHandler)
        },
        onHidden: function () {
            $(document).unbind('keydown', modalHandler)
        },
        onDeny: function () {
            $('#cancelConfirmation').modal('show')
            $('#cancelDiscard').on('click', function () {
                $("#add-appointment-modal").modal("show")
                $('#cancelDiscard').unbind('click')
            })
        }
    }).modal('attach events', '#add-appointment-date-modal #date-done')

    $('#cancelConfirmation').modal({
        transition: "fly down",
        closable: false,
        duration: 400
    })

  

    $('#add-step-date').on('click', function () {
        $("#add-appointment-date-modal").modal('show')
    })


    $("#add-date_calendar").calendar({
        type: 'date',
        today: 'true',
        disabledDaysOfWeek: [0],
        initialDate: moment().toDate(),
        minDate: moment().toDate()
    })

    var minDate = new Date();
    var maxDate = new Date();
    minDate.setHours(8);
    minDate.setMinutes(0);
    maxDate.setHours(18);
    maxDate.setMinutes(0);
    $('#add-time_calendar').calendar({
        type: 'time',
        minTimeGap: 30,
        maxDate: maxDate,
        minDate: minDate,
        initialDate: minDate
    });

    $('#add-appointment-date-modal').modal('show');

}

$('#add-back-button').on('click', function () {
    $("#add-appointment-date-modal").modal('show')
})

async function addAppointment() {
    let firstName = $('#add-firstName').val();
    let lastName = $('#add-lastName').val();
    let contact = $('#add-contact').val();
    let dateInput = $('#add-date_calendar').calendar('get date');
    let timeInput = $('#add-time_calendar').calendar('get date');
    let doctors = $("#add-multiDoctor").dropdown("get value");
    let procedures = $("#add-multiProcedure").dropdown("get value");
    let notes = $("#add-notes").val();

    var isValid = true;

    if (firstName == "") {
        $("#add-fieldFirstName").addClass("error");
        $('#add-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing First Name!',
                position: 'bottom right'
            });
        isValid = false;
    } else {
        var valid = new RegExp("^[a-zA-Z]{2,}$").test(firstName);
        if (!valid) {
            $("#add-fieldFirstName").addClass("error");
            $('#add-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'First Name should only  contain letters and contain at least 2 characters',
                    position: 'bottom right'
                });
            isValid = false;
        }
    }

    if (lastName == "") {
        $("#add-fieldLastName").addClass("error");
        $('#add-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing Last Name',
                position: 'bottom right'
            });
        isValid = false;
    } else {
        var valid = new RegExp("^[a-zA-Z-]{2,}$").test(lastName);
        if (!valid) {
            $("#add-fieldLastName").addClass("error");
            $('#add-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'Last Name should only only contain letters.',
                    position: 'bottom right'
                });
            isValid = false;
        }
    }

    if (doctors === undefined || doctors.length == 0) {
        $("#add-fieldDoctors").addClass("error");
        $('#add-appointment-modal')
            .toast({
                class: 'error',
                message: 'An appointment needs at least one doctor',
                position: 'bottom right'
            });
        isValid = false;
    }

    if (procedures === undefined || procedures.length == 0) {
        $("#add-fieldProcedures").addClass("error");
        $('#add-appointment-modal')
            .toast({
                class: 'error',
                message: 'An appointment needs at least one procedure',
                position: 'bottom right'
            });
        isValid = false;
    }

    if (contact != "") {
        // "[+]?[\\d]"
        let regex = /^[+-]?\d{7,12}$/;
        let test = regex.test(contact);

        if (!test) {
            $("#add-fieldContact").addClass("error");
            $('#add-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'Invalid contact number format',
                    position: 'bottom right'
                });

            isValid = false;
        }
    } else {
        $("#add-fieldContact").addClass("error");
        $('#add-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing contact number',
                position: 'bottom right'
            });
        isValid = false;
    }

    if (isValid) {
        let checkData = {
            dateInput: dateInput.toString(),
            timeInput: timeInput.toString(),
            doctors: doctors
        };

        await $.post("/secretary/check_app_exists", checkData, function (data) {

            if (data == true) {
                $("#add-fieldDoctors").addClass("error");
                $('#add-appointment-modal')
                    .toast({
                        class: 'error',
                        message: 'Doctor already booked on date and time',
                        position: 'bottom right'
                    });

                isValid = false;
            } else {
                isValid = true;
            }

        });
    }


    // if all fields are filled
    if (isValid) {
        resetModalState()
        let ajaxData = {
            firstName: firstName,
            lastName: lastName,
            contact: contact,
            dateInput: dateInput.toString(),
            timeInput: timeInput.toString(),
            doctors: doctors,
            procedures: procedures,
            notes: notes
        };

        await $.post("/secretary/create", ajaxData, function (data) {

        });

        $("#add-appointment-modal").modal('toggle');
        $('#standard_calendar').calendar('set date', dateInput, true, false);
        $('#view-chooser').dropdown('set selected', "day-view");

        initializeTHead(dateInput);
        updateTableRows(dateInput);
    }

    return isValid
}

async function openDetailsModal(appointmentID) {
    if (!isPast()) {
        //open second modal on first modal buttons
        $('#deleteConfirmation').modal({
            transition: "fly down"
        }).modal('attach events', '#edit-appointment-modal #edit-delete-button');
        $('#edit-appointment-modal').modal('show');

        $('#edit-cancel-button').unbind('click');
        $('#edit-cancel-button').on('click', function () {
            $('#deleteConfirmation').modal('toggle');
            openDetailsModal(appointmentID);
        });

        $('#edit-continue-button').unbind('click');
        $('#edit-continue-button').on('click', function () {
            $.post("/secretary/delete", { appointmentID: appointmentID }, function (data) {
                $('#deleteConfirmation').modal('hide');
                let date = $('#standard_calendar').calendar('get date');
                updateTableRows(date);
            });
        });


        let appointment = await $.post("/secretary/getAppointment", { appointmentID: appointmentID }, function (data) {
            return data;
        });

        $("#edit-lastName").val(appointment.lastname);
        $("#edit-firstName").val(appointment.firstname);
        $("#edit-notes").val(appointment.notes);
        $("#edit-contact").val(appointment.patientcontact);


        // Initialize popup stuff
        $("#edit-date_calendar").calendar({
            type: 'date',
            today: 'true',
            disabledDaysOfWeek: [0],
            initialDate: moment(appointment.date).toDate()
        })


        var minDate = new Date();
        var maxDate = new Date();
        minDate.setHours(8);
        minDate.setMinutes(0);
        maxDate.setHours(18);
        maxDate.setMinutes(0);

        var time = appointment.time;
        var startTime = new Date();
        var parts = time.match(/(\d+):(\d+) (AM|PM)/);
        if (parts) {
            var hours = parseInt(parts[1]),
                minutes = parseInt(parts[2]),
                tt = parts[3];
            if (tt === 'PM' && hours < 12) hours += 12;
            startTime.setHours(hours, minutes, 0, 0);
        }

        $('#edit-time_calendar').calendar({
            type: 'time',
            minTimeGap: 30,
            maxDate: maxDate,
            minDate: minDate,
            initialDate: startTime
        });

        $('#edit-multiDoctor').dropdown();
        $('#edit-multiDoctor').dropdown('set selected', appointment.doctor);
        $('#edit-multiProcedure').dropdown();
        $('#edit-multiProcedure').dropdown('set selected', appointment.process);

        $("#edit-lastName").keypress(function () {
            $("#edit-fieldLastName").removeClass("error")
        })

        $("#edit-firstName").keypress(function () {
            $("#edit-fieldFirstName").removeClass("error")
        })

        $("#edit-contact").keypress(function () {
            $("#edit-fieldContact").removeClass("error")
        })

        $("#edit-date_calendar").on("click", function () {
            $("#edit-fieldDateCalendar").removeClass("error")
        })

        $("#edit-time_calendar").on("click", function () {
            $("#edit-fieldTimeCalendar").removeClass("error")
        })

        $("#edit-fieldDoctors").on("click", function () {
            $("#edit-fieldDoctors").removeClass("error")
        })

        $("#edit-fieldProcedures").on("click", function () {
            $("#edit-fieldProcedures").removeClass("error")
        })

        $('#edit-appointment-modal').modal({
            onHidden: function () {
                $("#edit-multiDoctor").dropdown("clear")
                $("#edit-multiProcedure").dropdown("clear")
                $("#edit-lastName").val("");
                $("#edit-firstName").val("");
                $("#edit-notes").val("");
                $("#edit-contact").val("");

                $("#edit-fieldProcedures").removeClass("error")
                $("#edit-fieldDoctors").removeClass("error")
                $("#edit-fieldFirstName").removeClass("error")
                $("#edit-fieldLastName").removeClass("error")
                $("#edit-fieldContact").removeClass("error")
            },
            onVisible: function () {
                $(document).unbind('keydown')
            }
        });


        let doctors = $("#edit-multiDoctor").dropdown("get value");
        $('#edit-save-button').unbind('click')
        $('#edit-save-button').on('click', function () {
            if (editAppointment(appointmentID, doctors)) {
                initializeShortcutsMain()
            }
        });

    }


}



function quickAdd(slot) {
    if (!isPast()) {
        addAppointmentModal();
        let date = $('#standard_calendar').calendar('get date');

        $("#add-date_calendar").calendar({
            type: 'date',
            today: 'true',
            disabledDaysOfWeek: [0],
            initialDate: moment(date).toDate(),
            minDate: moment().toDate()
        })

        $("#add-date_calendar").addClass("disabled")

        var minDate = new Date();
        var maxDate = new Date();
        minDate.setHours(8);
        minDate.setMinutes(0);
        maxDate.setHours(18);
        maxDate.setMinutes(0);

        $('#add-time_calendar').calendar({
            type: 'time',
            minTimeGap: 30,
            maxDate: maxDate,
            minDate: minDate,
            initialDate: moment(slot, 'HH:mm a').toDate()
        });

        $("#add-time_calendar").addClass("disabled")
    }
}

function arraysEqual(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
        return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

}

async function editAppointment(appointmentID, initialDoctors) {
    let firstName = $('#edit-firstName').val();
    let lastName = $('#edit-lastName').val();
    let contact = $('#edit-contact').val();
    let dateInput = $('#edit-date_calendar').calendar('get date');
    let timeInput = $('#edit-time_calendar').calendar('get date');
    let doctors = $("#edit-multiDoctor").dropdown("get value");
    let procedures = $("#edit-multiProcedure").dropdown("get value");
    let notes = $("#edit-notes").val();

    var isValid = true;

    if (firstName == "") {
        $("#edit-fieldFirstName").addClass("error");
        $('#edit-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing First Name!',
                position: 'bottom right'
            });
        isValid = false;
    } else {
        var valid = new RegExp("^[a-zA-Z]{2,}$").test(firstName);
        if (!valid) {
            $("#edit-fieldFirstName").addClass("error");
            $('#edit-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'First Name should only contain letters.',
                    position: 'bottom right'
                });
            isValid = false;
        }
    }

    if (lastName == "") {
        $("#edit-fieldLastName").addClass("error");
        $('#edit-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing Last Name',
                position: 'bottom right'
            });
        isValid = false;
    } else {
        var valid = new RegExp("^[a-zA-Z-]{2,}$").test(lastName);
        if (!valid) {
            $("#edit-fieldLastName").addClass("error");
            $('#edit-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'Last Name should only contain letters.',
                    position: 'bottom right'
                });
            isValid = false;
        }
    }

    if (doctors === undefined || doctors.length == 0) {
        $("#edit-fieldDoctors").addClass("error");
        $('#edit-appointment-modal')
            .toast({
                class: 'error',
                message: 'An appointment needs at least one doctor',
                position: 'bottom right'
            });
        isValid = false;
    }

    if (procedures === undefined || procedures.length == 0) {
        $("#edit-fieldProcedures").addClass("error");
        $('#edit-appointment-modal')
            .toast({
                class: 'error',
                message: 'An appointment needs at least one procedure',
                position: 'bottom right'
            });
        isValid = false;
    }

    if (contact != "") {
        // "[+]?[\\d]"
        let regex = /^[+-]?\d{7,12}$/;
        let test = regex.test(contact);

        if (!test) {
            $("#edit-fieldContact").addClass("error");
            $('#edit-appointment-modal')
                .toast({
                    class: 'error',
                    message: 'Invalid contact number format',
                    position: 'bottom right'
                });

            isValid = false;
        }
    } else {
        $("#edit-fieldContact").addClass("error");
        $('#edit-appointment-modal')
            .toast({
                class: 'error',
                message: 'Missing contact details',
                position: 'bottom right'
            });

        isValid = false;
    }

    if (isValid) {

        if (!arraysEqual(doctors, initialDoctors)) {

            var clone = doctors.slice(0);

            for (var i = 0; i < initialDoctors.length; i++) {
                var index = clone.indexOf(initialDoctors[i]);
                if (index > -1) {
                    clone.splice(index, 1);
                }
            }


            let checkData = {
                dateInput: dateInput.toString(),
                timeInput: timeInput.toString(),
                doctors: clone
            };

            await $.post("/secretary/check_app_exists", checkData, function (data) {

                if (data == true) {
                    $("#edit-fieldDoctors").addClass("error");
                    $('#edit-appointment-modal')
                        .toast({
                            class: 'error',
                            message: 'Doctor already booked on date and time',
                            position: 'bottom right'
                        });

                    isValid = false;
                } else {
                    isValid = true;
                }

            });
        }
    }

    // if all fields are filled
    if (isValid) {
        let ajaxData = {
            appointmentID: appointmentID,
            firstName: firstName,
            lastName: lastName,
            contact: contact,
            dateInput: dateInput.toString(),
            timeInput: timeInput.toString(),
            doctors: doctors,
            procedures: procedures,
            notes: notes
        };

        await $.post("/secretary/edit", ajaxData, function (data) {
            $("#edit-appointment-modal").modal('hide');
            $('#standard_calendar').calendar('set date', dateInput, true, false);
            $('#view-chooser').dropdown('set selected', "day-view");

            initializeTHead(dateInput);
            updateTableRows(dateInput);

        });
    }
    return isValid

}


function initializeShortcutsMain() {
    $(document).on('keydown', function (e) {
        var LEFT = 37,
            RIGHT = 39,
            SPACE = 32,
            ENTER = 13,
            C = 67
        switch (e.keyCode) {
            case LEFT:
                $('#prev-button').trigger('click')
                break;
            case RIGHT:
                $('#next-button').trigger('click')
                break;
            case SPACE:
                $('#today').trigger('click')
                break;
            case ENTER:
                $("#add-button").trigger('click');
                break;
            case C:
                $("#standard_calendar").calendar('popup', 'toggle')
                break;
        }

    });
}

function modalDateHandler(e) {
    var ENTER = 13,
        ESC = 27
    switch (e.keyCode) {
        case ENTER:
            $("#date-done").trigger('click');
            break;
        case ESC:
            $("#date-cancel").trigger('click');
            break;
    }
}

function modalHandler(e) {
    var ENTER = 13,
        ESC = 27
    switch (e.keyCode) {
        case ENTER:
            console.log("ENTER")
            $("#add-save-button").trigger('click');
            break;
        case ESC:
            $("#cancel-appointment").trigger('click');
            break;
    }
}

$("#logoutButton").click(function () {
    window.location.href = "/logout";
})

$("#logoutButton").hover(function () {
    $(this).addClass("red")
}, function () {
    $(this).removeClass("red")
})

function isPast() {
    var focusedDate = moment($("#standard_calendar").calendar('get date'))
    focusDate = focusedDate.add(1, 'd')

    var now = moment()
    if (focusedDate < now) return true;
    return false;
}