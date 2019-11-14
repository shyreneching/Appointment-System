var accor_show;

$(document).ready(() => {
    $(".ui .calendar").calendar({
        type: "time",   
        minTimeGap: 30
    })
    
    // slide down accordion in add schedule
    $(".ui .checkbox").on('change', (event) => {
        var id = $(event.target)[0].id;
        if(id == "daily") {
            if($(event.target)[0].checked && !$("#repeat")[0].checked) {
                $("#repeat-field").addClass("disabled");
                $("#repeat").attr("disabled", "disabled");
            } else {
                $("#repeat-field").removeClass("disabled");
                $("#repeat").removeAttr("disabled");
            }
        } else {
            if(id == "custom") {
                accor_show = !accor_show;
                if(accor_show) {
                    $("#first-schedule").css({'color': 'black'});
                } 
                $("body").find("#" + id + "-schedule").slideToggle(500, () => {
                    if(!accor_show) {
                        $("#first-schedule").css({'color': 'white'});
                    }
                });
            } else if(id == "repeat") {
                $("body").find("#" + id + "-content").slideToggle(500);
                if($(event.target)[0].checked && !$("#daily")[0].checked) {
                    $("#daily-field").addClass("disabled");
                    $("#daily").attr("disabled","disabled");
                } else {
                    $("#daily-field").removeClass("disabled");
                    $("#daily").removeAttr("disabled");
                }
            }
        }
        $("#daily-field").removeClass("error");
        $("#report-field").removeClass("error");
    });
})

// Setting default button on modal when ENTER key is pressed
$(document).keypress((event) => {
    if(event.keyCode == 13) {
        if($("#reset-password-modal")[0].className.includes("active")) {
            $("#save-password").click();
        } else if($("#add-user-modal")[0].className.includes("active")) {
            $("#create-user-button").click();
        } else if($("#add-dentist-modal")[0].className.includes("active")) {
            $("#create-dentist-button").click();
        } else if($("#procedure-modal")[0].className.includes("active")) {
            $("#create-procedure-button").click();
        } 
        // else if($("#delete-procedure-modal")[0].className.includes("active")) {
        //     $("#delete-procedure-button").click();
        // } else if($("#delete-user-modal")[0].className.includes("active")) {
        //     $("#delete-user-button").click();
        // } 
        else if($("#edit-user-modal")[0].className.includes("active")) {
            $("#edit-user-button").click();
        } else if($("#edit-dentist-modal")[0].className.includes("active")) {
            $("#edit-dentist-button").click();
        } else if($("#edit-procedure-modal")[0].className.includes("active")) {
            $("#edit-procedure-button").click();
        } else if($("#adding-schedule-modal")[0].className.includes("active")) {
            $("#add-schedule-button").click();
        }
    }
})

// MODALS
$("#add").click(() => {
    $("#create-modal").modal("show");
})

$("#add-schedule").click(() => {
    $("#schedule-modal").modal("deny");
    $("#adding-schedule-modal").modal("show");
    $("#doctor-name").text("Dr. " + $("#schedule-modal").data("firstname") + " " + $("#schedule-modal").data("lastname"));
    $("#adding-schedule-header").text("Add Schedule");
})

$("#add-sec-button").click(() => {
    $("#add-user-modal").modal('show');
    $("#add-dentist-modal").form('clear');
    $("#procedure-modal").form('clear');
})

$("#add-dentist-button").click(() => {  
    $("#add-dentist-modal").modal('show');
    $("#add-user-modal").form('clear');
    $("#procedure-modal").form('clear');
})

$("#add-procedure-button").click(() => {
    $("#procedure-modal").modal('show');
    $("#add-user-modal").form('clear');
    $("#add-dentist-modal").form('clear');
})

$("#edit-user-modal").modal({
    onShow: function() {
        $("#edit-user-modal").form("clear");
    }
})

$("#edit-dentist-modal").modal({
    onShow: function() {
        $("#edit-dentist-modal").form("clear");
    }
})

$("#edit-procedure-modal").modal({
    onShow: function() {
        $("#edit-procedure-modal").form("clear");
    }
})