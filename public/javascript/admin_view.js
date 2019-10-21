var accountDeleteID;

$(document).ready(() => {
    $(".ui .button").on("click", click);
})

$(document).on("keydown", () => {
    $("#usernameField").removeClass("error");
    $("#passwordField").removeClass("error");
    $("#confirmPasswordField").removeClass("error");
})

$(".field").on("click", () => {
    $("#checkbox1").removeClass("error");
    $("#checkbox2").removeClass("error");
})

$(".menu .item").tab({
    alwaysRefresh: true,
    onVisible: function() {
        localStorage.setItem("page", $(this).attr("data-tab"));
    }
});

$("#addUser").modal({
    onShow: function() {
        $('#addUser').form("clear");
    }
})

$("#user-button").click(() => {
    $("#addUser").modal("show");
})

$("#createUser-button").click((e) => {
    var done = true;
    if($("#addUsername").val() == "") {
        $("#usernameField").addClass("error");
        done = false;
    }
    if($("#addPassword").val() == "") {
        $("#passwordField").addClass("error");
        done = false;
    }
    if($("#confirmPassword").val() == "") {
        $("#confirmPasswordField").addClass("error");
        done = false;
    }
    if($("input[name='frequency']:checked").length == 0) {
        $("#checkbox1").addClass("error");
        $("#checkbox2").addClass("error");
        done = false;
    }
    if($("#addPassword").val() != $("#confirmPassword").val()) {
        $("#passwordField").addClass("error");
        $("#confirmPasswordField").addClass("error");
        done = false;
    }
    var temp = $("input[name='frequency']:checked")[0].value;

    if(!done) {
        e.preventDefault();
    } else {
        $.ajax({
            type: "post",
            url: "/admin/addAccount",
            data: {
                username: $("#addUsername").val(),
                password: $("#addPassword").val(),
                type: temp
            },
            success: function(data) {
                location.reload();
            }
        })
    }
})

$("#dentist-button").click(() => {
    // $.ajax({
    //     type: "post",
    //     url: "/admin/addDentist",
    //     success: function(data) {
    //         location.reload();
    //     }
    // })
})

$("#procedure-button").click(() => {
    // $.ajax({
    //     type: "post",
    //     url: "/admin/addProcess",
    //     success: function(data) {
    //         location.reload();
    //     }
    // })
})

$("#deleteUser-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteAccount",
        data: {
            accountID: accountDeleteID
        }
    })
    location.reload();
})

$("#cancelDeleteUser-button").click(() => {
    
})

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

function click() {
    tab = $(this).parent().parent().parent().parent().parent().attr("data-tab");
    if(tab == "first") {
        if($(this).text() == "Delete") {
            $("#deleteUser").modal("show");
            $("#modal-text-delete-user").text($(this).data("username"));
            accountDeleteID = $(this).data("id");
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