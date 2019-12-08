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
    if (cellCount == maxCount){
        return new Handlebars.SafeString("max-cell-count");
    } else {
        return new Handlebars.SafeString("less-cell-count");
    }
});

Handlebars.registerHelper('weekBlue', function(index) {
    if (index % 2 == 0){
        return new Handlebars.SafeString("light blue pastel colored cell");
    } else {
        return new Handlebars.SafeString("dark blue pastel colored cell");
    }
});

Handlebars.registerHelper('weekYellow', function(index) {
    if (index % 2 == 0){
        return new Handlebars.SafeString("light yellow pastel colored cell");
    } else {
        return new Handlebars.SafeString("dark yellow pastel colored cell");
    }
});

Handlebars.registerHelper('weekGreen', function(index) {
    if (index % 2 == 0){
        return new Handlebars.SafeString("light green pastel colored cell");
    } else {
        return new Handlebars.SafeString("dark green pastel colored cell");
    }
});

Handlebars.registerHelper('weekRed', function(index) {
    if (index % 2 == 0){ 
        return new Handlebars.SafeString("light red pastel colored cell");
    } else {
        return new Handlebars.SafeString("dark red pastel colored cell");
    }
});

Handlebars.registerHelper('iff', function(a, operator, b, opts) {
    var bool = false;
    switch(operator) {
       case '==':
           bool = a == b;
           break;
       case '>':
           bool = a > b;
           break;
       case '<':
           bool = a < b;
           break;
       default:
           throw "Unknown operator " + operator;
    }
 
    if (bool) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

Handlebars.registerHelper('availableAllDay', function(available) {
    if(available){
        return new Handlebars.SafeString("light red pastel colored cell");
    }else{
        return new Handlebars.SafeString("light green pastel colored cell");
    }
});