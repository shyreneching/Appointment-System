var passwordChecker, inputChecker;
var invalidChar = [".","}","{","&","\"",":","]","[","?",";"];
var checkPassword = /^[0-9a-zA-Z]+$/;

$(document).ready(() => {
    // validate username
    $("#reset-username").focusout(() => {
        if(inputChecker) {
            $.ajax({
                type: "post",
                url: "/admin/validateUsername",
                data:  {
                    username: $("#reset-username").val().trim()
                },
                success: (value) => {
                    if(!value.message) {
                        $("#reset-username-field").addClass("error");
                        $('body').toast({
                            class: "error",
                            position: "top center",
                            message: "Username does not exist"
                        });
                    }
                }
            })
        }
    })

    $("input[type='text']").focusin(() => {
        inputChecker = false;
    })

    $("#submit").click(() => { 
        $.ajax({
            type: "post",
            url: "/validateLogin",
            data: {
                username: $("#username").val().trim(),
                password: $("#password").val(),
                date: getDate()
            },
            success: function(value) {
                if(value.message == 0) {
                    $("#username-input").addClass("error");
                    $("#password").val("");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid username"
                    });
                } else if(value.message == 2) {
                    $("#username-input").addClass("error");
                    $("#password-input").addClass("error");
                    $("#password").val("");
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Invalid password"
                    });
                } else if(value.message == 1) {
                    window.location.href="/login"
                }
            }
        })
    })
})

$(document).on("keydown", () => {
    $("#username-input").removeClass("error");
    $("#password-input").removeClass("error");
})

$(document).on("keypress", (event) => {
    if(event.keyCode == 13) {
        if($("#forgot-modal")[0].className.includes("active")) {
            $("#reset-button").click();
        } else {
            $("#submit").click();
        }
    }
    $("#reset-username-field").removeClass("error");
    $("#reset-password-field").removeClass("error");
    $("#reset-confirm-password-field").removeClass("error");
})

$(document).on("keyup", () => {
    inputChecker = true;
})

$("#forgot").click(() => {
    $("#forgot-modal").modal("show");
})

$("#forgot-modal").modal({
    onShow: function() {
        $('#forgot-modal').form("clear");
        passwordChecker = true;
    }
})

$("#reset-button").click(() => {
    var done = true;
    if($("#reset-username").val().trim() == "" || $("#reset-username").val().trim() == "admin") {
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid username"
        });
        $("#reset-username-field").addClass("error");
        if($("#reset-username").val().trim() == "admin") {
            $("#reset-username").val("");
        }
        done = false;
    }
    if(!$("#reset-password").val().match(checkPassword) || !validateSpecialChar($("#reset-password").val())) {
        $("#reset-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Incorrect password format"
        })
        done = false;
    } else if($("#reset-password").val().length < 10) {
        $("#reset-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too short"
        })
        done = false;
    } else if($("#reset-password").val().length > 32) {
        $("#reset-password-field").addClass("error");
        $("body").toast({
            class: "error",
            position: "top center",
            message: "Password is too long"
        })
        done = false;
    }
    if($("#reset-password").val() == "" || $("#reset-confirm-password").val() == "") {
        if($("#reset-password").val() == "") {
            $("#reset-password-field").addClass("error");
        }
        if($("#reset-confirm-password").val() == "") {
            $("#reset-confirm-password-field").addClass("error");
        }
        $('body').toast({
            class: "error",
            position: "top center",
            message: "Please input a valid password"
        });
        $("#reset-password").val("");
        $("#reset-confirm-password").val("");
        done = false;
    } else {
        if($("#reset-password").val() != $("#reset-confirm-password").val()) {
            $('body').toast({
                class: "error",
                position: "top center",
                message: "Password do not match"
            }); 
            $("#reset-password-field").addClass("error");
            $("#reset-confirm-password-field").addClass("error");
            $("#reset-password").val("");
            $("#reset-confirm-password").val("");
            done = false;
        }
    }

    if(done && passwordChecker) {
        $.ajax({
            type: "post",
            url: "/admin/updateAccountPassword",
            data: {
                username: $("#reset-username").val().trim(),
                newPassword: $("#reset-password").val()
            },
            success: (value) => {
                if(value.message) {
                    $("#forgot-modal").modal("hide");
                    $('body').toast({
                        class: "success",
                        position: "top center",
                        message: "Password successfully reset"
                    });
                } else {
                    $('body').toast({
                        class: "error",
                        position: "top center",
                        message: "Username not found"
                    });
                    $("#reset-username-field").addClass("error");
                    $("#reset-password").val("");
                    $("#reset-confirm-password").val("");
                }
            }
        })
    } 
})

function getDate() {
    var date = new Date();
    return date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function setup() {
    $("#form").form("clear");
}

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