// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
function newSecondRegistration() {
    Logger.log("Managing new registration...");
    // registrar@sunia.ca should be the one executing the script, so that the email sends from the current reg
    // configure this by making sure the trigger for this script is under registrar@sunia.ca
    var email = Session.getActiveUser().getEmail();
    if (email != "registrar@sunia.ca") {
        Logger.log("The email isn't sending from registrar@sunia.ca... it's sending from " +
            email);
        return;
    }
    var registrants = getSecondData();
    registrants = transferSecondData(registrants);
    sendSecondEmails(registrants);
    Logger.log("Done!");
}
// Get student data from raw input sheet
function getSecondData() {
    var rawRegString = PropertiesService.getScriptProperties().getProperty("infoRegSource");
    var rawRegSource = SpreadsheetApp.openById(rawRegString);
    var rrData = rawRegSource.getSheetByName("Raw_Data");
    var rrNumEmailed = rawRegSource.getSheetByName("Num_Emailed");
    var lastReg = rrData.getLastRow();
    var lastEmailed = rrNumEmailed.getRange(1, 2).getValue() + 1;
    Logger.log("Last Reg: " + lastReg + "\nLast Emailed: " + lastEmailed);
    var lastEmailedCell = rrNumEmailed.getRange(1, 2);
    var data = rrData.getDataRange().getValues(); // raw reg data in 2D array
    // -- Get all the column indices by finding the column names
    // -- UPDATE 2: if you update the form, you have to update these too
    // Personal information
    var dateCol = data[0].indexOf("Submitted On"); // looks at top row of sheet
    var fnCol = data[0].indexOf("First Name");
    var prefCol = data[0].indexOf("Preferred First Name");
    var lnCol = data[0].indexOf("Last Name");
    var busCol = data[0].indexOf("bus");
    var stuEmailCol = data[0].indexOf("Student Email");
    var stuHCCol = data[0].indexOf("Provincial Health Care Number");
    var genderCol = data[0].indexOf("Gender");
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
            studentEmail: data[i][stuEmailCol],
            date: data[i][dateCol],
            firstName: data[i][fnCol],
            prefName: data[i][prefCol],
            lastName: data[i][lnCol],
            week: "",
            bus: data[i][busCol],
            studentPhone: "",
            age: "",
            gender: data[i][genderCol],
            address: "",
            city: "",
            province: "",
            country: "",
            postalCode: "",
            healthNumber: data[i][stuHCCol],
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
            shoutout: data[i][shoutoutCol]
        };
        students.push(student);
    }
    return students;
}
function transferSecondData(studentsToTransfer) {
    // Get master reg sheet
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrInput = masterRegSource.getSheetByName("input");
    var mrRegs = masterRegSource.getSheetByName("Regs");
    var data = mrInput.getDataRange().getValues(); // raw reg data in 2D array
    // -- Get all the column indices by finding the column names
    // -- UPDATE 2: if you update the form, you have to update these too
    // Personal information
    var dateCol = data[0].indexOf("date_reg"); // looks at top row of sheet
    var fnCol = data[0].indexOf("first_name");
    var prefCol = data[0].indexOf("pref_name");
    var lnCol = data[0].indexOf("last_name");
    var sessionCol = data[0].indexOf("week");
    var busCol = data[0].indexOf("bus");
    var stuPhoneCol = data[0].indexOf("student_phone");
    var stuEmailCol = data[0].indexOf("student_email");
    var stuAgeCol = data[0].indexOf("age");
    var stuHCCol = data[0].indexOf("health_num");
    var genderCol = data[0].indexOf("gender");
    // Location
    var addressCol = data[0].indexOf("address");
    var cityCol = data[0].indexOf("city");
    var provinceCol = data[0].indexOf("prov");
    var countryCol = data[0].indexOf("country");
    var postalCol = data[0].indexOf("postal");
    // Medical
    var healthCol = data[0].indexOf("health_concerns");
    var medCol = data[0].indexOf("medications");
    var dietCol = data[0].indexOf("dietary");
    // Parent information
    var parentNameCol = data[0].indexOf("parent_name");
    var parentRelCol = data[0].indexOf("parent_rel");
    var parentEmailCol = data[0].indexOf("parent_email");
    var parentPhoneCol = data[0].indexOf("parent_phone");
    // School
    var schoolNameCol = data[0].indexOf("school_name");
    var schoolCityCol = data[0].indexOf("school_city");
    var schoolProvCol = data[0].indexOf("school_prov");
    var schoolCountryCol = data[0].indexOf("school_country");
    var gradeCol = data[0].indexOf("grade");
    // Primary emergency contact
    var primeNameCol = data[0].indexOf("ec_1_name");
    var primeRelCol = data[0].indexOf("ec_1_rel");
    var primePhone1Col = data[0].indexOf("ec_1_phone_1");
    var primePhone1TypeCol = data[0].indexOf("ec_1_phone_1_type");
    var primePhone2Col = data[0].indexOf("ec_1_phone_2");
    var primePhone2TypeCol = data[0].indexOf("ec_1_phone_2_type");
    // Secondary emergency contact
    var secNameCol = data[0].indexOf("ec_2_name");
    var secRelCol = data[0].indexOf("ec_2_rel");
    var secPhone1Col = data[0].indexOf("ec_2_phone_1");
    var secPhone1TypeCol = data[0].indexOf("ec_2_phone_1_type");
    var secPhone2Col = data[0].indexOf("ec_2_phone_2");
    var secPhone2TypeCol = data[0].indexOf("ec_2_phone_2_type");
    // Shoutout
    var shoutoutCol = data[0].indexOf("reference");
    for (var i = 0; i < studentsToTransfer.length; i++) {
        var studentToTransfer = studentsToTransfer[i];
        var rowToWriteTo = 0;
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            rowToWriteTo = mrRegs.createTextFinder(studentToTransfer.studentEmail).findNext().getRow();
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> REG INFO ERROR\nName: ".concat(studentToTransfer.firstName, " (").concat(studentToTransfer.prefName, ") ").concat(studentToTransfer.lastName)
            };
            sendToSlack(url, payload);
            continue;
        }
        // Every column needs a "+1" because we're using getRange which indexes at 1
        if (rowToWriteTo == 0) {
            continue;
        }
        mrRegs.getRange(rowToWriteTo, 1).setValue(rowToWriteTo - 1);
        // Student basics
        //mrInput.getRange(rowToWriteTo, dateCol+1).setValue(studentToTransfer.date);
        mrInput.getRange(rowToWriteTo, fnCol + 1).setValue(studentToTransfer.firstName);
        mrInput.getRange(rowToWriteTo, prefCol + 1).setValue(studentToTransfer.prefName);
        mrInput.getRange(rowToWriteTo, lnCol + 1).setValue(studentToTransfer.lastName);
        // SUNIA logistics
        mrInput.getRange(rowToWriteTo, busCol + 1).setValue(studentToTransfer.bus);
        // More student information
        mrInput.getRange(rowToWriteTo, stuEmailCol + 1).setValue(studentToTransfer.studentEmail);
        mrInput.getRange(rowToWriteTo, stuHCCol + 1).setValue(studentToTransfer.healthNumber);
        mrInput.getRange(rowToWriteTo, genderCol + 1).setValue(studentToTransfer.gender);
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
        //Pull data for email confirmation
        studentToTransfer.week = mrInput.getRange(rowToWriteTo, sessionCol + 1).getValue();
        studentToTransfer.studentPhone = mrInput.getRange(rowToWriteTo, stuPhoneCol + 1).getValue();
        studentToTransfer.age = mrInput.getRange(rowToWriteTo, stuAgeCol + 1).getValue();
        studentToTransfer.address = mrInput.getRange(rowToWriteTo, addressCol + 1).getValue();
        studentToTransfer.city = mrInput.getRange(rowToWriteTo, cityCol + 1).getValue();
        studentToTransfer.province = mrInput.getRange(rowToWriteTo, provinceCol + 1).getValue();
        studentToTransfer.country = mrInput.getRange(rowToWriteTo, countryCol + 1).getValue();
        studentToTransfer.postalCode = mrInput.getRange(rowToWriteTo, postalCol + 1).getValue();
    }
    return (studentsToTransfer);
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
function sendSecondEmails(registrants) {
    for (var i = 0; i < registrants.length; i++) {
        var registrant = registrants[i];
        var pEmail = registrant.parentEmail;
        var sEmail = registrant.studentEmail;
        sendParentEmail(pEmail, registrant);
        sendStudentSecondEmail(sEmail, registrant);
    }
}
function sendParentEmail(pEmail, registrant) {
    if (pEmail == "") {
        Logger.log("Parent email was empty for some reason... strange");
        notifyError("Parent email blank for " + registrant.prefName + " " + registrant.lastName);
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
                subject: "SUNIA 2023: Next Steps in Your Child's Registration!",
                htmlBody: phtmlBody
            });
            Logger.log(parentName + " was contacted!");
        }
        catch (error) {
            Logger.log(error + "\nError with parent email, email likely not send as a result");
            notifyError('Error sending parent email to ' + pEmail + ' for student ' + registrant.prefName + " " + registrant.lastName);
        }
    }
}
function sendStudentSecondEmail(sEmail, registrant) {
    if (sEmail == "") {
        Logger.log("Student email was blank for reason... strange");
        notifyError("Student email blank for " + registrant.prefName + " " + registrant.lastName);
        return;
    }
    else if (sEmail == "pshspammail@gmail.com") { // testing function - put your email in when testing to avoid spam
        Logger.log("Student email works but wasn't sent to save your fuckin inbox");
        return;
    }
    else {
        try {
            var studentName = registrant.prefName;
            var sTemplate = HtmlService.createTemplateFromFile("html/intro-student");
            sTemplate.studentName = studentName;
            sTemplate.registrant = registrant;
            var shtmlBody = sTemplate.evaluate().getContent();
            //send mail to student
            MailApp.sendEmail({
                to: sEmail,
                subject: "SUNIA 2023: Info Confirmation & Next Steps",
                htmlBody: shtmlBody
            });
            Logger.log(studentName + " was contacted!");
        }
        catch (error) {
            Logger.log(error + "\nError with student email, email likely not send as a result");
            notifyError("Error sending student email to " + sEmail + " for student " + registrant.prefName + " " + registrant.lastName);
        }
    }
}
function notifyError(error) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
    var errorMessage = '<@US20FNHGB> ERROR: ' + error;
    var testPayload = {
        channel: "#reg-errors",
        text: errorMessage
    };
    sendToSlack(url, testPayload);
}
