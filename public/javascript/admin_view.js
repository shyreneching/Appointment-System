$(document).ready(() => {
    $(".ui .button").on("click", click);
})

$(".menu .item").tab({
    alwaysRefresh: true,
    onVisible: function() {
        localStorage.setItem("page", $(this).attr("data-tab"));
    }
});

$("#logout").click(() => {
    localStorage.setItem("page", "first");
    window.location.href="/logout";
})

function setup() {
    if(localStorage.getItem("page") == "") {
        localStorage.setItem("page", "first");    
    }
    $.tab("change tab", localStorage.getItem("page"));
    $(".menu .item").removeClass("active");
    var list = $(".menu .item"); 
    var tab;
    for(var i = 0; i < list.length; i++) {
        if($(list[i]).attr("data-tab") == localStorage.getItem("page")) {
            tab = list[i];
            break;
        }
    }
    $(tab).addClass("active");
}

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
            location.reload();
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
            location.reload();
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
            location.reload();
        } else if($(this).text() == "Edit") {
    
        }
    }
}