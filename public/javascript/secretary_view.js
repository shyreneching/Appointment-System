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
            updateTableRows();
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
            updateTableRows();
        }
    });

    //Set Today
    $('#today').click(function () {
        setViewToDay();
        $('#standard_calendar').calendar('set date', moment().toDate(), true, false);
        initializeTHead(moment().toDate());
        updateTableRows();
    });

    //Set Next and Prev Buttons
    $('#next-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view') {
            let nextDay = moment(date).clone().add(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
            updateTableRows();
        } else {
            let nextWeek = moment(date).clone().add(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            updateTableRows();
        }
    });

    $('#prev-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view') {
            let nextDay = moment(date).clone().subtract(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
            updateTableRows();
        } else {
            let nextWeek = moment(date).clone().subtract(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            updateTableRows();
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
        updateTableRows();
    });
});

function updateTableRows() {
    let date = $('#standard_calendar').calendar('get focusDate');
    let choice = $('#filter-dropdown').dropdown('get value');
    let viewType = $('#view-chooser').dropdown('get value');

    let sentData = {
        "date": moment(date).format("MMM D YYYY").toString()
    };

    console.log(`table row updated for ${date} with view ${viewType} and fitler choice ${choice}`);
    let actualName = $('#filter-dropdown').dropdown('get text');

    if (viewType == "week-view") {
        if (choice == 'all') {
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.get("/secretary/week_all", function (data) {
                let template = Handlebars.compile(data);
                $('.active.dimmer').toggle();
                $('#the-body').html(template(null));

                $(".largest.is.three").height($(".three.height.time.slot").height());
            });
        }
        else if (choice == "unav") {
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.get("/secretary/week_unavailable", function (data) {
                let template = Handlebars.compile(data);
                $('.active.dimmer').toggle();
                $('#the-body').html(template(null));
            });
        }
        else if (choice == "av") {
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.get("/secretary/week_available", function (data) {
                let template = Handlebars.compile(data);
                $('.active.dimmer').toggle();
                $('#the-body').html(template(null));
            });
        }
        else {
            $('#the-body').html("");
            $('.active.dimmer').toggle();
            $.get("/secretary/week_one", function (data) {
                let template = Handlebars.compile(data);
                $('.active.dimmer').toggle();
                $('#the-body').html(template({ name: actualName }));
            });
        }
    }
    else {
        if (choice == "all") {
            // Some Screen flair
            $('#the-body').html("");
            $('.active.dimmer').toggle();

            // The ajax query
            $.post("/secretary/day_all", sentData, function (data) {
                let template = Handlebars.compile(data.htmlData);
                $('.active.dimmer').toggle();
                $('#the-body').html(template(data.data));
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
                $('.active.dimmer').toggle();
                $('#the-body').html(template(data.data));
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
    console.log("are u not here");
    // gets days of week
    var days = [];
    var day = startOfWeek;
    while (day <= endOfWeek) {
        days.push(day.toDate());
        day = day.clone().add(1, 'd');
    }

    //Get viewType
    let viewType = $('#view-chooser').dropdown('get value');

    // Set header Text
    if (viewType == "week-view") {
        $('#focus-date-header').text(`${moment(startOfWeek).format('MMMM D, YYYY')} - ${moment(endOfWeek).format('MMMM D, YYYY')}`);
    } else {
        $('#focus-date-header').text(`${moment(date).format('MMMM D, YYYY')}`);
    }

    // Retrieve data
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

    // Compiles date data
    $('.active.dimmer').toggle();
    let template = Handlebars.compile(htmlData);
    $('#the-header').html(template(theadData));

    $('.ui.form').form({
        fields: {
            lastName: 'empty',
            firstName: 'empty',
            time_calendar: 'empty',
            date_calendar: 'empty',
            doctors: 'empty',
            procedures: 'empty'
        }
    });

    $("#add-button").on("click", function () {
        console.log("ashduiahdusah")
        $('#modal1').modal('show');

            // Initialize popup stuff
        $("#date_calendar").calendar({
            type: 'date',
            today: 'true',
            disabledDaysOfWeek: [0],
            initialDate: moment().toDate()
        })

        
        var minDate = new Date();
        var maxDate = new Date();
        minDate.setHours(8);
        minDate.setMinutes(0);
        maxDate.setHours(18);
        maxDate.setMinutes(0);
        $('#time_calendar').calendar({
            type: 'time',
            minTimeGap: 30,
            maxDate: maxDate,
            minDate: minDate,
            initialDate: minDate
        });

        $('#multiDoctor').dropdown();
        $('#multiProcedure').dropdown();

        $("#lastName").keypress(function(){
            $("#fieldLastName").removeClass("error")
        })

        $("#firstName").keypress(function(){
            $("#fieldFirstName").removeClass("error")
        })

        $("#date_calendar").on("click", function(){
            $("#fieldDateCalendar").removeClass("error")
        })

        $("#time_calendar").on("click", function(){
            $("#fieldTimeCalendar").removeClass("error")
        })

        $("#fieldDoctors").on("click", function(){
            $("#fieldDoctors").removeClass("error")
        })

        $("#fieldProcedures").on("click", function(){
            $("#fieldProcedures").removeClass("error")
        })

        $('#modal1').modal({
            onHidden: function () {
                $("#multiDoctor").dropdown("clear")
                $("#multiProcedure").dropdown("clear")
                $("#lastName").val("");
                $("#firstName").val("");
                $("#notes").val("");
                $("#contact").val("");

                $("#fieldProcedures").removeClass("error")
                $("#fieldDoctors").removeClass("error")
                $("#fieldFirstName").removeClass("error")
                $("#fieldLastName").removeClass("error")
            },
            onApprove: async function () {
                let firstName = $('#firstName').val();
                let lastName = $('#lastName').val();
                let contact = $('#contact').val();
                let dateInput = $('#date_calendar').calendar('get date');
                let timeInput = $('#time_calendar').calendar('get date');
                let doctors = $("#multiDoctor").dropdown("get value");
                let procedures = $("#multiProcedure").dropdown("get value");
                let notes = $("#notes").val();

                console.log(dateInput);
                console.log(timeInput);
                var flag = true;

                if (lastName == "") {
                    $("#fieldLastName").addClass("error")
                    flag = false;
                }

                if (firstName == "") {
                    $("#fieldFirstName").addClass("error")
                    flag = false;
                }

                if (doctors === undefined || doctors.length == 0) {
                    $("#fieldDoctors").addClass("error")
                    flag = false;
                }

                if (procedures === undefined || procedures.length == 0) {
                    $("#fieldProcedures").addClass("error")
                    flag = false;
                }

                // if all fields are filled
                if (flag){
                    let ajaxData = {
                        firstName: firstName,
                        lastName: lastName,
                        contact: contact,
                        dateInput:dateInput.toString(),
                        timeInput: timeInput.toString(),
                        doctors: doctors,
                        procedures: procedures,
                        notes: notes
                    };

                    console.log(ajaxData);
                    await $.post("/secretary/create", ajaxData, function(data){
                        $('#standard_calendar').calendar('set date', dateInput, true, false);
                        $('#view-chooser').dropdown('set selected', "day-view");
                    
                        initializeTHead(dateInput);
                        updateTableRows();
                        
                    });
                }
                return flag;

            }
        })
    });

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
            updateTableRows();
        });
    }

};

