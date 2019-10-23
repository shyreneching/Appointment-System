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
                if(!value.message) {
                    $("#username-input").addClass("error");
                    $("#password-input").addClass("error");
                    $("#password").val("");
                    $('body').toast({message: "Invalid username or password"});
                } else {
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