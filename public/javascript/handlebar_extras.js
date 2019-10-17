/*
    Handlebars Hellpers
*/

Handlebars.registerHelper('colorcells', function(index) {
    console.log(index);
    let colorsArrays = ["pink","blue", "orange", "green", "purple", "olive", "yellow", "teal"];
    let num = index % colorsArrays.length;
    console.log(colorsArrays[num]);
    return new Handlebars.SafeString(colorsArrays[num]);
});