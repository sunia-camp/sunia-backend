// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
function newRegistration() {
    Logger.log("Managing new registration...");
    // registrar@sunia.ca should be the one executing the script, so that the email sends from the current reg
    // configure this by making sure the trigger for this script is under registrar@sunia.ca
    var email = Session.getActiveUser().getEmail();
    if (email != "registrar@sunia.ca") {
        Logger.log("The email isn't sending from registrar@sunia.ca... it's sending from " +
            email);
        return;
    }
    var registrants = getData();
    transferData(registrants);
    postToSlack(registrants);
    sendEmails(registrants);
    Logger.log("Done!");
}
// Get student data from raw input sheet
function getData() {
    var rawRegString = PropertiesService.getScriptProperties().getProperty("rawRegSource");
    var rawRegSource = SpreadsheetApp.openById(rawRegString);
    var rrData = rawRegSource.getSheetByName("Raw_Data");
    var rrNumEmailed = rawRegSource.getSheetByName("Num_Emailed");
    var lastReg = rrData.getLastRow();
    var lastEmailed = rrNumEmailed.getRange(1, 2).getValue();
    var lastEmailedCell = rrNumEmailed.getRange(1, 2);
    var data = rrData.getDataRange().getValues(); // raw reg data in 2D array
    // Get all the column indexes
    // Personal information
    var dateCol = data[0].indexOf("Submitted On"); // looks at top row of sheet
    var fnCol = data[0].indexOf("First Name");
    var prefCol = data[0].indexOf("Preferred First Name");
    var lnCol = data[0].indexOf("Last Name");
    var sessionCol = data[0].indexOf("Session Choice");
    var busCol = data[0].indexOf("Red Deer Bus");
    var hearCol = data[0].indexOf("How did you hear about SUNIA");
    var stuPhoneCol = data[0].indexOf("Student Phone");
    var stuEmailCol = data[0].indexOf("Student Email");
    var stuAgeCol = data[0].indexOf("Age");
    var stuHCCol = data[0].indexOf("Provincial Health Care Number");
    var genderCol = data[0].indexOf("Gender");
    // Location
    var addressCol = data[0].indexOf("Address");
    var cityCol = data[0].indexOf("City");
    var provinceCol = data[0].indexOf("ProvinceState");
    var countryCol = data[0].indexOf("Country");
    var postalCol = data[0].indexOf("Postal CodeZIP Code");
    // Medical
    var healthCol = data[0].indexOf("Health Concerns");
    var medCol = data[0].indexOf("Medications");
    var dietCol = data[0].indexOf("Dietary Restrictions");
    // Parent information
    var parentNameCol = data[0].indexOf("ParentGuardian Name");
    var parentRelCol = data[0].indexOf("ParentGuardian Relationship to Student");
    var parentEmailCol = data[0].indexOf("ParentGuardian Email");
    var parentPhoneCol = data[0].indexOf("ParentGuardian Phone");
    // School
    var schoolNameCol = data[0].indexOf("School Name");
    var schoolCityCol = data[0].indexOf("School City");
    var schoolProvCol = data[0].indexOf("School ProvinceState");
    var schoolCountryCol = data[0].indexOf("School Country");
    var gradeCol = data[0].indexOf("Grade");
    // Primary emergency contact
    var primeNameCol = data[0].indexOf("Primary Emergency Contact");
    var primeRelCol = data[0].indexOf("Primary Relation to Student");
    var primePhone1Col = data[0].indexOf("Primary Phone");
    var primePhone1TypeCol = data[0].indexOf("Primary Phone Type");
    var primePhone2Col = data[0].indexOf("Primary Alternate Phone");
    var primePhone2TypeCol = data[0].indexOf("Primary Alternate Phone Type");
    // Secondary emergency contact
    var secNameCol = data[0].indexOf("Secondary Emergency Contact");
    var secRelCol = data[0].indexOf("Secondary Relation to Student");
    var secPhone1Col = data[0].indexOf("Secondary Phone");
    var secPhone1TypeCol = data[0].indexOf("Secondary Phone Type");
    var secPhone2Col = data[0].indexOf("Secondary Alternate Phone");
    var secPhone2TypeCol = data[0].indexOf("Secondary Alternate Phone Type");
    // Shoutout
    var shoutoutCol = data[0].indexOf("Optional Did anyone in particular encourage you to register If so who");
    var students = [];
    for (var i = lastEmailed; i < lastReg; i++) {
        lastEmailedCell.setValue(lastEmailedCell.getValue() + 1);
        var student = {
            date: data[i][dateCol],
            firstName: data[i][fnCol],
            prefName: data[i][prefCol],
            lastName: data[i][lnCol],
            week: data[i][sessionCol],
            bus: data[i][busCol],
            studentPhone: data[i][stuPhoneCol],
            studentEmail: data[i][stuEmailCol],
            age: data[i][stuAgeCol],
            gender: data[i][genderCol],
            healthNumber: data[i][stuHCCol],
            address: data[i][addressCol],
            city: data[i][cityCol],
            province: data[i][provinceCol],
            country: data[i][countryCol],
            postalCode: data[i][postalCol],
            healthConcerns: data[i][healthCol],
            medications: data[i][medCol],
            diet: data[i][dietCol],
            parentName: data[i][parentNameCol],
            parentRelationship: data[i][parentRelCol],
            parentEmail: data[i][parentEmailCol],
            parentPhone: data[i][parentPhoneCol],
            schoolName: data[i][schoolNameCol],
            schoolCity: data[i][schoolCityCol],
            schoolProvince: data[i][schoolProvCol],
            schoolCountry: data[i][schoolCountryCol],
            grade: data[i][gradeCol],
            ecName: data[i][primeNameCol],
            ecRelationship: data[i][primeRelCol],
            ecPhone: data[i][primePhone1Col],
            ecPhoneType: data[i][primePhone1TypeCol],
            ecAltPhone: data[i][primePhone2Col],
            ecAltPhoneType: data[i][primePhone2TypeCol],
            ec2Name: data[i][secNameCol],
            ec2Relationship: data[i][secRelCol],
            ec2Phone: data[i][secPhone1Col],
            ec2PhoneType: data[i][secPhone1TypeCol],
            ec2AltPhone: data[i][secPhone2Col],
            ec2AltPhoneType: data[i][secPhone2TypeCol],
            hearAboutUs: data[i][hearCol],
            shoutout: data[i][shoutoutCol]
        };
        students.push(student);
    }
    return students;
}
function transferData(studentsToTransfer) {
    // Get master reg sheet
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrInput = masterRegSource.getSheetByName("INPUT");
    var mrRegs = masterRegSource.getSheetByName("REGS");
    var data = mrInput.getDataRange().getValues(); // raw reg data in 2D array
    // Get all the column indexes
    // Personal information
    var dateCol = data[0].indexOf("DATE OF REG"); // looks at top row of sheet
    var fnCol = data[0].indexOf("FIRST NAME");
    var prefCol = data[0].indexOf("PREFERRED NAME");
    var lnCol = data[0].indexOf("LAST NAME");
    var sessionCol = data[0].indexOf("WEEK");
    var busCol = data[0].indexOf("BUS");
    var hearCol = data[0].indexOf("HOW DID YOU HEAR ABOUT SUNIA");
    var stuPhoneCol = data[0].indexOf("STUDENT PHONE");
    var stuEmailCol = data[0].indexOf("STUDENT EMAIL");
    var stuAgeCol = data[0].indexOf("AGE");
    var stuHCCol = data[0].indexOf("AHC#");
    var genderCol = data[0].indexOf("GENDER");
    // Location
    var addressCol = data[0].indexOf("ADDRESS");
    var cityCol = data[0].indexOf("CITY");
    var provinceCol = data[0].indexOf("PROVINCE/STATE");
    var countryCol = data[0].indexOf("COUNTRY");
    var postalCol = data[0].indexOf("POSTAL CODE");
    // Medical
    var healthCol = data[0].indexOf("HEALTH CONCERNS");
    var medCol = data[0].indexOf("MEDICATIONS");
    var dietCol = data[0].indexOf("DIETARY RESTRICTIONS");
    // Parent information
    var parentNameCol = data[0].indexOf("PARENT NAME");
    var parentRelCol = data[0].indexOf("PARENT RELATIONSHIP");
    var parentEmailCol = data[0].indexOf("PARENT EMAIL");
    var parentPhoneCol = data[0].indexOf("PARENT PHONE");
    // School
    var schoolNameCol = data[0].indexOf("SCHOOL");
    var schoolCityCol = data[0].indexOf("SCHOOL CITY");
    var schoolProvCol = data[0].indexOf("SCHOOL PROVINCE/STATE");
    var schoolCountryCol = data[0].indexOf("SCHOOL COUNTRY");
    var gradeCol = data[0].indexOf("GRADE");
    // Primary emergency contact
    var primeNameCol = data[0].indexOf("PRIME EC NAME");
    var primeRelCol = data[0].indexOf("PRIME EC RELATIONSHIP");
    var primePhone1Col = data[0].indexOf("PRIME EC PHONE NUMBER");
    var primePhone1TypeCol = data[0].indexOf("PRIME EC PHONE TYPE");
    var primePhone2Col = data[0].indexOf("PRIME EC ALTERNATE PHONE");
    var primePhone2TypeCol = data[0].indexOf("PRIME EC ALTERNATE PHONE TYPE");
    // Secondary emergency contact
    var secNameCol = data[0].indexOf("SECOND EMERG CONTACT NAME");
    var secRelCol = data[0].indexOf("SECOND EMERG RELATIONSHIP");
    var secPhone1Col = data[0].indexOf("SECOND EMERG PHONE 1");
    var secPhone1TypeCol = data[0].indexOf("SECOND EMERG PHONE TYPE");
    var secPhone2Col = data[0].indexOf("SECOND EMERG PHONE 2");
    var secPhone2TypeCol = data[0].indexOf("SECOND EMERG ALTERNATE PHONE TYPE");
    // Shoutout
    var shoutoutCol = data[0].indexOf("SHOUTOUT");
    for (var i = 0; i < studentsToTransfer.length; i++) {
        var studentToTransfer = studentsToTransfer[i];
        var rowToWriteTo = mrInput.getLastRow() + 1;
        // Every column needs a "+1" because we're using getRange which indexes at 1
        mrRegs.getRange(rowToWriteTo, 1).setValue(rowToWriteTo - 1);
        // Student basics
        mrInput.getRange(rowToWriteTo, dateCol + 1).setValue(studentToTransfer.date);
        mrInput.getRange(rowToWriteTo, fnCol + 1).setValue(studentToTransfer.firstName);
        mrInput.getRange(rowToWriteTo, prefCol + 1).setValue(studentToTransfer.prefName);
        mrInput.getRange(rowToWriteTo, lnCol + 1).setValue(studentToTransfer.lastName);
        // SUNIA logistics
        mrInput.getRange(rowToWriteTo, sessionCol + 1).setValue(studentToTransfer.week);
        mrInput.getRange(rowToWriteTo, busCol + 1).setValue(studentToTransfer.bus);
        mrInput.getRange(rowToWriteTo, hearCol + 1).setValue(studentToTransfer.hearAboutUs);
        // More student information
        mrInput.getRange(rowToWriteTo, stuPhoneCol + 1).setValue(studentToTransfer.studentPhone);
        mrInput.getRange(rowToWriteTo, stuEmailCol + 1).setValue(studentToTransfer.studentEmail);
        mrInput.getRange(rowToWriteTo, stuAgeCol + 1).setValue(studentToTransfer.age);
        mrInput.getRange(rowToWriteTo, stuHCCol + 1).setValue(studentToTransfer.healthNumber);
        mrInput.getRange(rowToWriteTo, genderCol + 1).setValue(studentToTransfer.gender);
        // Location
        mrInput.getRange(rowToWriteTo, addressCol + 1).setValue(studentToTransfer.address);
        mrInput.getRange(rowToWriteTo, cityCol + 1).setValue(studentToTransfer.city);
        mrInput.getRange(rowToWriteTo, provinceCol + 1).setValue(studentToTransfer.province);
        mrInput.getRange(rowToWriteTo, countryCol + 1).setValue(studentToTransfer.country);
        mrInput.getRange(rowToWriteTo, postalCol + 1).setValue(studentToTransfer.postalCode);
        // Student health
        mrInput.getRange(rowToWriteTo, healthCol + 1).setValue(studentToTransfer.healthConcerns);
        mrInput.getRange(rowToWriteTo, medCol + 1).setValue(studentToTransfer.medications);
        mrInput.getRange(rowToWriteTo, dietCol + 1).setValue(studentToTransfer.diet);
        // Parent information
        mrInput.getRange(rowToWriteTo, parentNameCol + 1).setValue(studentToTransfer.parentName);
        mrInput.getRange(rowToWriteTo, parentRelCol + 1).setValue(studentToTransfer.parentRelationship);
        mrInput.getRange(rowToWriteTo, parentEmailCol + 1).setValue(studentToTransfer.parentEmail);
        mrInput.getRange(rowToWriteTo, parentPhoneCol + 1).setValue(studentToTransfer.parentPhone);
        // School
        mrInput.getRange(rowToWriteTo, schoolNameCol + 1).setValue(studentToTransfer.schoolName);
        mrInput.getRange(rowToWriteTo, schoolCityCol + 1).setValue(studentToTransfer.schoolCity);
        mrInput.getRange(rowToWriteTo, schoolProvCol + 1).setValue(studentToTransfer.schoolProvince);
        mrInput.getRange(rowToWriteTo, schoolCountryCol + 1).setValue(studentToTransfer.schoolCountry);
        mrInput.getRange(rowToWriteTo, gradeCol + 1).setValue(studentToTransfer.grade);
        // First emergency contact
        mrInput.getRange(rowToWriteTo, primeNameCol + 1).setValue(studentToTransfer.ecName);
        mrInput.getRange(rowToWriteTo, primeRelCol + 1).setValue(studentToTransfer.ecRelationship);
        mrInput.getRange(rowToWriteTo, primePhone1Col + 1).setValue(studentToTransfer.ecPhone);
        mrInput.getRange(rowToWriteTo, primePhone1TypeCol + 1).setValue(studentToTransfer.ecPhoneType);
        mrInput.getRange(rowToWriteTo, primePhone2Col + 1).setValue(studentToTransfer.ecAltPhone);
        mrInput.getRange(rowToWriteTo, primePhone2TypeCol + 1).setValue(studentToTransfer.ecAltPhoneType);
        // Second emergency contact
        mrInput.getRange(rowToWriteTo, secNameCol + 1).setValue(studentToTransfer.ec2Name);
        mrInput.getRange(rowToWriteTo, secRelCol + 1).setValue(studentToTransfer.ec2Relationship);
        mrInput.getRange(rowToWriteTo, secPhone1Col + 1).setValue(studentToTransfer.ec2Phone);
        mrInput.getRange(rowToWriteTo, secPhone1TypeCol + 1).setValue(studentToTransfer.ec2PhoneType);
        mrInput.getRange(rowToWriteTo, secPhone2Col + 1).setValue(studentToTransfer.ec2AltPhone);
        mrInput.getRange(rowToWriteTo, secPhone2TypeCol + 1).setValue(studentToTransfer.ec2AltPhoneType);
        // Shoutout
        mrInput.getRange(rowToWriteTo, shoutoutCol + 1).setValue(studentToTransfer.shoutout);
    }
}
function postToSlack(registrants) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    for (var i = 0; i < registrants.length; i++) {
        var registrant = registrants[i];
        var message = generateSlackFormatting(registrant);
        var testPayload = {
            channel: "#testing",
            text: message
        };
        var regPayload = {
            channel: "#reg",
            text: message
        };
        try {
            //sendToSlack(url, regPayload);
            sendToSlack(url, testPayload); // CHANGE BEFORE LAUNCH
        }
        catch (error) {
            throw new Error("There was an issue sending the update to Slack");
        }
    }
}
// Generates Slack formatting for a registrant
function generateSlackFormatting(individual) {
    return "\n*Another registrant has arrived.*\n\n\nName: ".concat(individual.firstName, " ").concat(individual.lastName, "\nCountry: ").concat(individual.country, "\nSchool: ").concat(individual.schoolName, "\nHow did you hear about SUNIA? ").concat(individual.hearAboutUs, "\n\n_").concat(generateRandomGladosQuote(), "_\n\nGLaDOS\n");
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
function sendEmails(registrants) {
    for (var i = 0; i < registrants.length; i++) {
        var registrant = registrants[i];
        var pEmail = registrant.parentEmail;
        var sEmail = registrant.studentEmail;
        sendParentEmail(pEmail, registrant);
        sendStudentEmail(sEmail, registrant);
    }
}
function sendParentEmail(pEmail, registrant) {
    if (pEmail == "") {
        Logger.log("Parent email was empty for some reason... strange");
        notifyError("Parent email blank for " + registrant.firstName + " " + registrant.lastName);
        return;
    }
    else if (pEmail == "patrick@sunia.ca") { // testing function - put your email in when testing to avoid spam
        Logger.log("Parent email works but wasn't sent to save your fuckin inbox");
        return;
    }
    else {
        try {
            var parentName = registrant.parentName;
            var pTemplate = HtmlService.createTemplateFromFile("html/intro-parents");
            pTemplate.parentName = parentName; // note the different variable names
            pTemplate.registrant = registrant;
            var phtmlBody = pTemplate.evaluate().getContent();
            MailApp.sendEmail({
                to: pEmail,
                subject: "SUNIA 2020: Next Steps in Your Child's Registration!",
                htmlBody: phtmlBody
            });
            Logger.log(parentName + " was contacted!");
        }
        catch (error) {
            Logger.log(error + "\nError with parent email, email likely not send as a result");
            notifyError('Error sending parent email to ' + pEmail + ' for student ' + registrant.firstName + " " + registrant.lastName);
        }
    }
}
function sendStudentEmail(sEmail, registrant) {
    if (sEmail == "") {
        Logger.log("Student email was blank for reason... strange");
        notifyError("Student email blank for " + registrant.firstName + " " + registrant.lastName);
        return;
    }
    else if (sEmail == "pshspammail@gmail.com") { // testing function - put your email in when testing to avoid spam
        Logger.log("Student email works but wasn't sent to save your fuckin inbox");
        return;
    }
    else {
        try {
            var studentName = registrant.firstName;
            var sTemplate = HtmlService.createTemplateFromFile("html/intro-student");
            sTemplate.studentName = studentName;
            sTemplate.registrant = registrant;
            var shtmlBody = sTemplate.evaluate().getContent();
            //send mail to student
            MailApp.sendEmail({
                to: sEmail,
                subject: "SUNIA 2020: Next Steps in Your Registration!",
                htmlBody: shtmlBody
            });
            Logger.log(studentName + " was contacted!");
        }
        catch (error) {
            Logger.log(error + "\nError with student email, email likely not send as a result");
            notifyError("Error sending student email to " + sEmail + " for student " + registrant.firstName + " " + registrant.lastName);
        }
    }
}
function generateRandomGladosQuote() {
    var GladosQuotes = ["We've both said a lot of things that you're going to regret.",
        "I'm going to kill you. And all the cake is gone.",
        "Despite your violent behaviour, all you've managed to break so far is my heart.",
        "Killing you and giving you good advice aren't mutually exclusive.",
        "Here come the test results: You are a horrible person.",
        "Science has now validated your birth mother's decision to leave you on a doorstep."];
    return GladosQuotes[Math.floor(Math.random() * GladosQuotes.length)];
}
function notifyError(error) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var errorMessage = '<@US20FNHGB> ERROR: ' + error;
    var testPayload = {
        channel: "#reg-errors",
        text: errorMessage
    };
    sendToSlack(url, testPayload);
}
