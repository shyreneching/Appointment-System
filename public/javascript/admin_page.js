$(document).ready(() => {
    // switch page between users, dentist, and procedure
    $(".ui .item").on("click", switchPage);    
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
    $("#edit-password-field-user").removeClass("error");
    $("#edit-confirm-password-field-user").removeClass("error");
    $("#edit-firstname-field-dentist").removeClass("error");
    $("#edit-lastname-field-dentist").removeClass("error");
    $("#edit-password-field-dentist").removeClass("error");
    $("#edit-confirm-password-field-dentist").removeClass("error");
    $("#edit-procedure-field").removeClass("error");
    $("#start-add-field").removeClass("error");
    $("#end-add-field").removeClass("error");
})

// LOGOUT
$("#logout").click(() => {
    window.location.href="/logout";
})