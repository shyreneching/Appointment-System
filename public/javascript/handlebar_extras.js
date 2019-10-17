/*
    Handlebars Hellpers
*/

Handlebars.registerHelper('colorcells', function(index) {
    let colorsArrays = ["pink","blue", "orange", "green", "purple", "olive", "yellow", "teal"];
    let num = index % colorsArrays.length;
    return new Handlebars.SafeString(colorsArrays[num]);
});

Handlebars.registerHelper('commafy', function(index) {
    if (index > 0){
        return new Handlebars.SafeString(", ");
    } else {
        return new Handlebars.SafeString("");
    }
});