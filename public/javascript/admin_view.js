var accountDeleteID, procedureDeleteID, accountDeleteUsername;
var defaultButton;

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
        }
    }
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
            },
            success: function(value) {
                location.reload();      
            }
        })
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

$("#procedure-modal").modal({
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
            success: function(value) {
                if(value.message) {
                    location.reload();
                } else {
                    $("#username-field-user").addClass("error");
                    $('body').toast({message: "Username already taken"});
                }
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
            success: function(value) {
                if(value.message) {
                    location.reload();
                } else {
                    $("#username-field-dentist").addClass("error");
                    $('body').toast({message: "Username already taken"});
                }
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
            success: function(value) {
                if(value.message) {
                    location.reload();
                } else {
                    $("#procedure-field").addClass("error");
                    $('body').toast({message: "Procedure already exist"});
                }
            }
        })
    }
})

$("#delete-user-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteAccount",
        data: {
            accountID: accountDeleteID,
            accountUsername: accountDeleteUsername
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
    var statusList = $(".ui .toggle");
    for(var i = 0; i < statusList.length; i++) {
        if($(statusList[i]).text().trim() == "Unavailable") {
            $(statusList[i]).removeClass("active");
        }
    }

    var password = $(".password");
    for(var i = 0; i < password.length; i++) {
        $(password[i]).text(getHash($(password[i]).data("id")));
    }
}

function getHash(text) {
    var hash = "";
    for(var i = 0; i < text.length; i++) {
        hash += "●";
    }
    return hash;
}

function change() {
    var status = $(this).text().trim(); 
    if(status == 'Available') {
        $(this).removeClass("active");
        $(this).text("Unavailable");
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
        $(this).addClass("active");
        $(this).text("Available");
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
            accountDeleteUsername = $(this).data("username");
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