var accountDeleteID, procedureDeleteID;

$(document).ready(() => {
    $(".ui .button").on("click", click);
    $(".ui .toggle").on("click", change);
})

$(document).on("keydown", () => {
    $("#username-field-user").removeClass("error");
    $("#password-field-user").removeClass("error");
    $("#confirm-password-field-user").removeClass("error");
    $("#firstname-field-dentist").removeClass("error");
    $("#lastname-field-dentist").removeClass("error");
    $("#username-field-dentist").removeClass("error");
    $("#password-field-dentist").removeClass("error");
    $("#confirm-password-field-dentist").removeClass("error");
    $("#procedure-field").removeClass("error");
    $("#current-password-field").removeClass("error");
    $("#new-password-field").removeClass("error");
    $("#confirm-new-password-field").removeClass("error");
})

$(".field").on("click", () => {
    $("#checkbox-dentist").removeClass("error");
    $("#checkbox-secretary").removeClass("error");
})

$(".menu .item").tab({
    alwaysRefresh: true,
    onVisible: function() {
        localStorage.setItem("page", $(this).attr("data-tab"));
    }
});

$("#setting").click(() => {
    $("#setting-modal").modal("show");
})

$("#save-password").click((e) => {
    var done = true;
    if($("#current-password").val() == "") {
        $("#current-password-field").addClass("error");
        $('body').toast({message: "Please input your current password"});
        done = false;
    } else {
        if($("#current-password").val() != $("#current-password").data("password")) {
            $("#current-password-field").addClass("error");
            $('body').toast({message: "Incorrect current password"});
            done = false;
        }   
    }
    if($("#new-password").val() == "" || $("#confirm-new-password").val() == "") {
        if($("#new-password").val() == "") {
            $("#new-password-field").addClass("error");
        }
        if($("#confirm-new-password").val() == "") {
            $("#confirm-new-password-field").addClass("error");
        }
        $('body').toast({message: "Please input your new password"});
        done = false;
    } else {
        if($("#new-password").val() != $("#confirm-new-password").val()) {
            $("#new-password-field").addClass("error");
            $("#confirm-new-password-field").addClass("error");
            $("#new-password").val("");
            $("#confirm-new-password").val("");
            $('body').toast({message: "Password do not match"});
            done = false;
        }
    }

    if(!done) {
        e.preventDefault();
    } else {
        $.ajax({
            type: "post",
            url: "/admin/updateAdminPassword",
            data: {
                newPassword: $("#new-password").val()
            }
        })
        location.reload();
    }
})

$("#add-user-modal").modal({
    onShow: function() {
        $('#add-user-modal').form("clear");
    }
})

$("#add-dentist-modal").modal({
    onShow: function() {
        $('#add-dentist-modal').form("clear");
    }
})

$("procedure-modal").modal({
    onShow: function() {
        $("#procedure-modal").form("clear");
    }
});

$("#add-user-button").click(() => {
    $("#add-user-modal").modal("show");
})

$("#create-user-button").click((e) => {
    var done = true;
    if($("#add-username-user").val() == "") {
        $("#username-field-user").addClass("error");
        $('body').toast({ message: "Please input a valid username"});
        done = false;
    }
    if($("#add-password-user").val() == "" || $("#confirm-password-user").val() == "") {
        if($("#add-password-user").val() == "") {
            $("#password-field-user").addClass("error");
        }
        if($("#confirm-password-user").val() == "") {
            $("#confirm-password-field-user").addClass("error");
        }
        $('body').toast({ message: "Please input a valid password"});
        done = false;
    } else {
        if($("#add-password-user").val() != $("#confirm-password-user").val()) {
            $("#password-field-user").addClass("error");
            $("#confirm-password-field-user").addClass("error");
            $("#add-password-user").val("");
            $("#confirm-password-user").val("");
            $('body').toast({ message: "Password do not match"});
            done = false;
        }
    }

    if(!done) {
        e.preventDefault();
    } else {
        $.ajax({
            type: "post",
            url: "/admin/addAccount",
            data: {
                username: $("#add-username-user").val(),
                password: $("#add-password-user").val(),
                type: "secretary",
                doctorID: ""
            },
            success: function(data) {
                location.reload();
            }
        })
    }
})

$("#add-dentist-button").click(() => {
    $("#add-dentist-modal").modal("show");
})

$("#create-dentist-button").click(() => {
    var done = true;
    if($("#add-firstname-dentist").val() == "" || $("#add-lastname-dentist").val() == "") {
        if($("#add-firstname-dentist").val() == "") {
            $("#firstname-field-dentist").addClass("error");
        }
        if($("#add-lastname-dentist").val() == "") {
            $("#lastname-field-dentist").addClass("error");
        }
        $('body').toast({message: "Please input a valid name"});
        done = false;
    }
    if($("#add-username-dentist").val() == "") {
        $("#username-field-dentist").addClass("error");
        $('body').toast({message: "Please input a valid username"});
        done = false;
    }
    if($("#add-password-dentist").val() == "" || $("#confirm-password-dentist").val() == "") {
        if($("#add-password-dentist").val() == "") {
            $("#password-field-dentist").addClass("error");
        }
        if($("#confirm-password-dentist").val() == "") {
            $("#confirm-password-field-dentist").addClass("error");
        }
        $('body').toast({message: "Please input a valid password"});
        done = false;
    } else {
        if($("#add-password-dentist").val() != $("#confirm-password-dentist").val()) {
            $("#password-field-dentist").addClass("error");
            $("#confirm-password-field-dentist").addClass("error");
            $("#add-password-dentist").val("");
            $("#confirm-password-dentist").val("");
            $('body').toast({ message: "Password do not match"});
            done = false;
        }
    }

    if(!done) {
        e.preventDefault();
    } else {
        $.ajax({
            type: "post",
            url: "/admin/addDentist",
            data: {
                firstname: $("#add-firstname-dentist").val(), 
                lastname: $("#add-lastname-dentist").val(), 
                username: $("#add-username-dentist").val(),
                password: $("#add-password-dentist").val(),
                type: "dentist",
                status: "Available"
            },
            success: function(data) {
                location.reload();
            }
        })
    }
})

$("#add-procedure-button").click(() => {
    $("#procedure-modal").modal("show");
})

$("#create-procedure-button").click((e) => {
    var done = true;
    if($("#procedure-name").val() == "") {
        $("#procedure-field").addClass("error");
        $('body').toast({message: "Please input a valid procedure name"});
        done = false;
    }

    if(!done) {
        e.preventDefault();
    } else {
        $.ajax({
            type: "post",
            url: "/admin/addProcess",
            data: {
                name: $("#procedure-name").val()
            },
            success: function(data) {
                location.reload();
            }
        })
    }
})

$("#delete-user-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteAccount",
        data: {
            accountID: accountDeleteID
        }
    })
    location.reload();
})

$("#delete-procedure-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteProcess",
        data: {
            processID: procedureDeleteID
        }
    })
    location.reload();
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
    var status = $("#status-toggle").text().trim(); 
    if(status == "Unavailable") {
        $("#status-toggle").removeClass("active");
    }
}

function change() {
    var status = $("#status-toggle").text().trim(); 
    if(status == 'Available') {
        $("#status-toggle").removeClass("active");
        $("#status-toggle").text("Unavailable");
        $.ajax({
            type: "post",
            url: "/admin/editDentist",
            data: {
                change: "status",
                doctorID: $(this).data("id"),
                status: "Unavailable"
            }
        })
    } else if(status == 'Unavailable') {
        $("#status-toggle").addClass("active");
        $("#status-toggle").text("Available");
        $.ajax({
            type: "post",
            url: "/admin/editDentist",
            data: {
                change: "status",
                doctorID: $(this).data("id"),
                status: "Available"
            }
        })
    }
}

function click() {
    tab = $(this).parent().parent().parent().parent().parent().attr("data-tab");
    if(tab == "first") {
        if($(this).text() == "Delete") {
            $("#delete-user-modal").modal("show");
            $("#modal-text-delete-user").text($(this).data("username"));
            accountDeleteID = $(this).data("id");
        } else if($(this).text() == "Edit") {
            
        }
    } else if(tab == "second") {
        if($(this).text() == "Edit") {
    
        }
    } else if(tab == "third") {
        if($(this).text() == "Delete") {
            $("#delete-procedure-modal").modal("show");
            $("#modal-text-delete-procedure").text($(this).data("name"));
            procedureDeleteID = $(this).data("id");
        } else if($(this).text() == "Edit") {
    
        }
    }
}