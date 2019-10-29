$(document).ready(() => {
    $("#submit").click(() => { 
        $.ajax({
            type: "post",
            url: "/validateLogin",
            data: {
                username: $("#username").val(),
                password: $("#password").val()
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
        $("#submit").click();
    }
})

function setup() {
    $("#form").form("clear");
}