$(document).ready(() => {
    // switch selected day in adding/editing dentist schedule
    $(".ui .button").on('click', (event) => {
        var temp = $(event.target)[0];
        if(temp.className.includes("active")) {
            $(temp).removeClass("active");
        } else {
            $(temp).addClass("active");
        }
    })
    
    // slide down accordion in add schedule
    $(".ui .checkbox").on('change', (event) => {
        var id = $(event.target)[0].id;
        if(id == "mon-daily") {
            if($(event.target)[0].checked && !$("#mon-repeat")[0].checked) {
                $("#mon-repeat-field").addClass("disabled");
                $("#mon-repeat").attr("disabled", "disabled");
            } else {
                $("#mon-repeat-field").removeClass("disabled");
                $("#mon-repeat").removeAttr("disabled");
            }
        } else {
            if(id == "mon-custom") {
                $("body").find("#" + id + "-schedule").slideToggle("slow");
            } else if(id == "mon-repeat") {
                $("body").find("#" + id + "-content").slideToggle("slow");
                if($(event.target)[0].checked && !$("#mon-daily")[0].checked) {
                    $("#mon-daily-field").addClass("disabled");
                    $("#mon-daily").attr("disabled","disabled");
                } else {
                    $("#mon-daily-field").removeClass("disabled");
                    $("#mon-daily").removeAttr("disabled");
                }
            }
        }
    });
})

// Setting default button on modal when ENTER key is pressed
$(document).keypress((event) => {
    if(event.keyCode == 13) {
        if($("#setting-modal")[0].className.includes("active")) {
            $("#save-password").click();
        } else if($("#add-user-modal")[0].className.includes("active")) {
            $("#create-user-button").click();
        } else if($("#add-dentist-modal")[0].className.includes("active")) {
            $("#create-dentist-button").click();
        } else if($("#procedure-modal")[0].className.includes("active")) {
            $("#create-procedure-button").click();
        } else if($("#delete-procedure-modal")[0].className.includes("active")) {
            $("#delete-procedure-button").click();
        } else if($("#delete-user-modal")[0].className.includes("active")) {
            $("#delete-user-button").click();
        } else if($("#edit-user-modal")[0].className.includes("active")) {
            $("#edit-user-button").click();
        } else if($("#edit-dentist-modal")[0].className.includes("active")) {
            $("#edit-dentist-button").click();
        } else if($("#edit-procedure-modal")[0].className.includes("active")) {
            $("#edit-procedure-button").click();
        }
    }
})

// MODALS
$("#adding-schedule-modal").modal({
    onHidden: () => {
        $(".ui .button").removeClass("active");
        $(".ui .checkbox").checkbox('uncheck');
        $(".accordion .content").css({
            display: 'none'
        })
    }
})

$("#add").click(() => {
    $("#create-modal").modal("show");
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