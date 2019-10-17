var tab;
var defaultIndex;

$(document).ready(() => {
    $(".ui .button").on("click", click);
    $(".menu .item").tab({
        alwaysRefresh: true
    });
})

$("#user-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/addAccount",
        success: function(data) {
            location.reload();
        }
    })
})

$("#dentist-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/addDentist",
        success: function(data) {
            location.reload();
        }
    })
})

$("#procedure-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/addProcess",
        success: function(data) {
            location.reload();
        }
    })
})

function click() {
    tab = $(this).parent().parent().parent().parent().parent().attr("data-tab");
    if(tab == "first") {
        if($(this).text() == "Delete") {
            $.ajax({
                type: "post",
                url: "/admin/deleteAccount",
                data: {
                    accountID: $(this).data("id")
                }
            })
        } else if($(this).text() == "Edit") {
    
        }
    } else if(tab == "second") {
        if($(this).text() == "Delete") {
            $.ajax({
                type: "post",
                url: "/admin/deleteDentist",
                data: {
                    doctorID: $(this).data("id")
                }
            })
        } else if($(this).text() == "Edit") {
    
        }
    } else if(tab == "third") {
        if($(this).text() == "Delete") {
            $.ajax({
                type: "post",
                url: "/admin/deleteProcess",
                data: {
                    processID: $(this).data("id")
                }
            })
        } else if($(this).text() == "Edit") {
    
        }
    }
}

function load() {
    console.log("loading...");
}