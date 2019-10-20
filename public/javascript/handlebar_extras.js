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

Handlebars.registerHelper('maxify', function(maxCount, cellCount) {
    console.log("max =" + maxCount + "curr = " + cellCount);
    if (cellCount == maxCount){
        return new Handlebars.SafeString("max-cell-count");
    } else {
        return new Handlebars.SafeString("less-cell-count");
    }
});