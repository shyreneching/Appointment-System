// resize window
var oldWidth, newWidth;
var startOfWeek, endOfWeek;
window.onresize = () => {
    oldWidth = newWidth;
    newWidth = $(window).width();
    resizePage();
};
window.onload = () => {
    $('#up-button').fadeOut({
        duration: 0
    }); 
    resizePage();
}

$(document).ready(() => {
    $(window).scroll(function(){ 
        if ($(this).scrollTop() > 100) { 
            $('#up-button').fadeIn(); 
        } else { 
            $('#up-button').fadeOut(); 
        } 
    }); 
    $('#up-button').click(function(){ 
        $("html, body").animate({ scrollTop: 0 }, 500); 
        return false; 
    });

    //Sets Calendar
    $('#standard_calendar').calendar({
        type: 'date',
        today: false,
        initialDate: moment().toDate(),
        onChange: function () {
            let date = $(this).calendar('get focusDate');
            initializeTHead(date);
            // update table rows
        }
    });

    //Set Today
    $('#today').click(function () {       
        $('#standard_calendar').calendar('set date', moment().toDate(), true, false);
        initializeTHead(moment().toDate());
        // update table rows
    });

    //Set Next and Prev Buttons
    $('#next-button').click(nextWeek);
    $('#prev-button').click(prevWeek);
    $('#next-icon').click(nextWeek);
    $('#prev-icon').click(prevWeek);

    // Initialize Table header
    initializeTHead(moment().toDate());

    let focusDate = $('#standard_calendar').calendar('get focusDate');

    let momentDate = moment(focusDate).format("MMM D YYYY").toString();
    let sentData = {
        date: momentDate
    };

    $.post("/dentist/weekly_view", sentData, function (data) {
        // Compile Data
        let template = Handlebars.compile(data.htmlData);
        $('#the-body').html(template(data.data));
        //Set up sticky top
        $('#main-menu').sticky({
            context: '#schedule-table'
        });
    });
})

// go to next week
function nextWeek() {
    let date = $('#standard_calendar').calendar('get date');
    let nextWeek = moment(date).clone().add(7, 'd');
    $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
    initializeTHead(nextWeek.toDate());
}

// go to previous week
function prevWeek() {
    let date = $('#standard_calendar').calendar('get date');
    let nextWeek = moment(date).clone().subtract(7, 'd');
    $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
    initializeTHead(nextWeek.toDate());
}

// intialize the header of the page
async function initializeTHead(date) {
    let today = moment().toDate();
    startOfWeek = moment(date).startOf('week');
    endOfWeek = moment(date).endOf('week');

    // sets weekly header-----------------------------------------------
    $("#weekly-status").text(moment(date).format("dddd, D MMMM YYYY"));

    // gets days of week-------------------------------------------------
    var days = [];
    var day = startOfWeek;
    while (day <= endOfWeek) {
        days.push(day.toDate());
        day = day.clone().add(1, 'd');
    }

    // Retrieve data-------------------------------------------------
    let theadData = [];
    for (var i = 0; i < 7; i++) {
        let oneDate = days[i];
        let singleDate = moment(oneDate);
        //if chosen
        let chosenDay = "";
        if (singleDate.isSame(date, 'date')) {
            chosenDay = "yes";
        }

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
    let template = Handlebars.compile(htmlData);
    $('#the-header').html(template(theadData));

    $(".with.tooltip").popup({
        delay: {
            show: 500,
            hide: 50
        }
    })

    newWidth = $(window).width();
    if(oldWidth != newWidth) {
        resizePage();
    }

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

        if(i == 0) {
            $(`#${dayID}`).attr("href","#one");
        } else if(i == 1) {
            $(`#${dayID}`).attr("href","#two");
        } else if(i == 2) {
            $(`#${dayID}`).attr("href","#three");
        } else if(i == 3) {
            $(`#${dayID}`).attr("href","#four");
        } else if(i == 4) {
            $(`#${dayID}`).attr("href","#five");
        } else if(i == 5) {
            $(`#${dayID}`).attr("href","#six");
        } else if(i == 6) {
            $(`#${dayID}`).attr("href","#seven");
        }

        $(`#${dayID}`).click(function () {
            initializeTHead(oneDate);
            $('#standard_calendar').calendar('set date', singleDate.toDate(), true, false);
            console.log(url);
            // update table rows
        });
    }
};

// setup to resize page
function resizePage() {
    if(newWidth > 1024) {
        $('#focus-date-header').text(`${moment(startOfWeek).format('MMMM D, YYYY')} - ${moment(endOfWeek).format('MMMM D, YYYY')}`);
        expand();
        // resize fonts of the page
        $("#the-body").css({'font-size':'14px'});
        $("#the-header").css({'font-size':'18px'});
        $("#focus-date-header").css({'font-size':'22px'});
        $("#weekly-status").css({'font-size':''});
        // show and hide the components for mobile and desktop view
        $(".omit").show(); 
        $(".omit-reverse").hide();
    } else {
        $('#focus-date-header').text(`${moment(startOfWeek).format('MMM D, YYYY')} - ${moment(endOfWeek).format('MMM D, YYYY')}`);
        if(newWidth <= 425) {
            omit();
            // resize fonts of the page
            $("#the-body").css({'font-size':'2.5vw'});
            $("#the-header").css({'font-size':'2vw'});
            $("#focus-date-header").css({'font-size':'4vw'});
            $("#weekly-status").css({'font-size':'4vw'});
            // show and hide the components for mobile and desktop view
            $(".omit").hide();
            $(".omit-reverse").show();
        } else if(newWidth > 425 && newWidth <= 768) {
            omit();
            // resize fonts of the page
            $("#the-body").css({'font-size':'2vw'});
            $("#the-header").css({'font-size':'2vw'});
            $("#focus-date-header").css({'font-size':'2.5vw'});
            $("#weekly-status").css({'font-size':'2.5vw'});
            // show and hide the components for mobile and desktop view
            $(".omit").hide();
            $(".omit-reverse").show();
        } else if(newWidth > 768 && newWidth <= 1024) {
            expand();
            // resize fonts of the page
            $("#the-body").css({'font-size':'14px'});
            $("#the-header").css({'font-size':'1.5vw'});
            $("#focus-date-header").css({'font-size':'2vw'});
            $("#weekly-status").css({'font-size':''});
            // show and hide the components for mobile and desktop view
            $(".omit").show();
            $(".omit-reverse").hide();
        }
    }
    newWidth = oldWidth;
}

// trim and adjust the day to screen
function omit() {
    var text = $(".smaller-marbottom");
    $(text[0]).text("S");
    $(text[1]).text("M");
    $(text[2]).text("T");
    $(text[3]).text("W");
    $(text[4]).text("H");
    $(text[5]).text("F");
    $(text[6]).text("S");
}

// expand and adjust the day to screen
function expand() {
    var text = $(".smaller-marbottom");
    $(text[0]).text("Sunday");
    $(text[1]).text("Monday");
    $(text[2]).text("Tuesday");
    $(text[3]).text("Wednesday");
    $(text[4]).text("Thursday");
    $(text[5]).text("Friday");
    $(text[6]).text("Saturday");
}

$("#logoutButton").click(function () {
    window.location.href = "/logout";
})

$("#logoutButton").hover(function () {
    $(this).addClass("red")
}, function () {
    $(this).removeClass("red")
})