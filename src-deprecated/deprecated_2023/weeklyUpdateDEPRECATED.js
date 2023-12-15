// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
function weeklyUpdate() {
    Logger.log("Attempting to give weekly update...");
    var misc = "";
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrOverview = masterRegSource.getSheetByName("Overview"); // mr is short for masterReg
    var mrInput = masterRegSource.getSheetByName("input");
    var mrRegs = masterRegSource.getSheetByName("Regs");
    var lastReg = mrInput.getLastRow();
    var newRegs = true;
    var lastWU;
    try {
        lastWU = getLastInUpdate(mrRegs, lastReg);
    }
    catch (error) {
        Logger.log(error + "\nSending stats only...");
        newRegs = false;
    }
    var listShort;
    if (newRegs == true) {
        try {
            var lists = generateList(mrInput, lastWU, lastReg);
            listShort = lists[0];
        }
        catch (error) {
            Logger.log(error + "\nexiting function as a result");
            return;
        }
    }
    else {
        listShort = "\n      No new regs this week. How sad.\n   \n";
    }
    var stats;
    try {
        stats = generateGeneralStats(mrOverview);
    }
    catch (error) {
        Logger.log(error + "\nexiting function as a result");
    }
    var registrationMessage = generateRegistrationMessage(stats, listShort);
    // const adminMessage: string = generateAdminMessage(stats)
    //  const regOpsMessage: string = generateRegOpsMessage(stats, listFull);
    try {
        sendRegistrationUpdate(registrationMessage);
        //sendAdminUpdate(adminMessage);
        //sendRegOpsUpdate(regOpsMessage);
    }
    catch (error) {
        Logger.log(error, "exiting function as a result");
    }
    Logger.log("Weekly update done!", misc);
}
// Finds the column entitled "WEEKLY UPDATE", loops through it and returns the earliest row where there is a false
function getLastInUpdate(sheet, lr) {
    var data = sheet.getDataRange().getValues();
    var col = data[0].indexOf("WEEKLY UPDATE"); // looks at top row of sheet
    if (col == -1) {
        throw new Error("The weekly update column wasn't found");
    }
    for (var i = 0; i < lr; i++) {
        // row, then column
        if (data[i][col] == false) {
            sheet.getRange(i + 1, col + 1).setValue(true);
            return i;
        }
        throw "No new registrations!";
    }
}
// Creates list of student information for Slack information
function generateList(sheet, lc, lr) {
    var data = sheet.getDataRange().getValues(); // gathering input sheet data
    // Personal Info
    var dateCol = data[0].indexOf("DATE OF REG");
    var fnameCol = data[0].indexOf("FIRST NAME"); // looks at top row of sheet
    var prefCol = data[0].indexOf("PREFERRED NAME");
    var lnameCol = data[0].indexOf("LAST NAME");
    var weekCol = data[0].indexOf("WEEK");
    var busCol = data[0].indexOf("BUS");
    var hearCol = data[0].indexOf("HOW DID YOU HEAR ABOUT SUNIA");
    var stuPhoneCol = data[0].indexOf("STUDENT PHONE");
    var stuEmailCol = data[0].indexOf("STUDENT EMAIL");
    var stuAgeCol = data[0].indexOf("AGE");
    var stuHCCol = data[0].indexOf("AHC#");
    var genderCol = data[0].indexOf("GENDER");
    // Location Info
    var addressCol = data[0].indexOf("ADDRESS");
    var cityCol = data[0].indexOf("CITY");
    var provCol = data[0].indexOf("PROVINCE/STATE");
    var countryCol = data[0].indexOf("COUNTRY");
    var postalCol = data[0].indexOf("POSTAL CODE");
    // Medical
    var healthCol = data[0].indexOf("HEALTH CONCERNS");
    var medCol = data[0].indexOf("MEDICATIONS");
    var dietCol = data[0].indexOf("DIETARY RESTRICTIONS");
    // Parent Info
    var parentNameCol = data[0].indexOf("PARENT NAME");
    var parentRelCol = data[0].indexOf("PARENT RELATIONSHIP");
    var parentEmailCol = data[0].indexOf("PARENT EMAIL");
    var parentPhoneCol = data[0].indexOf("PARENT PHONE");
    var schoolCol = data[0].indexOf("SCHOOL");
    var schoolCityCol = data[0].indexOf("SCHOOL CITY");
    var schoolProvCol = data[0].indexOf("SCHOOL PROVINCE/STATE");
    var schoolCountryCol = data[0].indexOf("SCHOOL COUNTRY");
    var gradeCol = data[0].indexOf("GRADE");
    // Emergency Contacts
    var primeNameCol = data[0].indexOf("PRIME EC NAME");
    var primeRelCol = data[0].indexOf("PRIME EC RELATIONSHIP");
    var primePhone1Col = data[0].indexOf("PRIME EC PHONE NUMBER");
    var primePhone1TypeCol = data[0].indexOf("PRIME EC PHONE TYPE");
    var primePhone2Col = data[0].indexOf("PRIME EC ALTERNATE PHONE");
    var primePhone2TypeCol = data[0].indexOf("PRIME EC ALTERNATE PHONE TYPE");
    var secNameCol = data[0].indexOf("SECOND EMERG CONTACT NAME");
    var secRelCol = data[0].indexOf("SECOND EMERG RELATIONSHIP");
    var secPhone1Col = data[0].indexOf("SECOND EMERG PHONE 1");
    var secPhone1TypeCol = data[0].indexOf("SECOND EMERG PHONE TYPE");
    var secPhone2Col = data[0].indexOf("SECOND EMERG PHONE 2");
    var secPhone2TypeCol = data[0].indexOf("SECOND EMERG ALTERNATE PHONE TYPE");
    // Shoutout
    var shoutoutCol = data[0].indexOf("SHOUTOUT");
    // check to make sure all columns are found; if not throw error
    if (fnameCol == -1 ||
        lnameCol == -1 ||
        weekCol == -1 ||
        cityCol == -1 ||
        provCol == -1 ||
        countryCol == -1 ||
        schoolCol == -1 ||
        gradeCol == -1 ||
        shoutoutCol == -1) {
        throw new Error("A column name wasn't found. Please check the names all much the above spellings and capitalization.");
    }
    var listShort = "";
    var listFull = "";
    for (var i = lc; i < lr; i++) {
        // looping from last contacted to last registered
        var regdate = data[i][dateCol];
        var fname = data[i][fnameCol];
        var prefname = data[i][prefCol];
        var lname = data[i][lnameCol];
        var week = data[i][weekCol];
        var bus = data[i][busCol];
        var hear = data[i][hearCol];
        var stuPhone = data[i][stuPhoneCol];
        var stuEmail = data[i][stuEmailCol];
        var stuAge = data[i][stuAgeCol];
        var stuHC = data[i][stuHCCol];
        var gender = data[i][genderCol];
        var address = data[i][addressCol];
        var city = data[i][cityCol];
        var prov = data[i][provCol];
        var country = data[i][countryCol];
        var postalCode = data[i][postalCol];
        var health = data[i][healthCol];
        var meds = data[i][medCol];
        var diet = data[i][dietCol];
        var parentName = data[i][parentNameCol];
        var parentRel = data[i][parentRelCol];
        var parentEmail = data[i][parentEmailCol];
        var parentPhone = data[i][parentPhoneCol];
        var grade = data[i][gradeCol];
        var schoolName = data[i][schoolCol];
        var schoolCity = data[i][schoolCityCol];
        var schoolProv = data[i][schoolProvCol];
        var schoolCountry = data[i][schoolCountryCol];
        var primeName = data[i][primeNameCol];
        var primeRel = data[i][primeRelCol];
        var primePhone1 = data[i][primePhone1Col];
        var primePhone1Type = data[i][primePhone1TypeCol];
        var primePhone2 = data[i][primePhone2Col];
        var primePhone2Type = data[i][primePhone2TypeCol];
        var secName = data[i][secNameCol];
        var secRel = data[i][secRelCol];
        var secPhone1 = data[i][secPhone1Col];
        var secPhone1Type = data[i][secPhone1TypeCol];
        var secPhone2 = data[i][secPhone2Col];
        var secPhone2Type = data[i][secPhone2TypeCol];
        var shoutout = data[i][shoutoutCol];
        var slackFormatting = getSlackStudentFormatting(fname, lname, week, city, prov, country, grade, schoolName, shoutout);
        listShort += slackFormatting; // returns formatted string directly of students
    }
    return [listShort];
}
// Returns relevant information from the overview tab
function generateGeneralStats(sheet) {
    var data = sheet.getDataRange().getValues(); // gathering overview tab data
    Logger.log(data);
    var result = "";
    var lastStat = sheet.getLastRow();
    var offset = 3; // first row with actual statistics, counting from 0 (row 4)
    for (var i = offset; i < lastStat; i++) {
        result += getSlackStatisticFormatting(data[i][1], data[i][2]);
        Logger.log(result);
    }
    return result;
}
// Generates payment statistics for staff
function generatePaymentStats(sheet) {
    var data = sheet.getDataRange().getValues(); // gathering overview tab data
    var result = "";
    var lastStat = sheet.getLastRow();
    var offset = 3; // first row with actual statistics, counting from 0 (row 4)
    for (var i = offset; i < lastStat; i++) {
        result += getSlackStatisticFormatting(data[i][4], data[i][5]);
    }
    return result;
}
// Returns message formatted for Slack
function getSlackStudentFormatting(fname, lname, week, city, prov, country, grade, school, shoutout) {
    return "\n      ".concat(fname, " ").concat(lname, "\n      ").concat(city, ", ").concat(prov, ", ").concat(country, "\n      Grade ").concat(grade, " @ ").concat(school, "\n      Shoutout?! ").concat(shoutout, "\n        \n    ");
}
/* This is EVERYTHING - if you need to send updates that include all info, use this

function getSlackStudentFormattingFull(
  regdate: string,
  fname: string, prefname: string, lname: string,
  week: string, bus: string, hear:string,
  stuPhone: string, stuEmail: string,
  stuAge: string, stuHC: string, gender: string,
  address: string, city: string, prov: string, country: string, postalCode: string,
  health: string, meds: string, diet: string,
  parentName: string, parentRel: string, parentEmail: string, parentPhone: string,
  grade: string, school: string, schoolCity: string, schoolProv: string, schoolCountry: string,
  primeName: string, primeRel: string,
  primePhone1: string, primePhone1Type: string, primePhone2: string, primePhone2Type: string,
  secName: string, secRel: string,
  secPhone1: string, secPhone1Type: string, secPhone2: string, secPhone2Type: string,
  shoutout: string
): string {
  return `
    ${fname} ${lname} (Preferred: ${prefname}
    ${week}
    Bus: ${bus}
    Heard about us: ${hear}
    Phone: ${stuPhone}
    Email: ${stuEmail}
    Age: ${stuAge}
    Healthcare #: ${stuHC}
    Gender: ${gender}
    Address: ${address}, ${city}, ${prov}, ${country}
    Health Concerns: ${health}
    Meds: ${meds}
    Dietary Needs: ${diet}
    
    Parent: ${parentName} (${parentRel})
    Parent Email: ${parentEmail}
    Parent Phone: ${parentPhone}
    
    Grade ${grade} @ ${school}
    School Name: ${school}
    School Location: ${schoolCity}, ${schoolProv}, ${schoolCountry}
    
    Primary Emerg Contact: ${primeName} (${primeRel})
    ${primePhone1Type}: ${primePhone1}
    ${primePhone2Type}: ${primePhone2}
    
    Secondary Emerg Contact: ${secName} (${secRel})
    ${secPhone1Type}: ${secPhone1}
    ${secPhone2Type}: ${secPhone2}
    
    Shoutout?! ${shoutout}

    ----------------------------------------------------------------
    `;
}
*/
function getSlackStatisticFormatting(name, stat) {
    if (name.indexOf('%') != -1) {
        stat = generatePercentage(parseFloat(stat));
    }
    return "\n      ".concat(name, ": ").concat(stat);
}
// Generates Slack string literal
function generateRegistrationMessage(stats, students) {
    return "\n--------------\n*_Welcome to your weekly update, test subjects!_*\n    \n\n    *STATISTICS*\n    ".concat(stats, "\n    \n\n    *STUDENTS*\n    ").concat(students, "      \n    \n    GLaDOS\n--------------\n    ");
}
/* These aren't used anymore, but if your admin team wants more details, they're here

function generateAdminMessage(stats: string): string {
  return `
*_111011101 Welcome to your weekly update! 111011101_*
    \n
    *010101 STATISTICS 010101*
    ${stats}
    \n
    _Let's commence preparations for rumbling!_
    \n
    GLaDOS
    `;
}

function generateRegOpsMessage(stats: string, students: string): string {
  return `
*_111011101 Welcome to your weekly update! 111011101_*
    \n
    *010101 STATISTICS 010101*
    ${stats}
    \n
    *101010 STUDENTS 101010*
    ${students}
    _Let's commence preparations for rumbling!_
    \n
    Bender
    `;
}

*/
// Sends admin update about payment information for students
function sendAdminPaymentUpdate(message) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var payload = {
        channel: "#testing",
        text: message
    };
    try {
        sendToSlack(url, payload);
    }
    catch (error) {
        throw new Error("There was an issue sending the payment payload");
    }
}
// Sends weekly update to the #registration channel by generating payloads and grabbing URL from GAS properties
function sendRegistrationUpdate(message) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var testPayload = {
        channel: "#testing",
        text: message
    };
    var regPayload = {
        channel: "#reg",
        text: message
    };
    try {
        sendToSlack(url, regPayload);
        //sendToSlack(url, testPayload); // CHANGE BEFORE LAUNCH
    }
    catch (error) {
        throw new Error("There was an issue sending the weekly update");
    }
}
// Sends weekly update to the #admin channel
function sendAdminUpdate(message) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var testPayload = {
        channel: "#testing",
        text: message
    };
    var adminPayload = {
        channel: "#admin",
        text: message
    };
    try {
        // sendToSlack(url, adminPayload);
        // sendToSlack(url, testPayload); // remove in production
    }
    catch (error) {
        throw new Error("There was an issue sending the weekly update");
    }
}
function sendRegOpsUpdate(message) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var testPayload = {
        channel: "#testing",
        text: message
    };
    var adminPayload = {
        channel: "#reg-ops",
        text: message
    };
    try {
        // sendToSlack(url, adminPayload);
        sendToSlack(url, testPayload); // remove in production
    }
    catch (error) {
        throw new Error("There was an issue sending the weekly update");
    }
}
// Slack boilerplate
function sendToSlack(url, payload) {
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
    };
    UrlFetchApp.fetch(url, options);
}
// Simply utility function for converting sheet decimals to percentages
function generatePercentage(decimal) {
    return "".concat((decimal * 100).toFixed(2), "%");
}
