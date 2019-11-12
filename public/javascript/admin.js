var accountID, procedureID, accountUsername;
var defaultButton, currTab, userType;

$(document).ready(() => {
    // validation if username exist
    $("#add-username-user").focusout(() => {
        $.ajax({
            type: "post",
            url: "/admin/validateUsername",
            data:  {
                username: $("#add-username-user").val()
            },
            success: (value) => {
                if(value.message) {
                    $("#username-field-user").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username already taken"
                    });
                }
            }
        })
    })
    $("#add-username-dentist").focusout(() => {
        $.ajax({
            type: "post",
            url: "/admin/validateUsername",
            data:  {
                username: $("#add-username-dentist").val()
            },
            success: (value) => {
                if(value.message) {
                    $("#username-field-dentist").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username already taken"
                    });
                }
            }
        })
    })

    // function to access the loaded table
    $('#table').on("click", (event) => {
        var temp = event.target;
        if($(temp).text().trim() != "" && temp.id != "filter-dropdown") {
            if(currTab == "Users") {    // accessing elements in users tab
                if($(temp).text() == "Delete") {
                    $("#delete-user-modal").modal("show");
                    $("#modal-text-delete-user").text($(event.target).data("username"));

                    // setting temporary value
                    accountID = $(temp).data("id");
                    accountUsername = $(temp).data("username");
                } else if($(event.target).text() == "Edit") {
                    // setting temporary value
                    accountID = $(temp).data("id");
                    accountUsername = $(temp).data("username");

                    // getting the user object to be edited
                    $.ajax({
                        type: "post",
                        url: "admin/getUser",
                        data: {
                            username: accountUsername
                        },
                        success: (value) => {
                            let user = value.user;
                            let doctor = value.doctor;
                            if(user.accountType == "dentist") {
                                $("#edit-dentist-modal").modal("show");
                                $("#edit-firstname-dentist").val(doctor.firstname);
                                $("#edit-lastname-dentist").val(doctor.lastname);
                                $("#edit-username-dentist").text(user.username);
                            } else {
                                $("#edit-user-modal").modal("show");
                                $("#edit-username-user").text(user.username);
                            }
                        }
                    })
                }
            } else if(currTab == "Dentist") {   // accessing elements in dentist tab
                if($(temp).text() == "Add Schedule") {
                    $("#adding-schedule-modal").modal("show");    
                    $("#doctor-name").text("Dr. " + $(temp).data("firstname") + " " + $(temp).data("lastname"));
                } else if($(temp).text() == "Edit Schedule") {
                    
                }
            } else if(currTab == "Procedure") { // accessing elements in procedure tab
                if($(temp).text() == "Delete") {
                    $("#delete-procedure-modal").modal("show");
                    $("#modal-text-delete-procedure").text($(temp).data("name"));
                } else if($(temp).text() == "Edit") {
                    $("#edit-procedure-modal").modal("show");
                    $("#old-procedure-name").text($(temp).data("name"));
                }
                
                // setting temporary value
                procedureID = $(temp).data("id");
            }
        } 
    })
})

// RESETING ADMIN PASSWORD
$("#save-password").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#current-password").val() == "") {
        $("#current-password-field").addClass("error");
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input your current password"
        });
        done = false;
    } else {
        if($("#current-password").val() != $("#current-password").data("password")) {
            $("#current-password-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Incorrect current password"
            });
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
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input your new password"
        });
        done = false;
    } else {
        if($("#new-password").val() != $("#confirm-new-password").val()) {
            $("#new-password-field").addClass("error");
            $("#confirm-new-password-field").addClass("error");
            $("#new-password").val("");
            $("#confirm-new-password").val("");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Password do not match"
            });
            done = false;
        }
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "/admin/updateAccountPassword",
            data: {
                username: "admin",
                newPassword: $("#new-password").val()
            },
            success: (value) => {
                $("#setting-modal").modal("hide");
                $("#setting-modal").form("clear");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Password successfully reset"
                });
            }
        })
    } 
})

// ADDING SECRETARY/USER
$("#create-user-button").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#add-username-user").val() == "") {
        $("#username-field-user").addClass("error");
        $('body').toast({ 
            class: "error",
            position: "top center",
            message: "Please input a valid username"
        });
        done = false;
    }
    if($("#add-password-user").val() == "" || $("#confirm-password-user").val() == "") {
        if($("#add-password-user").val() == "") {
            $("#password-field-user").addClass("error");
        }
        if($("#confirm-password-user").val() == "") {
            $("#confirm-password-field-user").addClass("error");
        }
        $('body').toast({ 
            class: "error",
            position: "top center",
            message: "Please input a valid password"
        });
        done = false;
    } else {
        if($("#add-password-user").val() != $("#confirm-password-user").val()) {
            $("#password-field-user").addClass("error");
            $("#confirm-password-field-user").addClass("error");
            $("#add-password-user").val("");
            $("#confirm-password-user").val("");
            $('body').toast({ 
                class: "error",
                position: "center",
                message: "Password do not match"
            });
            done = false;
        }
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "/admin/addAccount",
            data: {
                username: $("#add-username-user").val(),
                password: $("#add-password-user").val(),
                type: "secretary",
                doctorID: ""
            },
            success: (value) => {
                if(value.message) {
                    $("#add-user-modal").modal("hide");
                    $('#add-user-modal').form("clear");
                    $.get("/admin/adminUsers", (data) => {
                        $("#table").DataTable().destroy();
                        updateTable(data);
                        $('body').toast({
                            class: "success",
                            position: "top center",
                            message: "New secretary successfully added"
                        });
                    });
                } else {
                    $("#username-field-user").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username already taken"
                    });
                }
            }
        })
    } 
})

// ADDING DENTIST
$("#create-dentist-button").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#add-firstname-dentist").val() == "" || $("#add-lastname-dentist").val() == "") {
        if($("#add-firstname-dentist").val() == "") {
            $("#firstname-field-dentist").addClass("error");
        }
        if($("#add-lastname-dentist").val() == "") {
            $("#lastname-field-dentist").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid name"
        });
        done = false;
    }
    if($("#add-username-dentist").val() == "") {
        $("#username-field-dentist").addClass("error");
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid username"
        });
        done = false;
    }
    if($("#add-password-dentist").val() == "" || $("#confirm-password-dentist").val() == "") {
        if($("#add-password-dentist").val() == "") {
            $("#password-field-dentist").addClass("error");
        }
        if($("#confirm-password-dentist").val() == "") {
            $("#confirm-password-field-dentist").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid password"
        });
        done = false;
    } else {
        if($("#add-password-dentist").val() != $("#confirm-password-dentist").val()) {
            $("#password-field-dentist").addClass("error");
            $("#confirm-password-field-dentist").addClass("error");
            $("#add-password-dentist").val("");
            $("#confirm-password-dentist").val("");
            $('body').toast({ 
                class: "error",
                position: "top center",
                message: "Password do not match"
            });
            done = false;
        }
    }

    if(done) {
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
            success: (value) => {
                if(value.message) {
                    $("#add-dentist-modal").modal("hide");
                    $('#add-dentist-modal').form("clear");
                    $.get("/admin/adminDentist", (data) => {
                        $("#table").DataTable().destroy();
                        updateTable(data);
                        $('body').toast({
                            class: "success",
                            position: "top center",
                            message: "New dentist successfully added"
                        });
                    });
                } else {
                    $("#username-field-dentist").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username already taken"
                    });
                }
            }
        })
    }
})

// ADDING PROCEDURE
$("#create-procedure-button").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#procedure-name").val() == "") {
        $("#procedure-field").addClass("error");
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid procedure name"
        });
        done = false;
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "/admin/addProcess",
            data: {
                name: $("#procedure-name").val()
            },
            success: (value) => {
                if(value.message) {
                    $("#procedure-modal").modal("hide");
                    $('#procedure-modal').form("clear");
                    $.get("/admin/adminProcedure", (data) => {
                        $("#table").DataTable().destroy();
                        updateTable(data);
                        $('body').toast({
                            class: "success",
                            position: "top center",
                            message: "New procedure successfully added"
                        });
                    });
                } else {
                    $("#procedure-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Procedure already exist"
                    });
                }
            }
        })
    }
})

// EDITING SECRETARY/USER
$("#edit-user-button").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#edit-password-user").val() == "" || $("#edit-confirm-password-user").val() == "") {
        if($("#edit-password-user").val() == "") {
            $("#edit-password-field-user").addClass("error");
        }
        if($("#edit-confirm-password-user").val() == "") {
            $("#edit-confirm-password-field-user").addClass("error");
        }   
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid password"
        })
        done = false;
    } else {
        if($("#edit-password-user").val() != $("#edit-confirm-password-user").val()) {
            $("#edit-password-field-user").addClass("error");
            $("#edit-confirm-password-field-user").addClass("error");
            $("#edit-password-user").val("");
            $("#edit-confirm-password-user").val("");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Password do not match"
            })
            done = false;
        }
    }
    if(done) {
        $.ajax({
            type: "post",
            url: "/admin/editAccount",
            data: {
                accountID,
                accountUsername,
                accountPassword: $("#edit-password-user").val()
            },
            success: (value) => {
                $("#edit-user-modal").modal("hide");
                $("#edit-user-modal").form("clear");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Secretary details successfully edited"
                })
            }
        })
    }
})

// EDITING DENTIST
$("#edit-dentist-button").click(() => {
   var done = true;

    // ERROR CHECKING
    if($("#edit-firstname-dentist").val() == "" || $("#edit-lastname-dentist").val() == "") {
        if($("#edit-firstname-dentist").val() == "") {
            $("#edit-firstname-field-dentist").addClass("error");
        }
        if($("#edit-lastname-dentist").val() == "") {
            $("#edit-lastname-field-dentist").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid name"
        });
        done = false;
    }
    if($("#edit-password-dentist").val() == "" || $("#edit-confirm-password-dentist").val() == "") {
        if($("#edit-password-dentist").val() == "") {
            $("#edit-password-field-dentist").addClass("error");
        }
        if($("#edit-confirm-password-dentist").val() == "") {
            $("#edit-confirm-password-field-dentist").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid password"
        });
        done = false;
    } else {
        if($("#edit-password-dentist").val() != $("#edit-confirm-password-dentist").val()) {
            $("#edit-password-field-dentist").addClass("error");
            $("#edit-confirm-password-field-dentist").addClass("error");
            $("#edit-password-dentist").val("");
            $("#edit-confirm-password-dentist").val("");
            $('body').toast({ 
                class: "error",
                position: "top center",
                message: "Password do not match"
            });
            done = false;
        }
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "admin/editDentist",
            data: {
                accountID,
                firstname: $("#edit-firstname-dentist").val(),
                lastname: $("#edit-lastname-dentist").val(),
                password: $("#edit-password-dentist").val()
            },
            success: (value) => {
                $("#edit-dentist-modal").modal("hide");
                $("#edit-dentist-modal").form("clear");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Dentist detail successfully edited"
                })
            }
        })
    }
})

// EDITING PROCEDURE
$("#edit-procedure-button").click(() => {
    var done = true;

    // ERROR CHECKING
    if($("#edit-procedure-name") == "") {
        $("#edit-procedure-field").addClass("error");
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid procedure name"
        });
        done = false;
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "/admin/editProcess",
            data: {
                procedureID,
                name: $("#edit-procedure-name").val()
            },
            success: (value) => {
                if(value.message) {
                    $("#edit-procedure-modal").modal("hide");
                    $("#edit-procedure-modal").form("clear");
                    $.get("/admin/adminProcedure", (data) => {
                        $("#table").DataTable().destroy();
                        updateTable(data);
                        $('body').toast({
                            class: "success",
                            position: "top center",
                            message: "Procedure successfully edited"
                        });
                    });
                } else {
                    $("#edit-procedure-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Procedure already exist"
                    });
                }
            }
        })
    }
})

// DELETING USER
$("#delete-user-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteAccount",
        data: {
            accountID: accountID,
            accountUsername: accountUsername
        },
        success: (value) => {
            $("#delete-user-modal").modal("hide");
            $.get("/admin/adminUsers", (data) => {
                $("#table").DataTable().destroy();
                updateTable(data);
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "User successfully deleted"
                });
            });
        }
    })
})

// DELETING PROCEDURE
$("#delete-procedure-button").click(() => {
    $.ajax({
        type: "post",
        url: "/admin/deleteProcess",
        data: {
            processID: procedureID
        },
        success: (value) => {
            $("#delete-procedure-modal").modal("hide");
            $.get("/admin/adminProcedure", (data) => {
                $("#table").DataTable().destroy();
                updateTable(data);
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Procedure successfully deleted"
                });
            });
        }
    })
})

// Initialization
function setup() {
    var statusList = $(".ui .toggle");
    for(var i = 0; i < statusList.length; i++) {
        if($(statusList[i]).text().trim() == "Unavailable") {
            $(statusList[i]).removeClass("active");
        }
    }

    // load the list of users
    $.get("/admin/adminUsers", (data) => {
        updateTable(data);
    });

    currTab = "Users";
    $(".ui .item:contains('Users')").addClass("active");
    $(".ui .item:contains('Users')").css({'background-color':'#cc1445'});
}

// SWITCH TAB
function switchPage() {
    let page = $(this).text().trim();
    if(page == "Users") {
        $(".ui .item").removeClass("active");
        $(".ui .item").css({'background-color':''});
        $(this).css({'background-color':'#cc1445'});
        $(this).addClass("active");
        currTab = "Users";
        $.get("/admin/adminUsers", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
        });
    } else if(page == "Dentist") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#cc1445'});
        currTab = "Dentist";
        $.get("/admin/adminDentist", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
        });
    } else if(page == "Procedure") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#cc1445'});
        currTab = "Procedure";
        $.get("/admin/adminProcedure", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
        });
    } else if(page == "Reset Password") {
        $("#reset-password-modal").modal("show");
    } else if(page == "Logout") {        
        window.location.href="/logout";
    }
}

// Reload table content
function updateTable(data) {
    let table = Handlebars.compile(data.htmlData.table);
    $("#table").html(table(data.data));
    $("#table").DataTable({
        scrollY: 450,
        scrollCollapse: true,
        responsive: true
    });
}