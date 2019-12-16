var accountID, procedureID, accountUsername, showToast;
var defaultButton, currTab, userType, days = [], passwordChecker, nameChecker, accor_show, inputChecker, deleteSchedule, unavailableDates;
var editSchedule, editBreaktime, editDay, normal, breaktime, modalReset;

var invalidChar = [".","}","{","&","\"",":","]","[","?",";"];
var checkPassword = /^[0-9a-zA-Z]+$/;

window.onresize = resizePage;

$(document).ready(() => {
    // switch page between users, dentist, and procedure
    $(".ui .item").on("click", switchPage);
    $("input[type='text']").focusin(() => {
        inputChecker = false;
    })    

    $("#add-username-dentist").focusout(() => {
        var check = /^[0-9a-zA-Z]+$/;
        if(inputChecker) {
            if(!$("#add-username-dentist").val().match(check)) {
                $("#username-field-dentist").addClass("error");
                $("body").toast({
                    class: "error",
                    position: "top center",
                    message: "Incorrect username format"
                })
                inputChecker = false;
                nameChecker = false;
            } else if($("#add-username-dentist").val().length < 6) {
                $("#username-field-dentist").addClass("error");
                $("body").toast({
                    class: "error",
                    position: "top center",
                    message: "Username should be at least 6 alphanumeric characters"
                })
                inputChecker = false;
                nameChecker = false;
            } else if($("#add-username-dentist").val().length > 32) {
                $("#username-field-dentist").addClass("error");
                $("body").toast({
                    class: "error",
                    position: "top center",
                    message: "Username is too long"
                })
                inputChecker = false;
                nameChecker = false;
            } else {
                nameChecker = true;
            }
        }
        if(nameChecker) {
            $.ajax({
                type: "post",
                url: "/admin/validateUsername",
                data:  {
                    username: $("#add-username-dentist").val().trim()
                },
                success: (value) => {
                    if(value.message) {
                        $("#username-field-dentist").addClass("error");
                        $('body').toast({
                            class: "error",
                            position: "top center",
                            message: "Username already taken"
                        });
                        inputChecker = false;
                    }
                }
            })
        }
    })

    // Switch between weekly and unavailable
    $("#weekly").click(() => {
        $("#add-schedule").text("Reset");
        $("#weekly").addClass("green");
        $("#unavailable").removeClass("green");
        $('#table-dimmer').addClass("active");
        $.ajax({
            type: 'post',
            url: 'admin/getSchedule',
            data: {
                doctorID: $("#schedule-modal").data("id")
            },
            success: (value) => {
                $('#table-dimmer').removeClass("active");
                let table = Handlebars.compile(value.htmlData);
                $("#table-schedule").html(table(value.data));
                $("#schedule-table").addClass("celled");
                if(value.data.sched == "") {
                    $("#table-detail").text("No available schedules yet");
                } else {
                    $("#table-detail").text("");
                }
                if(!$("#schedule-modal")[0].className.includes("active")) {
                    $("#schedule-modal").modal("show");
                }
            }
        })
    })
    $("#unavailable").click(() => {
        $("#add-schedule").text("Add");
        $("#weekly").removeClass("green");
        $("#unavailable").addClass("green");
        $('#table-dimmer').addClass("active");
        $.ajax({
            type: 'post',
            url: 'admin/getUnavailableDates',
            data: {
                doctorID: $("#schedule-modal").data("id")
            },
            success: (value) => {
                $('#table-dimmer').removeClass("active");
                let table = Handlebars.compile(value.htmlData);
                $("#table-schedule").html(table(value.data));
                $("#schedule-table").removeClass("celled");
                if(value.data.sched == "") {
                    $("#table-detail").text("No unavailable dates yet");
                } else {
                    $("#table-detail").text("");
                }
                if(!$("#schedule-modal")[0].className.includes("active")) {
                    $("#schedule-modal").modal("show");
                }
            }
        })
    })

    // EDITING DENTIST SCHEDULE
    $("#table-schedule").on("click", (event) => {
        var temp = event.target;
        if(temp.id == "delete-unavailable-button") {
            $("#modal-text-delete-unavailable").text($(temp).data("time"));
            $("#confirmation-modal").data("id", $(temp).data("id"));
            $("#confirmation-modal").modal("show");
        } else {
            if($("#weekly")[0].className.includes("green")) {
                editDay = $($(event.target)[0].parentNode).data("day");
                $("#editing-schedule-modal").data("id", $("#schedule-modal").data("id"));
                $("#editing-schedule-modal").data("firstname", $("#schedule-modal").data("firstname"));
                $("#editing-schedule-modal").data("lastname", $("#schedule-modal").data("lastname"));
                $("#editing-schedule-modal").modal("show");    
                $.ajax({
                    type: "post",
                    url: "admin/getDoctorSchedule",
                    data: {
                        doctorID: $("#editing-schedule-modal").data("id")
                    },
                    success: (value) => {
                        editSchedule = value.docSched;
                        editBreaktime = value.breakTime;
                        normal = value.docSched[editDay.toLowerCase()];
                        breaktime = value.breakTime[editDay.toLowerCase()];
                        if(normal != "") {
                            $("#edit-start").val(normal[0].toLowerCase());
                            $("#edit-end").val(normal[1]);
                        } else {
                            $("input[type='text']").val("");
                        }
                        if(breaktime != "" && breaktime != undefined) {   
                            $("#edit-custom")[0]["checked"] = true;
                            $("#edit-start").val(normal[0]);
                            $("#edit-end").val(breaktime[0]);
                            $("#edit-start-add").val(breaktime[1]);
                            $("#edit-end-add").val(normal[1]);
                            accor_show = true;
                            $("#edit-first-schedule").css({'color':'black'})
                            $("#edit-custom-schedule").slideToggle(500);
                        }
                    }
                })
            }
        }
    })

    // switch selected day in adding/editing dentist schedule
    $(".ui .button").on('click', (event) => {
        var temp = $(event.target)[0];
        if(temp.className.includes("active")) {
            $(temp).removeClass("active");
            days = days.filter((value) => {
                return value != temp.name;
            })
        } else {
            $(temp).addClass("active");
            days.push(temp.name);
        }
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
                $("#" + id + "-schedule").slideToggle(500, () => {
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
        if($("#editing-schedule-modal")[0].className.includes("active")) {
            accor_show = !accor_show;
            if(accor_show) {
                $("#edit-first-schedule").css({'color':'black'});
            } 
            $("#edit-custom-schedule").slideToggle(500, () => {
                if(!accor_show) {
                    $("#edit-first-schedule").css({'color':'white'});
                }
            });
        }
        $("#daily-field").removeClass("error");
        $("#report-field").removeClass("error");
    });

    // function to access the loaded table
    $('#table').on("click", (event) => {
        var temp = event.target;
        if($(temp).text().trim() != "" || $(temp).data("name") != "") {
            if(currTab == "Dentist") {   // accessing elements in dentist tab
                if($(temp).text() == "View") {
                    $("#schedule-modal").data("id", $(temp).data("id"));
                    $("#schedule-modal").data("firstname", $(temp).data("firstname"));
                    $("#schedule-modal").data("lastname", $(temp).data("lastname"));
                    $("#doctor-name-schedule").text("Dr. " + $("#schedule-modal").data("firstname") + " " + $("#schedule-modal").data("lastname"));
                    setDataTable("weekly");
                } else if($(temp).text() == "Active") {
                    $(temp).removeClass("active");
                    $(temp).text("Inactive");
                    $.ajax({
                        type: "post",
                        url: "admin/updateDentistStatus",
                        data: {
                            doctorID: $(temp)[0].id,
                            status: "Inactive"
                        }
                    })
                } else if($(temp).text() == "Inactive") {
                    $(temp).addClass("active");
                    $(temp).text("Active");
                    $.ajax({
                        type: "post",
                        url: "admin/updateDentistStatus",
                        data: {
                            doctorID: $(temp)[0].id,
                            status: "Active"
                        }
                    })
                } else if($(temp).data("name") == "delete") {
                    $("#warning").css({'visibility':'visible'});
                    $("#delete-user-modal").modal("show");
                    $("#modal-text-delete-user").text($(temp).data("lastname") + ", " + $(temp).data("firstname"));
                    // setting temporary value
                    doctorID = $(temp).data("id");
                } else if($(temp).data("name") == "edit") {
                    // setting temporary value
                    doctorID = $(temp).data("id");
                    // getting the user object to be edited
                    $.ajax({
                        type: "post",
                        url: "admin/getUser",
                        data: {
                            doctorID
                        },
                        success: (value) => {
                            let user = value.user;
                            let doctor = value.doctor;
                            if(user.accountType == "dentist") {
                                $("#edit-dentist-modal").modal("show");
                                $("#edit-firstname-dentist").val(doctor.firstname);
                                $("#edit-lastname-dentist").val(doctor.lastname);
                                $("#edit-username-dentist").text(user.username);
                            }
                        }
                    })
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
$("#save-password").click(async () => {
    var done = true;

    // ERROR CHECKING
    if($("#current-password").val() == "") {
        $("#current-password-field").addClass("error");
        if(!showToast) {
            showToast = true;
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Please input your current password",
                onHidden: () => {
                    showToast = false;
                }
            });
            done = false;
        }
    } else {
        await $.ajax({
            type: "post",
            url: "admin/checkCurrentAdminPassword",
            data: {
                newPassword: $("#current-password").val().trim()
            },
            success: (value) => {                
                if(!value) {
                    $("#current-password-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Incorrect current password"
                    });   
                    done = false;
                }
            }
        })
    }
    if(!$("#new-password").val().match(checkPassword) || !validateSpecialChar($("#new-password").val().trim())) {
        $("#new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Incorrect password format"
        })
        done = false;
    }
    if($("#new-password").val().length < 10) {
        $("#new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too short"
        })
        done = false;
    }
    if($("#new-password").val().length > 32) {
        $("#new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too long"
        })
        done = false;
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
            url: "admin/updateAccountPassword",
            data: {
                username: "admin",
                newPassword: $("#new-password").val()
            },
            success: (value) => {
                $("#reset-password-modal").modal("hide");
                $("#reset-password-modal").form("clear");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Password successfully reset"
                });
            }
        })
    }
})

// RESETING SECRETARY PASSWORD
$("#sec-save-password").click(async () => {
    var done = true;

    // ERROR CHECKING
    if($("#sec-current-password").val() == "") {
        $("#sec-current-password-field").addClass("error");
        if(!showToast) {
            showToast = true;
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Please input your current password",
                onHidden: () => {
                    showToast = false;
                }
            });
            done = false;
        }
    } else {
        await $.ajax({
            type: "post",
            url: "admin/checkCurrentSecretaryPassword",
            data: {
                newPassword: $("#sec-current-password").val().trim()
            },
            success: (value) => {
                if(!value) {
                    $("#sec-current-password-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Incorrect current password"
                    });   
                    done = false;
                }
            }
        })
    }
    if(!$("#sec-new-password").val().match(checkPassword) || !validateSpecialChar($("#sec-new-password").val().trim())) {
        $("#sec-new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Incorrect password format"
        })
        done = false;
    }
    if($("#sec-new-password").val().length < 10) {
        $("#sec-new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too short"
        })
        done = false;
    }
    if($("#sec-new-password").val().length > 32) {
        $("#sec-new-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too long"
        })
        done = false;
    }
    if($("#sec-new-password").val() == "" || $("#sec-confirm-new-password").val() == "") {
        if($("#sec-new-password").val() == "") {
            $("#sec-new-password-field").addClass("error");
        }
        if($("#sec-confirm-new-password").val() == "") {
            $("#sec-confirm-new-password-field").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input your new password"
        });
        done = false;
    } else {
        if($("#sec-new-password").val() != $("#sec-confirm-new-password").val()) {
            $("#sec-new-password-field").addClass("error");
            $("#sec-confirm-new-password-field").addClass("error");
            $("#sec-new-password").val("");
            $("#sec-confirm-new-password").val("");
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
            url: "admin/updateAccountPassword",
            data: {
                username: "secretary",
                newPassword: $("#sec-new-password").val()
            },
            success: (value) => {
                $("#reset-secretary-modal").modal("hide");
                $("#reset-secretary-modal").form("clear");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Password successfully reset"
                });
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
    } else {
        var checkfirst = /^[a-z A-Z]+$/;
        if($("#add-firstname-dentist").val().length < 2) {
            $("#firstname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Name is too short"
            })
            nameChecker = false;
        } else if(!$("#add-firstname-dentist").val().match(checkfirst)) {
            $("#firstname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Invalid name format"
            })
            nameChecker = false;
        } else {
            nameChecker = true;
        }

        var checklast = /^[a-z A-Z.\-_]+$/;
        if($("#add-lastname-dentist").val().length < 2) {
            $("#lastname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Name is too short"
            })
            nameChecker = false;
        } else if(!$("#add-lastname-dentist").val().match(checklast)) {
            $("#lastname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Invalid name format"
            })
            nameChecker = false;
        } else {
            nameChecker = true;
        }
    }
    if(!$("#add-password-dentist").val().match(checkPassword) || !validateSpecialChar($("#add-password-dentist").val().trim())) {
        $("#password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Incorrect password format"
        })
        done = false;
    }
    if($("#add-password-dentist").val().length < 10) {
        $("#password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too short"
        })
        done = false;
    }
    if($("#add-password-dentist").val().length > 32) {
        $("#password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too long"
        })
        done = false;
    }
    if($("#add-username-dentist").val().trim() == "") {
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

    if(done && nameChecker) {
        $("#list-dimmer").addClass("active");
        $.ajax({
            type: "post",
            url: "admin/addDentist",
            data: {
                firstname: $("#add-firstname-dentist").val().trim(), 
                lastname: $("#add-lastname-dentist").val().trim(), 
                username: $("#add-username-dentist").val().trim(),
                password: $("#add-password-dentist").val(),
                type: "dentist",
                status: "Active"
            },
            success: (value) => {
                if(value.message) {
                    $("#add-dentist-modal").modal("hide");
                    $('#add-dentist-modal').form("clear");
                    if(currTab == "Dentist") {
                        $.get("admin/adminDentist", (data) => {
                            $("#table").DataTable().destroy();
                            updateTable(data);
                        });
                    } else if(currTab == "Users") {
                        $.get("admin/adminUsers", (data) => {
                            $("#table").DataTable().destroy();
                            updateTable(data);
                        });
                    }
                    $('body').toast({
                        class: "success",
                        position: "top center",
                        message: "New dentist successfully added"
                    });
                    $("#adding-schedule-modal").data("id", value.doctor._id);
                    $("#adding-schedule-modal").data("firstname", value.doctor.firstname);
                    $("#adding-schedule-modal").data("lastname", value.doctor.lastname);
                    $("#doctor-name").text("Dr. " + value.doctor.firstname + " " + value.doctor.lastname);
                    $("#daily")[0]["checked"] = true;
                    $("#start").val("8:00");
                    $("#end").val("18:00");
                    $("#repeat-field").addClass("disabled");
                    $("#repeat").attr("disabled", "disabled");
                    modalReset = false;
                    $("#adding-schedule-modal").modal("show");
                } else {
                    $("#username-field-dentist").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username already taken"
                    });
                }
                $("#list-dimmer").removeClass("active");
            }
        })
    }
})

// ADDING PROCEDURE
$("#create-procedure-button").click(() => {
    var done = true;
    var check = /^[a-z A-Z]+$/;
    // ERROR CHECKING
    if($("#procedure-name").val().trim() == "" || !$("#procedure-name").val().trim().match(check)) {
        $("#procedure-field").addClass("error");
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid procedure name"
        });
        done = false;
    }else{
        var valid = new RegExp("^[a-zA-Z ]*$").test($("#procedure-name").val().trim())
        if(!valid){
            $("#procedure-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "No special characters or numbers allowed"
            });
            done = false;
        }
    }

    if(done) {
        $("#list-dimmer").addClass("active");
        $.ajax({
            type: "post",
            url: "admin/addProcess",
            data: {
                name: $("#procedure-name").val().trim()
            },
            success: (value) => {
                if(value.message) {
                    $("#procedure-modal").modal("hide");
                    $('#procedure-modal').form("clear");
                    if(currTab == "Procedure") {
                        $.get("admin/adminProcedure", (data) => {
                            $("#table").DataTable().destroy();
                            updateTable(data); 
                        });
                    }
                    $('body').toast({
                        class: "success",
                        position: "top center",
                        message: "New procedure successfully added"
                    });
                } else {
                    $("#procedure-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Procedure already exists"
                    });
                }
                $("#list-dimmer").removeClass("active");
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
    } else {
        var checkfirst = /^[a-zA-Z]+$/;
        if($("#edit-firstname-dentist").val().length < 2) {
            $("#edit-firstname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Name is too short"
            })
            nameChecker = false;
        } else if(!$("#edit-firstname-dentist").val().match(checkfirst)) {
            $("#edit-firstname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Invalid name format"
            })
            nameChecker = false;
        } else {
            nameChecker = true;
        }
        var checklast = /^[a-zA-Z.\-_]+$/;
        if($("#edit-lastname-dentist").val().length < 2) {
            $("#edit-lastname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Name is too short"
            })
            nameChecker = false;
        } else if(!$("#edit-lastname-dentist").val().match(checklast)) {
            $("#edit-lastname-dentist-field").addClass("error");
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Invalid name format"
            })
            nameChecker = false;
        } else {
            nameChecker = true;
        }
    }
    if(!$("#edit-password-dentist").val().match(checkPassword) || !validateSpecialChar($("#edit-password-dentist").val().trim())) {
        $("#edit-password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Incorrect password format"
        })
        done = false;
    }
    if($("#edit-password-dentist").val().length < 10) {
        $("#edit-password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too short"
        })
        done = false;
    } 
    if($("#edit-password-dentist").val().length > 32) {
        $("#edit-password-field-dentist").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too long"
        })
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

    if(done && nameChecker) {
        $.ajax({
            type: "post",
            url: "admin/editDentist",
            data: {
                doctorID,
                firstname: $("#edit-firstname-dentist").val(),
                lastname: $("#edit-lastname-dentist").val(),
                password: $("#edit-password-dentist").val(),
            },
            success: (value) => {
                $.get("admin/adminDentist", (data) => {
                    $("#table").DataTable().destroy();
                    updateTable(data);
                    $("#edit-dentist-modal").modal("hide");
                    $("#edit-dentist-modal").form("clear");
                    $('body').toast({
                        class: "success",
                        position: "top center",
                        message: "Dentist detail successfully edited"
                    })  
                });
            }
        })
    }
})

// EDITING PROCEDURE
$("#edit-procedure-button").click(() => {
    var done = true;
    var check = /^[a-z A-Z]+$/;

    // ERROR CHECKING
    if($("#edit-procedure-name").val().trim() == "" || $("#procedure-name").val().trim().match(check)) {
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
            url: "admin/editProcess",
            data: {
                procedureID,
                name: $("#edit-procedure-name").val().trim()
            },
            success: (value) => {
                if(value.message) {
                    $.get("admin/adminProcedure", (data) => {
                        $("#table").DataTable().destroy();
                        updateTable(data);
                        $("#edit-procedure-modal").modal("hide");
                        $("#edit-procedure-modal").form("clear");
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
        url: "admin/deleteAccount",
        data: {
            doctorID
        },
        success: (value) => {
            $.get("admin/adminDentist", (data) => {
                $("#table").DataTable().destroy();
                updateTable(data);
                $("#delete-user-modal").modal("hide");
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
        url: "admin/deleteProcess",
        data: {
            processID: procedureID
        },
        success: (value) => {
            $("#delete-procedure-modal").modal("hide");
            $.get("admin/adminProcedure", (data) => {
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

// ADDING UNAVAILABLE DATE
$("#add-unavailable-button").click(() => {
    var start = $("#start-date-input").val();
    var end = $("#end-date-input").val();
    var done = true;
    
    // ERROR CHECKING
    if(start == "" || end == "")  {
        if(start == "") {
            $("#start-date").addClass("error");
        }
        if(end == "") {
            $("#end-date").addClass("error");
        }
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please input a valid date"
        })
        done = false;
    } else {
        $.ajax({
            type: "post",
            url: "admin/doctorHasAppointment",
            data: {
                doctorID: $("#add-unavailable-modal").data("id"),
                startDate: start,
                endDate: end
            }, 
            success: (value) => {
                if(value) {
                    $("#start-date").addClass("error");
                    $("#end-date").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "The chosen date has appointment/s"
                    })
                    done = false;
                }
            }
        })
    }

    if(done) {
        $.ajax({
            type: "post",
            url: "admin/addUnavailableDates",
            data: {
                doctorID: $("#add-unavailable-modal").data("id"),
                startdate: start,
                enddate: end
            },
            success: (value) => {
                $("body").toast({
                    class: "success",
                    position: "top center",
                    message: "Dentist unavailable date successfully added"
                })
                $("#add-unavailable-modal").modal("hide");
            }
        })
    }
})

// DELETING UNAVAILABLE DATES
$("#remove-unavailable-button").click(() => {
    $.ajax({
        type: "post",
        url: "admin/deleteUnavailableDates",
        data: {
            unavailableDateID: $("#confirmation-modal").data("id")
        },
        success: (value) => {
            if(value) {
                $("#confirmation-modal").modal("hide");
                $('body').toast({
                    class: "success",
                    position: "top center",
                    message: "Unavailable date successfully deleted"
                })
            }
        }
    })
})

// ADDING DENTIST SCHEDULE
$("#add-schedule-button").click(() => {
    
    // ERROR CHECKING
    var done = true;
    if(!$("#daily")[0].checked && !$("#repeat")[0].checked) {
        $("#daily-field").addClass("error");
        $("#report-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please choose an occurence"
        });
        done = false;
    } 
    if($("#start").val() == "" || $("#end").val() == "") {
        if($("#start").val() == "") {
            $("#start-field").addClass("error");
        }
        if($("#end").val() == "") {
            $("#end-field").addClass("error");
        }
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please input a valid time"
        })
        done = false;
    } else {
        var start = moment($("#start").val(), "HH:mm");
        var end = moment($("#end").val(), "HH:mm");
        var sn_start = moment($("#start-add").val(), "HH:mm");
        var sn_end = moment($("#end-add").val(), "HH:mm");

        if($("#custom")[0].checked) {
            if($("#start").val() == $("#end").val() || $("#start-add").val() == $("#end-add").val()) {
                if($("#start").val() == $("#end").val()) {
                    $("#start-field").addClass("error");
                    $("#end-field").addClass("error");
                }
                if($("#start-add").val() == $("#end-add").val()) {
                    $("#start-add-field").addClass("error");
                    $("#end-add-field").addClass("error");
                }
                $('body').toast({
                    class: "error",
                    position: "top center",
                    message: "Time interval is too short"
                })
                done = false;
            } else {
                
                if(!(start.isBefore(end) && sn_start.isBefore(sn_end) && end.isBefore(sn_start))) {
                    $("#start-field").addClass("error");
                    $("#end-field").addClass("error");
                    $("#start-add-field").addClass("error");
                    $("#end-add-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid time interval"
                    })  
                    done = false;
                }
            }
        } else {
            if($("#start").val() == $("#end").val()) {
                if($("#start").val() == $("#end").val()) {
                    $("#start-field").addClass("error");
                    $("#end-field").addClass("error");
                }
                $('body').toast({
                    class: "error",
                    position: "top center",
                    message: "Time interval is too short"
                })
                done = false;
            } else {
                if(!(start.isBefore(end))) {
                    $("#start-field").addClass("error");
                    $("#end-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid time interval"
                    })  
                    done = false;
                }
            }
        }
    }
    if($("#custom")[0].checked && ($("#start-add").val() == "" || $("#end-add").val() == "") && done) {
        if($("#start-add").val() == "") {
            $("#start-add-field").addClass("error");
        }
        if($("#end-add").val() == "") {
            $("#end-add-field").addClass("error");   
        }
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please input a valid time"
        })
        done = false;
    }
    if($("#repeat")[0].checked && (days.length == 0 || days == [undefined] || days == "")) {
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please choose a specific day of reoccurence"
        })
        done = false;
    }

    if(done) {
        // checking if a doctor has a schedule or not
        $.ajax({
            type: "post",
            url: "admin/getDoctorSchedule",
            data: {
                doctorID: $("#adding-schedule-modal").data("id")
            },
            success: (value) => {
                editSchedule = value.docSched;
                editBreaktime = value.breakTime;
                addSchedule();
            }
        })
    }
})

// Save changes in schedule
$("#save-changes-schedule").click(() => {
    // ERROR CHECKING
    var done = true;

    if($("#edit-custom")[0].checked && ($("#edit-start-add").val() == "" || $("#edit-end-add").val() == "") && ($("#start-add").val() == "" || $("#end-add").val() == "")) {
        if($("#start-add").val() == "") {
            $("#start-add-field").addClass("error");
        }
        if($("#end-add").val() == "") {
            $("#end-add-field").addClass("error");   
        }
        if($("#edit-start-add").val() == "") {
            $("#edit-start-add-field").addClass("error");
        }
        if($("#edit-end-add").val() == "") {
            $("#edit-end-add-field").addClass("error");   
        }
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Please input a valid time"
        })
        done = false;
    } else {
        var start = moment($("#edit-start").val(), "HH:mm");
        var end = moment($("#edit-end").val(), "HH:mm");
        var sn_start = moment($("#edit-start-add").val(), "HH:mm");
        var sn_end = moment($("#edit-end-add").val(), "HH:mm");

        if($("#edit-custom")[0].checked) {
            if($("#edit-start").val() == $("#edit-end").val() || $("#edit-start-add").val() == $("#edit-end-add").val()) {
                if($("#edit-start").val() == $("#edit-end").val()) {
                    $("#edit-start-field").addClass("error");
                    $("#edit-end-field").addClass("error");
                }
                if($("#editstart-add").val() == $("#edit-end-add").val()) {
                    $("#edit-start-add-field").addClass("error");
                    $("#edit-end-add-field").addClass("error");
                }
                $('body').toast({
                    class: "error",
                    position: "top center",
                    message: "Time interval is too short"
                })
                done = false;
            } else {
                if(!(start.isBefore(end) && sn_start.isBefore(sn_end) && end.isBefore(sn_start))) {
                    $("#edit-start-field").addClass("error");
                    $("#edit-end-field").addClass("error");
                    $("#edit-start-add-field").addClass("error");
                    $("#edit-end-add-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid time interval"
                    })  
                    done = false;
                }
            }
        } else {
            if($("#edit-start").val() == $("#edit-end").val()) {
                if($("#edit-start").val() == $("#edit-end").val()) {
                    $("#edit-start-field").addClass("error");
                    $("#edit-end-field").addClass("error");
                }
                $('body').toast({
                    class: "error",
                    position: "top center",
                    message: "Time interval is too short"
                })
                done = false;
            } else {
                if(!(start.isBefore(end))) {
                    $("#edit-start-field").addClass("error");
                    $("#edit-end-field").addClass("error");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid time interval"
                    })  
                    done = false;
                }
            }
        }
    }

    if(done) {
        updateSchedule();
    }
})

// DELETING DENTIST SCHEDULE
$("#remove-schedule-button").click(() => {
    editSchedule[editDay.toLowerCase()] = []
    editBreaktime[editDay.toLowerCase()] = []
    defaultTime = false;

    $.ajax({
        type: "post",
        url: 'admin/editSchedule',
        data: {
            'monday[]': editSchedule["monday"],
            'tuesday[]': editSchedule["tuesday"],
            'wednesday[]': editSchedule["wednesday"],
            'thursday[]': editSchedule["thursday"],
            'friday[]': editSchedule["friday"],
            'saturday[]': editSchedule["saturday"],
            'mondaydifference[]': editBreaktime["monday"],
            'tuesdaydifference[]': editBreaktime["tuesday"],
            'wednesdaydifference[]': editBreaktime["wednesday"],
            'thursdaydifference[]': editBreaktime["thursday"],
            'fridaydifference[]': editBreaktime["friday"],
            'saturdaydifference[]': editBreaktime["saturday"],
            doctorID: $("#editing-schedule-modal").data("id"),
            defaultTime
        },
        success: (value) => {
            if(value) {
                $("body").toast({
                    class: "success",
                    position: "top center",
                    message: "Dentist schedule successfully removed"
                })
                $("#remove-schedule-modal").modal("hide");
            } 
        }
    })
})

// Adding schedule 
function addSchedule() {
    let mon = [], tue = [], wed = [], thu = [], fri = [], sat = [];
    let monbreak = [], tuebreak = [], wedbreak = [], thubreak = [], fribreak = [], satbreak = [];
    let defaultTime = false;
    
    if($("#daily")[0].checked) {
        if($("#custom")[0].checked) {
            mon.push($("#start").val());    mon.push($("#end-add").val());
            tue.push($("#start").val());    tue.push($("#end-add").val());
            wed.push($("#start").val());    wed.push($("#end-add").val());
            thu.push($("#start").val());    thu.push($("#end-add").val());
            fri.push($("#start").val());    fri.push($("#end-add").val());
            sat.push($("#start").val());    sat.push($("#end-add").val());
            monbreak.push($("#end").val());    monbreak.push($("#start-add").val());
            tuebreak.push($("#end").val());    tuebreak.push($("#start-add").val());
            wedbreak.push($("#end").val());    wedbreak.push($("#start-add").val());
            thubreak.push($("#end").val());    thubreak.push($("#start-add").val());
            fribreak.push($("#end").val());    fribreak.push($("#start-add").val());
            satbreak.push($("#end").val());    satbreak.push($("#start-add").val());
        } else {
            mon.push($("#start").val());    mon.push($("#end").val());
            tue.push($("#start").val());    tue.push($("#end").val());
            wed.push($("#start").val());    wed.push($("#end").val());
            thu.push($("#start").val());    thu.push($("#end").val());
            fri.push($("#start").val());    fri.push($("#end").val());
            sat.push($("#start").val());    sat.push($("#end").val());
        }
    } else if($("#repeat")[0].checked) {
        for(var i = 0; i < days.length; i++) {
            if(days[i] == "mon") {
                if($("#custom")[0].checked) {
                    mon.push($("#start").val());    mon.push($("#end-add").val());
                    monbreak.push($("#end").val());    monbreak.push($("#start-add").val());
                } else {
                    mon.push($("#start").val());    mon.push($("#end").val());
                }
            } else if(days[i] == "tue") {
                if($("#custom")[0].checked) {
                    tue.push($("#start").val());    tue.push($("#end-add").val());
                    tuebreak.push($("#end").val());    tuebreak.push($("#start-add").val());
                } else {
                    tue.push($("#start").val());    tue.push($("#end").val());
                }
            } else if(days[i] == "wed") {
                if($("#custom")[0].checked) {
                    wed.push($("#start").val());    wed.push($("#end-add").val());
                    wedbreak.push($("#end").val());    wedbreak.push($("#start-add").val());
                } else {
                    wed.push($("#start").val());    wed.push($("#end").val());
                }
            } else if(days[i] == "thu") {
                if($("#custom")[0].checked) {
                    thu.push($("#start").val());    thu.push($("#end-add").val());
                    thubreak.push($("#end").val());    thubreak.push($("#start-add").val());
                } else {
                    thu.push($("#start").val());    thu.push($("#end").val());
                }
            } else if(days[i] == "fri") {
                if($("#custom")[0].checked) {
                    fri.push($("#start").val());    fri.push($("#end-add").val());
                    fribreak.push($("#end").val());    fribreak.push($("#start-add").val());
                } else {
                    fri.push($("#start").val());    fri.push($("#end").val());
                }
            } else if(days[i] == "sat") {
                if($("#custom")[0].checked) {
                    sat.push($("#start").val());    sat.push($("#end-add").val());
                    satbreak.push($("#end").val());    satbreak.push($("#start-add").val());
                } else {
                    sat.push($("#start").val());    sat.push($("#end").val());
                }
            }
        }
    }
    $.ajax({
        type: "post",
        url: 'admin/addSchedule',
        data: {
            'monday[]': mon,
            'tuesday[]': tue,
            'wednesday[]': wed,
            'thursday[]': thu,
            'friday[]': fri,
            'saturday[]': sat,
            'mondaydifference[]': monbreak,
            'tuesdaydifference[]': tuebreak,
            'wednesdaydifference[]': wedbreak,
            'thursdaydifference[]': thubreak,
            'fridaydifference[]': fribreak,
            'saturdaydifference[]': satbreak,
            doctorID: $("#adding-schedule-modal").data("id"),
            defaultTime
        },
        success: (value) => {
            if(value) {
                $("body").toast({
                    class: "success",
                    position: "top center",
                    message: "Dentist schedule successfully added"
                })
                $("#adding-schedule-modal").modal("hide");
            } 
        }
    })
}

// Updating schedule function
function updateSchedule() {
    let defaultTime = false;

    if($("#edit-start").val() == "" && $("#edit-end").val() == "") {
        editSchedule[editDay.toLowerCase()] = [];
        editBreaktime[editDay.toLowerCase()] = [];
    } else {
        if($("#edit-start").val() != "") {
            editSchedule[editDay.toLowerCase()][0] = $("#edit-start").val();
        }
        if($("#edit-end").val() != "") {
            editSchedule[editDay.toLowerCase()][1] = $("#edit-end").val();
        }
        editBreaktime[editDay.toLowerCase()] = [];
    }
    if($("#edit-custom")[0].checked) {
        if($("#edit-start").val() != "") {
            editSchedule[editDay.toLowerCase()][0] = $("#edit-start").val();
        }
        if($("#edit-end").val() != "") {
            editBreaktime[editDay.toLowerCase()][0] = $("#edit-end").val();
        }
        if($("#edit-start-add").val() != "") {
            editBreaktime[editDay.toLowerCase()][1] = $("#edit-start-add").val();
        }
        if($("#edit-end-add").val() != "") {
            editSchedule[editDay.toLowerCase()][1] = $("#edit-end-add").val();
        }
    } else {
        editBreaktime[editDay.toLowerCase()] = []
    }
    $.ajax({
        type: "post",
        url: 'admin/editSchedule',
        data: {
            'monday[]': editSchedule["monday"],
            'tuesday[]': editSchedule["tuesday"],
            'wednesday[]': editSchedule["wednesday"],
            'thursday[]': editSchedule["thursday"],
            'friday[]': editSchedule["friday"],
            'saturday[]': editSchedule["saturday"],
            'mondaydifference[]': editBreaktime["monday"],
            'tuesdaydifference[]': editBreaktime["tuesday"],
            'wednesdaydifference[]': editBreaktime["wednesday"],
            'thursdaydifference[]': editBreaktime["thursday"],
            'fridaydifference[]': editBreaktime["friday"],
            'saturdaydifference[]': editBreaktime["saturday"],
            doctorID: $("#editing-schedule-modal").data("id"),
            defaultTime
        },
        success: (value) => {
            if(value) {
                $("body").toast({
                    class: "success",
                    position: "top center",
                    message: "Dentist schedule successfully edited"
                })
                $("#editing-schedule-modal").modal("hide");
            } 
        }
    })    
}

// MODALS
$("#add").click(() => {
    $("#create-modal").modal("show");
})

$("#add-schedule").click(() => {
    if($("#weekly")[0].className.includes("green")) {
        $("#schedule-modal").modal("deny");
        $("#doctor-name").text("Dr. " + $("#schedule-modal").data("firstname") + " " + $("#schedule-modal").data("lastname"));
        $("#adding-schedule-modal").data("id", $("#schedule-modal").data("id"));
        $("#adding-schedule-modal").data("firstname", $("#schedule-modal").data("firstname"));
        $("#adding-schedule-modal").data("lastname", $("#schedule-modal").data("lastname"));
        modalReset = true;
        $("#adding-schedule-modal").modal("show");
    } else if($("#unavailable")[0].className.includes("green")) {
        $("#schedule-modal").modal("deny");
        $.ajax({
            type: "post",
            url: "admin/unavailableTaken",
            data: {
                doctorID: $("#schedule-modal").data("id")
            }, success: (value) => {
                var today = new Date();
                $("#start-date").calendar('set date', moment().toDate(), true, false);
                $("#end-date").calendar('set date', moment().toDate(), true, false);
                $(".add-unavailable").calendar({
                    type: "date",
                    minDate: today,
                    today: true,
                    disabledDates: value
                });
                unavailableDates = value;
                $("#add-unavailable-modal").data("id", $("#schedule-modal").data("id"));
                $("#add-unavailable-modal").data("firstname", $("#schedule-modal").data("firstname"));
                $("#add-unavailable-modal").data("lastname", $("#schedule-modal").data("lastname"));
                $("#add-unavailable-modal").modal("show");
            }
        })
    }
})

$("#delete-schedule").click(() => {
    deleteSchedule = true;
    $("#modal-text-delete-day").text(editDay);
    if(breaktime != "" && breaktime != undefined) {
        $("#modal-text-delete-normal").text(normal[0] + " - " + breaktime[0]);
        $("#modal-text-delete-break").text(breaktime[1] + " - " + normal[1]);
    } else {
        $("#modal-text-delete-normal").text(normal[0] + " - " + normal[1]);
        $("#modal-text-delete-break").text("");
    }
    $("#remove-schedule-modal").modal("show");
})

$("#add-dentist-button").click(() => {  
    $("#add-dentist-modal").modal('show');
    $("#procedure-modal").form('clear');
})

$("#add-procedure-button").click(() => {
    $("#procedure-modal").modal('show');
    $("#add-dentist-modal").form('clear');
})

$("#add-dentist-modal").modal({
    onShow: function() {
        $("#add-password-dentist").val("");
        $("#confirm-password-dentist").val("");
        passwordChecker = true;
        nameChecker = true;
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

$("#reset-password-modal").modal({
    onShow: function() {
        passwordChecker = true;   
    }
})

$("#adding-schedule-modal").modal({
    onShow: () => {
        accor_show = false;
        days = [];
        var minDate = new Date();
        var maxDate = new Date();
        minDate.setHours(8);
        minDate.setMinutes(0);
        maxDate.setHours(18);
        maxDate.setMinutes(0);
        $(".add-schedule").calendar({
            type: "time",
            minTimeGap: 30,
            ampm: false,
            minDate,
            maxDate    
        })
        if(modalReset) {
            $("input[type='text']").val("");
            $(".ui .checkbox").checkbox('uncheck');
            $("#mon").removeClass("active");
            $("#tue").removeClass("active");
            $("#wed").removeClass("active");
            $("#thu").removeClass("active");
            $("#fri").removeClass("active");
            $("#sat").removeClass("active");
            $(".accordion .content").css({
                display: 'none'
            })
        }
    },
    onHidden: () => {
        $("#mon").removeClass("active");
        $("#tue").removeClass("active");
        $("#wed").removeClass("active");
        $("#thu").removeClass("active");
        $("#fri").removeClass("active");
        $("#sat").removeClass("active");
        $(".ui .checkbox").checkbox('uncheck');
        $(".accordion .content").css({
            display: 'none'
        })
        accor_show = false;
        $("#schedule-modal").data("id", $("#adding-schedule-modal").data("id"));
        $("#schedule-modal").data("firstname", $("#adding-schedule-modal").data("firstname"));
        $("#schedule-modal").data("lastname", $("#adding-schedule-modal").data("lastname"));
        $("#doctor-name-schedule").text("Dr. " + $("#schedule-modal").data("firstname") + " " + $("#schedule-modal").data("lastname"));
        setDataTable("weekly");
    }
})

$("#editing-schedule-modal").modal({
    onShow: () => {
        deleteSchedule = false;
        var minDate = new Date();
        var maxDate = new Date();
        minDate.setHours(8);
        minDate.setMinutes(0);
        maxDate.setHours(18);
        maxDate.setMinutes(0);
        $(".edit-schedule").calendar({
            type: "time",
            minTimeGap: 30,
            ampm: false,
            minDate,
            maxDate
        })
    },
    onHidden: () => {
        $(".ui .checkbox").checkbox('uncheck');
        $(".accordion .content").css({
            display: 'none'
        })
        $('input[type="text"]').val("");
        accor_show = false;
        if(!deleteSchedule) {
            setDataTable("weekly");
        }
    }
})

$("#remove-schedule-modal").modal({
    closable: false,
    onDeny: () => {
        setDataTable("weekly");
    },
    onHidden: () => {
        setDataTable("weekly");
    }
})

$("#delete-user-modal").modal({
    closable: false
})

$("#reset-password-modal").modal({
    onHidden: () => {
        $(".form").form("clear");
    }
})

$("#reset-secretary-modal").modal({
    onHidden: () => {
        $(".form").form("clear");
    }
})

$("#add-unavailable-modal").modal({
    onShow: () => {
        $('input[type="text"]').val("");
    },
    onHidden: () => {
        setDataTable("");
    }
})

$("#confirmation-modal").modal({
    onHidden: () => {
        setDataTable("");
    }
})

$("#delete-old").click(() => {
    $.ajax({
        type: "post",
        url: "secretary/deleteXYearsApp",
        success: (value) => {
            $("#old-modal").modal("hide");
            $('body').toast({
                class: "success",
                position: "top center",
                message: "Old appointments successfully deleted"
            })
        }
    })
})

// Initialization
function setup() {
    // load the list of dentist
    $.get("admin/adminDentist", (data) => {
        updateTable(data);
    });

    accor_show = false;
    modalReset = false;
    showToast = false;
    currTab = "Dentist";
    $(".ui .item:contains('Dentist')").addClass("active");
    $(".ui .item:contains('Dentist')").css({'background-color':'#ebebeb'});
    $.ajax({
        type: "get",
        url: "admin/exportData",
        success: (value) => {
            $("#downloadFile").attr("href","data:text/csv;charset=utf-8," + encodeURI(value));
            $("#downloadFile").attr("download","Appointment.csv");
        }
    })
}

function resizePage() {
    if(currTab == "Dentist") {
        $.get("admin/adminDentist", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
        });
    } else if(currTab == "Procedure") {
        $.get("admin/adminProcedure", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
        });
    }
}

// SWITCH TAB
function switchPage() {
    let page = $(this).text().trim();
    if(page == "Dentist") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#ebebeb'});
        $("#list-dimmer").addClass("active");
        currTab = "Dentist";
        $.get("admin/adminDentist", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
            $("#list-dimmer").removeClass("active");
        });
    } else if(page == "Procedure") {
        $(".ui .item").css({'background-color':''});
        $(".ui .item").removeClass("active");
        $(this).addClass("active");
        $(this).css({'background-color':'#ebebeb'});
        $("#list-dimmer").addClass("active");
        currTab = "Procedure";
        $.get("admin/adminProcedure", (data) => {
            $("#table").DataTable().destroy();
            updateTable(data);
            $("#list-dimmer").removeClass("active");
        });
    } else if(page == "Export Data") {
        exportData();
    } else if(page == "Reset Admin") {
        $("#reset-password-modal").modal("show");
    } else if(page == "Reset Secretary") {
        $("#reset-secretary-modal").modal("show");
    } else if(page == "Free-up Memory") {
        $("#old-modal").modal("show");
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

// Set data to table in modal
function setDataTable(string) {
    if(string == "weekly") {
        $("#weekly").click();
    } else {
        $("#unavailable").click();
    }
}

// Setting default button on modal when ENTER key is pressed
$(document).keypress((event) => {
    if(event.keyCode == 13) {
        if($("#reset-password-modal")[0].className.includes("active")) {
            $("#save-password").click();
        } else if($("#add-dentist-modal")[0].className.includes("active")) {
            $("#create-dentist-button").click();
        } else if($("#procedure-modal")[0].className.includes("active")) {
            $("#create-procedure-button").click();
        } else if($("#edit-dentist-modal")[0].className.includes("active")) {
            $("#edit-dentist-button").click();
        } else if($("#edit-procedure-modal")[0].className.includes("active")) {
            $("#edit-procedure-button").click();
        } else if($("#adding-schedule-modal")[0].className.includes("active")) {
            $("#add-schedule-button").click();
        } else if($("#reset-secretary-modal")[0].className.includes("active")) {
            $("#sec-save-password").click();
        }
    }
})

$(document).on("keyup", () => {
    inputChecker = true;
})

// RESETTING ERRORS
$(document).on("keydown", () => {
    $("#firstname-field-dentist").removeClass("error");
    $("#lastname-field-dentist").removeClass("error");
    $("#username-field-dentist").removeClass("error");
    $("#password-field-dentist").removeClass("error");
    $("#confirm-password-field-dentist").removeClass("error");
    $("#procedure-field").removeClass("error");
    $("#current-password-field").removeClass("error");
    $("#new-password-field").removeClass("error");
    $("#confirm-new-password-field").removeClass("error");
    $("#edit-firstname-field-dentist").removeClass("error");
    $("#edit-lastname-field-dentist").removeClass("error");
    $("#edit-password-field-dentist").removeClass("error");
    $("#edit-confirm-password-field-dentist").removeClass("error");
    $("#edit-procedure-field").removeClass("error");
    $("#start-field").removeClass("error");
    $("#end-field").removeClass("error");
    $("#start-add-field").removeClass("error");
    $("#end-add-field").removeClass("error");
    $("#start-date").removeClass("error");
    $("#end-date").removeClass("error");
    $("#sec-new-password-field").removeClass("error");
    $("#sec-confirm-new-password-field").removeClass("error");
    $("#sec-current-password-field").removeClass("error");
})

// Validate special characters
function validateSpecialChar(password) {
    var temp = invalidChar.filter((value) => {
        return password.includes(value);
    })
    if(temp == "") {
        return true;
    }
    return false;
}

// Export data
function exportData() {
    $.ajax({
        type: "get",
        url: "admin/exportData",
        success: (value) => {
            $("#downloadFile").attr("href","data:text/csv;charset=utf-8," + encodeURI(value));
            $("#downloadFile").attr("download","Appointment.csv");
            $("#downloadFile").click();
        }
    })
}

// LOGOUT
$("#logout").click(() => {
    window.location.href="/logout";
})

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
