var accountDeleteID, procedureDeleteID, accountDeleteUsername;
var defaultButton, currTab;

$(document).ready(() => {
    // $(".ui .toggle").on("click", change);
    $(".ui .item").on("click", switchPage);

    $.get("/admin/adminUsers", function (data) {
        let template = Handlebars.compile(data.htmlData);
        $('#content').html(template(data.data));
    });

    $('#content').on("click", (event) => {
        if($(event.target).text() != "") {
            if(currTab == "Users") {
                if($(event.target).text() == "Delete") {
                    $("#delete-user-modal").modal("show");
                    $("#modal-text-delete-user").text($(event.target).data("username"));
                    accountDeleteID = $(event.target).data("id");
                    accountDeleteUsername = $(event.target).data("username");
                } else if($(event.target).text() == "Edit") {

                }
            } else if(currTab == "Dentist") {

            } else if(currTab == "Procedure") {
                if($(event.target).text() == "Delete") {
                    $("#delete-procedure-modal").modal("show");
                    $("#modal-text-delete-procedure").text($(event.target).data("name"));
                    procedureDeleteID = $(event.target).data("id");
                } else if($(event.target).text() == "Edit") {
            
                }
            }
        } else {
            if(event.target.id == "add-user-button") {
                $("#add-user-modal").modal("show");
            } else if(event.target.id == "add-dentist-button") {
                $("#add-dentist-modal").modal("show");                
            } else if(event.target.id == "add-procedure-button") {
                $("#procedure-modal").modal("show");
            }
        }
    })
})

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
                    $("#add-user-modal").modal("hide");
                    $.get("/admin/adminUsers", (data) => {
                        let template = Handlebars.compile(data.htmlData);
                        $('#content').html(template(data.data));
                    });
                } else {
                    $("#username-field-user").addClass("error");
                    $('body').toast({message: "Username already taken"});
                }
            }
        })
    }
})

$("#create-dentist-button").click((e) => {
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
                    $("#add-dentist-modal").modal("hide");
                    $.get("/admin/adminDentist", (data) => {
                        let template = Handlebars.compile(data.htmlData);
                        $('#content').html(template(data.data));
                    });
                } else {
                    $("#username-field-dentist").addClass("error");
                    $('body').toast({message: "Username already taken"});
                }
            }
        })
    }
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
                    $("#procedure-modal").modal("hide");
                    $.get("/admin/adminProcedure", (data) => {
                        let template = Handlebars.compile(data.htmlData);
                        $('#content').html(template(data.data));
                    });
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
        },
        success: function(data) {
            $("#delete-user-modal").modal("hide");
            $.get("/admin/adminUsers", (data) => {
                let template = Handlebars.compile(data.htmlData);
                $('#content').html(template(data.data));
            });
        }
    })
})

$("#delete-procedure-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteProcess",
        data: {
            processID: procedureDeleteID
        },
        success: function(data) {
            $("#delete-procedure-modal").modal("hide");
            $.get("/admin/adminProcedure", (data) => {
                let template = Handlebars.compile(data.htmlData);
                $('#content').html(template(data.data));
            });
        }
    })
})

$("#logout").click(() => {
    window.location.href="/logout";
})

// RESETTING ERRORS
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
        }
    }
})

// Initialization
function setup() {
    var statusList = $(".ui .toggle");
    for(var i = 0; i < statusList.length; i++) {
        if($(statusList[i]).text().trim() == "Unavailable") {
            $(statusList[i]).removeClass("active");
        }
    }

    currTab = "Users";
    $(".ui .item:contains('Users')").addClass("active");
    $(".ui .item:contains('Users')").css({'background-color':'#cc1445'});
}

function switchPage() {
    let page = $(this).text().trim();
    if(page == "Users") {
        $(".ui .item").removeClass("active");
        $(".ui .item").css({'background-color':''});
        $(this).css({'background-color':'#cc1445'});
        $(this).addClass("active");
        currTab = "Users";
        $.get("/admin/adminUsers", function (data) {
            let template = Handlebars.compile(data.htmlData);
            $('#content').html(template(data.data)); 
        });
    } else if(page == "Dentist") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#cc1445'});
        currTab = "Dentist";
        $.get("/admin/adminDentist", function (data) {
            let template = Handlebars.compile(data.htmlData);
            $('#content').html(template(data.data)); 
        });
    } else if(page == "Procedure") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#cc1445'});
        currTab = "Procedure";
        $.get("/admin/adminProcedure", function (data) {
            let template = Handlebars.compile(data.htmlData);
            $('#content').html(template(data.data)); 
        });
    } else if(page == "Reset Password") {
        $("#setting-modal").modal("show");
    } else if(page == "Logout") {        
        window.location.href="/logout";
    }
}

// Switching the status of dentist
// function change() {
//     var status = $(this).text().trim(); 
//     if(status == 'Available') {
//         $(this).removeClass("active");
//         $(this).text("Unavailable");
//         $.ajax({
//             type: "post",
//             url: "/admin/editDentist",
//             data: {
//                 change: "status",
//                 doctorID: $(this).data("id"),
//                 status: "Unavailable"
//             }
//         })
//     } else if(status == 'Unavailable') {
//         $(this).addClass("active");
//         $(this).text("Available");
//         $.ajax({
//             type: "post",
//             url: "/admin/editDentist",
//             data: {
//                 change: "status",
//                 doctorID: $(this).data("id"),
//                 status: "Available"
//             }
//         })
//     }
// }