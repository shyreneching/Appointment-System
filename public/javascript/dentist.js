//Resize window
var oldWidth, newWidth;
window.onresize = resizePage;

$(document).ready(() => {
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
            // update table rows
        }
    });

    // Set view chooser
    $('#view-chooser').dropdown({
        onChange: function (value) {
            if (value == "week-view") {
                $('#view-chooser').dropdown('set selected', 'week-view');
                $('#filter-dropdown').dropdown('set selected', 'available');
            } else if (value == "month-view") {
                $('#view-chooser').dropdown('set selected', 'week-view');
            }
            let date = $('#standard_calendar').calendar('get date');
            initializeTHead(date);
            // update table rows
        }
    });

    //Set Today
    $('#today').click(function () {
        setViewToDay();
        $('#standard_calendar').calendar('set date', moment().toDate(), true, false);
        initializeTHead(moment().toDate());
        // update table rows
    });

    //Set Next and Prev Buttons
    $('#next-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if(viewType == "week-view") {
            let nextWeek = moment(date).clone().add(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            // update table rows
        } else if(viewType == "month-view") {

        }
    });

    $('#prev-button').click(function () {
        let date = $('#standard_calendar').calendar('get date');
        let viewType = $('#view-chooser').dropdown('get value');

        if(viewType == "week-view") {
            let nextWeek = moment(date).clone().subtract(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
            // update table rows
        } else if(viewType == "month-view") {

        }
    });

    // Initialize Table header
    initializeTHead(moment().toDate());

    let focusDate = $('#standard_calendar').calendar('get focusDate');

    let momentDate = moment(focusDate).format("MMM D YYYY").toString();
    let sentData = {
        date: momentDate
    };

    $.post("/dentist/weekly_view", sentData, function (data) {
        $('.active.dimmer').toggle();
        // Compile Data
        let template = Handlebars.compile(data.htmlData);
        $('#the-body').html(template(data.data));
        //Set up sticky top
        $('#main-menu').sticky({
            context: '#schedule-table'
        });
    });
})

function setViewToDay() {
    $('#view-chooser').dropdown('set selected', 'week-view');
    $('#filter-dropdown').dropdown('set selected', 'available');
}

async function initializeTHead(date) {

    // $('.active.dimmer').toggle();
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

        let oneDay = {
            "day": moment(singleDate).format("dddd").toString(),
            "date": moment(singleDate).format("D").toString(),
            "chosen": chosenDay,
            "today": todayDay
        };
        theadData.push(oneDay);
    }
    let htmlData = await $.get("/dentist/table_header", function (data) {
        return data;
    });

    // Compiles date data-------------------------------------------------
    $('.active.dimmer').toggle();
    let template = Handlebars.compile(htmlData);
    $('#the-header').html(template(theadData));

    $(".with.tooltip").popup({
        delay: {
            show: 500,
            hide: 50
        }
    })

    resizePage();

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
        });
    }
};

function onLoad() {
    oldWidth = window.innerWidth;
    $('#view-chooser').dropdown('set selected', 'week-view');
    $('#filter-dropdown').dropdown('set selected', 'available');
}

function resizePage() {
    var text = $(".smaller-marbottom");
    newWidth = window.innerWidth;
    if(oldWidth != newWidth) {
        if(newWidth <= 600) {
            $(text[0]).text($(text[0]).text().substring(0, 3));
            $(text[1]).text($(text[1]).text().substring(0, 3));
            $(text[2]).text($(text[2]).text().substring(0, 3));
            $(text[3]).text($(text[3]).text().substring(0, 3));
            $(text[4]).text($(text[4]).text().substring(0, 3));
            $(text[5]).text($(text[5]).text().substring(0, 3));
            $(text[6]).text($(text[6]).text().substring(0, 3));
        } else {
            $(text[0]).text("Sunday");
            $(text[1]).text("Monday");
            $(text[2]).text("Tuesday");
            $(text[3]).text("Wednesday");
            $(text[4]).text("Thursday");
            $(text[5]).text("Friday");
            $(text[6]).text("Saturday");
        }
        oldWidth = newWidth;
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