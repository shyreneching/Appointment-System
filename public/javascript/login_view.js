var list = [];

$(document).ready(() => {
    $("#submit").click((e) => {
        var temp = validate($("#username").val(), $("#password").val());
        if(temp == undefined) {
            $("#username-input").addClass("error");
            $("#password-input").addClass("error");
            $("#password").val("");
            e.preventDefault();
        } 
    })
})

$(document).on("keydown", () => {
    $("#username-input").removeClass("error");
    $("#password-input").removeClass("error");
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