var list = [];

$(document).ready(() => {
    $("#submit").click((e) => {
        var temp = validate($("#username").val(), $("#password").val());
        if(temp == undefined) {
            e.preventDefault();
            $("#password").addClass("error");
            $("#message").removeClass("error");
            $("#message").addClass("negative");
            $("#message").text("Invalid username or password");
        } 
    })
})

$(document).on("keydown", () => {
    $("#password").removeClass("error");
    $("#message").removeClass("negative");
    $("#message").addClass("error");
    $("#message").text("");
})

function validate(username, password) {
    var temp = list.find((value) => {
        return value.username == username && value.password == password;
    })
    return temp;
}

function loadUser(data) {
    list = data;
}