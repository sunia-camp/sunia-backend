// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
// Sends parents update to fill out their waivers, along with some other helpful reminders
function weeklyReminders() {
    Logger.log("Sending weekly reminders email...");
    // registrar@sunia.ca should be the one executing the script, so that the email sends from the current reg
    // configure this by making sure the trigger for this script is under registrar@sunia.ca
    var email = Session.getActiveUser().getEmail();
    if (email != "registrar@sunia.ca") {
        Logger.log("The email isn't sending from registrar@sunia.ca... it's sending from " +
            email);
        return;
    }
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrRegs = masterRegSource.getSheetByName("Regs");
    var mrInput = masterRegSource.getSheetByName("input");
    var data = mrRegs.getDataRange().getValues();
    var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)

    // -- Get all the column indices by finding the column names 
    // -- UPDATE 2: if you update the form, you have to update these too
    var colPayment = data[0].indexOf("payment_type_complete"); // looks at top row of sheet
    var colWaivers = data[0].indexOf("waivers_complete"); // looks at top row of sheet
    var colParentEmail = data[0].indexOf("parent_email"); // looks at top row of sheet
    var colReminded = data[0].indexOf("reminders_n"); // looks at top row of sheet
    var colHCNum = data[0].indexOf("health_num");
    var colStudentEmail = data[0].indexOf("student_email");
    var colDropout = data[0].indexOf("dropped");
    var colMeme = data[0].indexOf("ignore");
    if (colPayment == -1 || colWaivers == -1 || colParentEmail == -1 || colReminded == -1 || colHCNum == -1 || colStudentEmail == -1) {
        Logger.log("A column name was not found, exiting script as a result");
        return;
    }
    for (var i = 1; i < lastReg; i++) {
        if ((data[i][colPayment] == false || data[i][colWaivers] == false || data[i][colHCNum] == "") && data[i][colDropout] == false && data[i][colMeme] == false) { // if they haven't submitted a payment type or waivers
            var emailType = 0;
            if (data[i][colPayment] == false && data[i][colWaivers] == false && data[i][colHCNum] == "") {
                emailType = 1;
            }
            else if (data[i][colWaivers] == false && data[i][colHCNum] == "") {
                emailType = 2;
            }
            else if (data[i][colPayment] == false && data[i][colHCNum] == "") {
                emailType = 3;
            }
            else if (data[i][colPayment] == false && data[i][colWaivers] == false) {
                emailType = 4;
            }
            else if (data[i][colPayment] == false) {
                emailType = 5;
            }
            else if (data[i][colHCNum] == "") {
                emailType = 6;
            }
            else if (data[i][colWaivers] == false) {
                emailType = 7;
            }
            if (data[i][colParentEmail] == "") {
                if (data[i][colStudentEmail] == "") {
                    continue; // parent's email is blank, just continue to loop
                }
                else {
                    sendReminderEmail(data[i][colStudentEmail], emailType);
                    var oldReminderCount = mrRegs.getRange(i + 1, colReminded + 1).getValue();
                    mrRegs.getRange(i + 1, colReminded + 1).setValue(oldReminderCount + 1);
                }
            }
            else {
                sendReminderEmail(data[i][colParentEmail], emailType);
                sendReminderEmail(data[i][colStudentEmail], emailType);
                // add 1 to "reminded" column to keep track of emails
                var oldReminderCount = mrRegs.getRange(i + 1, colReminded + 1).getValue(); // get range and set range are indexed from 1
                mrRegs.getRange(i + 1, colReminded + 1).setValue(oldReminderCount + 1);
            }
        }
    }
    Logger.log("Done!");
}
//1 is payment, info, and waivers
//2 is info and waivers
//3 is payment and info
//4 is payment and waivers
//5 is payment
//6 is info
//7 is waivers
function sendReminderEmail(pEmail, emailType) {
    if (pEmail == "") {
        Logger.log("Parent email was blank for some reason. Weird.");
        return;
    }
    try {
        var pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder");
        switch (emailType) {
            case 0:
                Logger.log("Invalid email type - something's fucked");
                Logger.log("Sending original uncustomized email");
                break;
            case 1:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder1");
                break;
            case 2:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder2");
                break;
            case 3:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder3");
                break;
            case 4:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder4");
                break;
            case 5:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder5");
                break;
            case 6:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder6");
                break;
            case 7:
                pTemplate = HtmlService.createTemplateFromFile("html/weekly/reminder7");
                break;
        }
        var phtmlBody = pTemplate.evaluate().getContent();
        MailApp.sendEmail({
            to: pEmail,
            subject: "SUNIA 2023: Registration Reminders",
            htmlBody: phtmlBody
        });
        Logger.log(pEmail + " was contacted with the reminder email!");
    }
    catch (error) {
        Logger.log("I tried to send a reminder email to " +
            pEmail +
            " but there was an error");
        // -- UPDATE 3: update the email here to yours/Reg's (but probably don't actually use registrar@sunia.ca)
        MailApp.sendEmail({ to: "patrick@sunia.ca", subject: "ERROR WITH REMINDER TO " + pEmail, htmlBody: "" });
    }
}
