$(document).ready(function(){


    //Initializes dropdown
    $('.ui.dropdown').dropdown();
    setViewToDay();
    $('#filter-dropdown').dropdown('set selected', 'all');

    // Initializes
    $.get("/secretary_week_all", function (data){
        let template = Handlebars.compile(data);
        $('.active.dimmer').toggle();
        $('#the-body').html(template(null));
        $('#main-menu').sticky({
            context: '#schedule-table'
        });
    });

    //Sets Calendar
    $('#standard_calendar').calendar({
        type: 'date',
        today: false,
        initialDate: moment().toDate(),
        onChange: function(){
            let date = $(this).calendar('get focusDate');
            setViewToDay();
            initializeTHead(date);
        }
    });

    // Set view chooser
    $('#view-chooser').dropdown({
        onChange: function(value){
            if (value="week-view"){
                $('.docs-avail').removeClass('disabled');
            }
            let date = $('#standard_calendar').calendar('get focusDate');
            initializeTHead(date);
        }
    });

    //Set Today
    $('#today').click (function(){
        setViewToDay();
        $('#standard_calendar').calendar('set date', moment().toDate(), true, false);
        initializeTHead(moment().toDate());
    });

    //Set Next and Prev Buttons
    $('#next-button').click(function(){
        let date = $('#standard_calendar').calendar('get focusDate');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view'){
            let nextDay = moment(date).clone().add(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
        } else {
            let nextWeek = moment(date).clone().add(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
        }
    });

    $('#prev-button').click(function(){
        let date = $('#standard_calendar').calendar('get focusDate');
        let viewType = $('#view-chooser').dropdown('get value');

        if (viewType == 'day-view'){
            let nextDay = moment(date).clone().subtract(1, 'd');
            $('#standard_calendar').calendar('set date', nextDay.toDate(), true, false);
            initializeTHead(nextDay.toDate());
        } else {
            let nextWeek = moment(date).clone().subtract(7, 'd');
            $('#standard_calendar').calendar('set date', nextWeek.toDate(), true, false);
            initializeTHead(nextWeek.toDate());
        }
    });

    // Initialize Table header
    initializeTHead(moment().toDate());

    // Filter dropdown ajax calls
    $('#filter-dropdown').dropdown('setting', 'onChange', function(){
        let choice = $(this).dropdown('get value');
        let actualName = $(this).dropdown('get text');

        if (choice == 'all'){
            $('#the-body').html("");
            $('.loader').toggle();
            $.get("/secretary_week_all", function (data){
                let template = Handlebars.compile(data);
                $('.loader').toggle();
                $('#the-body').html(template(null));
            });
        } else if (choice == "unav"){
            $('#the-body').html("");
            $('.loader').toggle();
            $.get("/secretary_week_unavailable", function (data){
                let template = Handlebars.compile(data);
                $('.loader').toggle();
                $('#the-body').html(template(null));
            });
        } else if (choice == "av"){
            $('#the-body').html("");
            $('.loader').toggle();
            $.get("/secretary_week_available", function (data){
                let template = Handlebars.compile(data);
                $('.loader').toggle();
                $('#the-body').html(template(null));
            });
        } else {
            $('#the-body').html("");
            $('.loader').toggle();
            $.get("/secretary_week_one", function (data){
                let template = Handlebars.compile(data);
                $('.loader').toggle();
                $('#the-body').html(template({name: actualName}));
            });
        }
    });
});

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
async function initializeTHead(date){

    $('.loader').toggle();
    let today = moment().toDate();
    var startOfWeek = moment(date).startOf('week');
    var endOfWeek = moment(date).endOf('week');
    
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
    if (viewType == "week-view"){
        $('#focus-date-header').text(`${moment(startOfWeek).format('MMMM D, YYYY')} - ${moment(endOfWeek).format('MMMM D, YYYY')}`);
    } else {
        $('#focus-date-header').text(`${moment(date).format('MMMM D, YYYY')}`);
    }

    // Retrieve data
    let theadData = [];
    for (var i = 0; i < 7; i++){
        let oneDate = days[i];
        let singleDate = moment(oneDate);
        //if chosen
        let chosenDay = "";

        //if today
        let todayDay = "";
        if(singleDate.isSame(today, 'date')){
        todayDay = "yes";
        } 
        
        if (viewType == "day-view"){
        if(singleDate.isSame(date, 'date')){
            chosenDay = "yes";
        } 
        }

        let oneDay = {
        "day" : moment(singleDate).format("dddd").toString(),
        "date" : moment(singleDate).format("D").toString(),
        "chosen" : chosenDay,
        "today" : todayDay
        };
        theadData.push(oneDay);
    }

    let htmlData = await $.get("/secretary_table_header", function (data){
        return data;
    });

    $('.loader').toggle();
    let template = Handlebars.compile(htmlData);
    $('#the-header').html(template(theadData));

    for (var i = 0; i < 7; i++){
        let oneDate = days[i];
        let singleDate = moment(oneDate);
        let dayID = moment(singleDate).format("dddd").toString();

        let dateString = moment(singleDate).format("D").toString();
        let compareDate = parseInt(dateString);

        if (compareDate < 10){
            $(`#${dayID}`).addClass('thin');
        } else {
            $(`#${dayID}`).addClass('fat');
        }

        $(`#${dayID}`).click(function(){
            setViewToDay();
            initializeTHead(oneDate);
            $('#standard_calendar').calendar('set date', singleDate.toDate(), true, false);
        });
    }
    
};
