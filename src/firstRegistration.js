// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)

var exports = exports || {};
var module = module || { exports: exports };

// Main function to manage new reg (first reg form)
function newFirstRegistration() {
    Logger.log("Managing new registration...");
    // Registrar@sunia.ca should be the one executing the script, so that the email sends from the current reg
    // configure this by making sure the trigger for this script is under registrar@sunia.ca
    var email = Session.getActiveUser().getEmail();
    if (email != "registrar@sunia.ca") {
        Logger.log("The email isn't sending from registrar@sunia.ca... it's sending from " +
            email);
        return;
    }
    var registrants = getFirstData();
    transferFirstData(registrants);
    postFirstToSlack(registrants);
    sendFirstEmails(registrants);
    Logger.log("Done!");
}


// Get student data from raw input sheet
function getFirstData() {
    // This long-ass string of definitions is setup...
    // -- Open the spreadsheet that stores the raw data from Squarespace
    var rawRegString = PropertiesService.getScriptProperties().getProperty("firstRegSource");
    var rawRegSource = SpreadsheetApp.openById(rawRegString);
    // -- Open the two sheets in the rawRegSource spreadsheet - one for the data and one to track who we've already handled
    var rrData = rawRegSource.getSheetByName("Raw_Data");
    var rrNumEmailed = rawRegSource.getSheetByName("Num_Emailed");
    // -- Get the data from these two sheets
    var lastReg = rrData.getLastRow(); // row # of last row w content (indexed from *1*)
    var lastEmailed = rrNumEmailed.getRange(1, 2).getValue() + 1; // row # of  last row processed - note +1 bc Sheets indexes from 1
    var lastEmailedCell = rrNumEmailed.getRange(1, 2); // cell *containing* row # of last row processed
    var data = rrData.getDataRange().getValues(); // raw reg data in 2D array
    // -- Get all the column indices by finding the column names 
    // -- UPDATE 2: if you update the form, you have to update these too
    var dateCol = data[0].indexOf("Submitted On"); // looks at top row of sheet
    var fnCol = data[0].indexOf("First Name");
    var prefCol = data[0].indexOf("Preferred First Name");
    var lnCol = data[0].indexOf("Last Name");
    var sessionCol = data[0].indexOf("Session Choice");
    var hearCol = data[0].indexOf("How did you hear about SUNIA");
    var stuPhoneCol = data[0].indexOf("Student Phone");
    var stuEmailCol = data[0].indexOf("Student Email");
    var stuAgeCol = data[0].indexOf("Age");
    var addressCol = data[0].indexOf("Address");
    var cityCol = data[0].indexOf("City");
    var provinceCol = data[0].indexOf("ProvinceState");
    var countryCol = data[0].indexOf("Country");
    var postalCol = data[0].indexOf("Postal CodeZIP Code");
    var parentNameCol = data[0].indexOf("ParentGuardian Name");
    var parentRelCol = data[0].indexOf("ParentGuardian Relationship to Student");
    var parentEmailCol = data[0].indexOf("ParentGuardian Email");
    var parentPhoneCol = data[0].indexOf("ParentGuardian Phone");
    // -- Set up an empty array to store any new students' info
    var students = [];

    // Read info for any new students from sheet
    // -- Note that this loop won't run at all if the last row processed (lastEmailed)
    // -- is the same as the last row (lastReg) i.e. if there aren't any new regs
    for (var i = lastEmailed; i < lastReg; i++) {
        lastEmailedCell.setValue(lastEmailedCell.getValue() + 1); // we're processing a new row so increment the # processed
        // Create new student object w all the data we're transferring
        var student = {
            date: data[i][dateCol],
            firstName: data[i][fnCol],
            prefName: data[i][prefCol],
            lastName: data[i][lnCol],
            week: data[i][sessionCol],
            studentPhone: data[i][stuPhoneCol],
            studentEmail: data[i][stuEmailCol],
            age: data[i][stuAgeCol],
            address: data[i][addressCol],
            city: data[i][cityCol],
            province: data[i][provinceCol],
            country: data[i][countryCol],
            postalCode: data[i][postalCol],
            parentName: data[i][parentNameCol],
            parentRelationship: data[i][parentRelCol],
            parentEmail: data[i][parentEmailCol],
            parentPhone: data[i][parentPhoneCol],
            hearAboutUs: data[i][hearCol]
        };
        // Add the new student object to the array of students
        students.push(student);
    }
    // Once we've got an array of all the new students, return it to the main function
    return students;
}

// Transfer new regs to MRDB
function transferFirstData(studentsToTransfer) {
    // Setup
    // -- Open MRDB & get the input & Regs sheets so we can write to them
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrInput = masterRegSource.getSheetByName("input");
    var mrRegs = masterRegSource.getSheetByName("Regs");
    // -- Also get the existing data in the input sheet so we can get column indices
    var data = mrInput.getDataRange().getValues(); // raw reg data in 2D array
    // -- Get all the column indices by finding the column names
    // -- UPDATE 2: if you update the MRDB, you have to update these too
    var dateCol = data[0].indexOf("date_reg"); // looks at top row of sheet
    var fnCol = data[0].indexOf("first_name");
    var prefCol = data[0].indexOf("pref_name");
    var lnCol = data[0].indexOf("last_name");
    var sessionCol = data[0].indexOf("week");
    var hearCol = data[0].indexOf("via");
    var stuPhoneCol = data[0].indexOf("student_phone");
    var stuEmailCol = data[0].indexOf("student_email");
    var stuAgeCol = data[0].indexOf("age");
    var addressCol = data[0].indexOf("address");
    var cityCol = data[0].indexOf("city");
    var provinceCol = data[0].indexOf("prov");
    var countryCol = data[0].indexOf("country");
    var postalCol = data[0].indexOf("postal");
    var parentNameCol = data[0].indexOf("parent_name");
    var parentRelCol = data[0].indexOf("parent_rel");
    var parentEmailCol = data[0].indexOf("parent_email");
    var parentPhoneCol = data[0].indexOf("parent_phone");

    // Write new regs to MRDB
    // -- Like w the read function if there are no students to transfer this loop won't run at all
    // -- bc the length will be 0
    for (var i = 0; i < studentsToTransfer.length; i++) {
        var studentToTransfer = studentsToTransfer[i]; // current student from the array
        var rowToWriteTo = mrInput.getLastRow() + 1; // first empty row

        // Every column needs a "+1" because Sheets indexes from 1 but the array is from 0 bc it's sensible

        // This exists bc of my dumbass idea to have like... an ID # for every stood, I was trying to find a
        // way to make the two-part reg form work but it was a dumbass idea I just never had time to remove it
        // bc I'd have to rework the MRDB again to take out the fuckin column for it - highly recommend removing
        // if you have time
        mrRegs.getRange(rowToWriteTo, 1).setValue(rowToWriteTo - 1); 

        // Student basics
        mrInput.getRange(rowToWriteTo, dateCol + 1).setValue(studentToTransfer.date);
        mrInput.getRange(rowToWriteTo, fnCol + 1).setValue(studentToTransfer.firstName);
        mrInput.getRange(rowToWriteTo, prefCol + 1).setValue(studentToTransfer.prefName);
        mrInput.getRange(rowToWriteTo, lnCol + 1).setValue(studentToTransfer.lastName);
        // SUNIA logistics
        mrInput.getRange(rowToWriteTo, sessionCol + 1).setValue(studentToTransfer.week);
        mrInput.getRange(rowToWriteTo, hearCol + 1).setValue(studentToTransfer.hearAboutUs);
        // More student information
        mrInput.getRange(rowToWriteTo, stuPhoneCol + 1).setValue(studentToTransfer.studentPhone);
        mrInput.getRange(rowToWriteTo, stuEmailCol + 1).setValue(studentToTransfer.studentEmail);
        mrInput.getRange(rowToWriteTo, stuAgeCol + 1).setValue(studentToTransfer.age);
        // Location
        mrInput.getRange(rowToWriteTo, addressCol + 1).setValue(studentToTransfer.address);
        mrInput.getRange(rowToWriteTo, cityCol + 1).setValue(studentToTransfer.city);
        mrInput.getRange(rowToWriteTo, provinceCol + 1).setValue(studentToTransfer.province);
        mrInput.getRange(rowToWriteTo, countryCol + 1).setValue(studentToTransfer.country);
        mrInput.getRange(rowToWriteTo, postalCol + 1).setValue(studentToTransfer.postalCode);
        // Parent information
        mrInput.getRange(rowToWriteTo, parentNameCol + 1).setValue(studentToTransfer.parentName);
        mrInput.getRange(rowToWriteTo, parentRelCol + 1).setValue(studentToTransfer.parentRelationship);
        mrInput.getRange(rowToWriteTo, parentEmailCol + 1).setValue(studentToTransfer.parentEmail);
        mrInput.getRange(rowToWriteTo, parentPhoneCol + 1).setValue(studentToTransfer.parentPhone);
    }
}

// Post info on new regs to Slack so staff can be hyped
// (see handover for more info on the Slack bot, currently GLaDOS bc I'm a nerd)
function postFirstToSlack(registrants) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    // Send a message for each new reg
    for (var i = 0; i < registrants.length; i++) {
        // Get new reg info, generate a message from it, & assemble a payload w the message & channel
        var registrant = registrants[i];
        var message = generateFirstSlackFormatting(registrant);
        var regPayload = {
            channel: "#reg",
            text: message
        };

        // Try sending the slack message, if it doesn't work throw an error
        // -- Tbh this is kinda dumb given that we catch an error just to throw 
        // -- a new *less specific* one lol - you could use the try-catch to
        // -- notify you like the more important errors do or just ditch it tbh
        try {
            sendToSlack(url, regPayload);
        }
        catch (error) {
            throw new Error("There was an issue sending the update to Slack");
        }
    }
}

// Generates Slack formatting for a registrant
function generateFirstSlackFormatting(individual) {
    weeks = countWeeks(); // array w # of regs in Week A and Week B respectively
    // Return a string with the reg's name, country, how they heard about sunia, the current regs in each week, and a random GLaDOS quote
    // -- The exact info in this has varied a ton over the years, feel free to discuss w admin staff & adjust (if nothing else you should
    // -- probably add a thing for what week they're in lol, rn you have to sort of work it out from the week counts)
    return "\n*Another registrant has arrived.*\n\nName: ".concat(individual.prefName, " ").concat(individual.lastName, "\nCountry: ").concat(individual.country, "\nHow did you hear about SUNIA? ").concat(individual.hearAboutUs, "\n\nWeek A:").concat(weeks[0], "\nWeek B:").concat(weeks[1], "\n\n_").concat(generateRandomGladosQuote(), "_\n\nGLaDOS\n");
}

// Slack boilerplate to send messages
function sendToSlack(url, payload) {
    // This basically just defines and then makes an HTTP request (see handover on Slack webhook)
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
    };
    UrlFetchApp.fetch(url, options);
}

// Count the current regs in each week
function countWeeks() {
    // Open MRDB so we can count regs
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrRegs = masterRegSource.getSheetByName("Regs");
    var mrInput = masterRegSource.getSheetByName("input");
    var data = mrRegs.getDataRange().getValues();
    var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)
    // Get indices for week column & the dropped/ignore columns
    var colWeeks = data[0].indexOf("week"); 
    var colDropout = data[0].indexOf("dropped");
    var colIgnore = data[0].indexOf("ignore");
    // Initialize array w zeros to count regs in each week
    var regs = [0, 0];

    // Run through regs, make sure they're not dropouts or ignores and then increment the appropriate count by 1
    for (var i = 1; i < lastReg; i++) {
        if (data[i][colDropout] == false && data[i][colIgnore] == false) {
            if (data[i][colWeeks] == "Week A") {
                regs[0] = regs[0] + 1;
            } else if (data[i][colWeeks] == "Week B") {
                regs[1] = regs[1] + 1;
            }
        }
    }
    return regs;
}

// Send confirmation emails
// TODO: at some point we switched to only emailing a confirmation to parents for the second form but I don't
//       remember *why* - might be worth reenabling that but idk we might have had a good reason (maybe something
//       about privacy or something? Like if they entered a pref name that they didn't want their parents to know?
//       Truly do not recall lol but if you/reg/admin staff can't think of any reason not to I'd say reenable)
function sendFirstEmails(registrants) {
    for (var i = 0; i < registrants.length; i++) {
        var registrant = registrants[i];
        var sEmail = registrant.studentEmail;
        sendStudentFirstEmail(sEmail, registrant);
    }
}

/*
// Send confirmation email to parent (see note on sendFirstEmails() about reenabling)
function sendParentEmail(pEmail: string, registrant: student) {
  // Data Validation
  if (pEmail == "") {
    // If the email is empty, just print a message & return to sendFirstEmails()
    Logger.log("Parent email was empty for some reason... strange");
    notifyError("Parent email blank for " + registrant.firstName + " " + registrant.lastName);
    return;
  } else if (pEmail == "patrick@sunia.ca") { // put your email here when testing to avoid spam
    // If the email is *yours* (i.e. if you're testing shit), print a message & return without sending email
    // -- This lets you test the form without spamming yourself with a billion identical fucking emails
    // -- But like... also test the emails too lol
    Logger.log("Parent email works but wasn't sent to save your fuckin inbox");
    return;
  } else {
    // Try sending the parent email, if it errors print a message & also send an alert on Slack
    try {
      let parentName: string = registrant.parentName; // parent name from form
      let pTemplate = HtmlService.createTemplateFromFile("html/intro-parents");

      pTemplate.parentName = parentName; // populate the template w parent & stood names
      pTemplate.registrant = registrant;

      var phtmlBody = pTemplate.evaluate().getContent(); // evaluate the template to get the final email body in HTML

      // Send email to parent
      MailApp.sendEmail({
        to: pEmail,
        subject: "SUNIA 2024: Next Steps in Your Child's Registration!",
        htmlBody: phtmlBody,
      });

      Logger.log(parentName + " was contacted!");
    } catch (error) {
      // if something fucks up and the email throws an error, log it and also notify you on Slack so you can do something about it
      Logger.log(
        error + "\nError with parent email, email likely not send as a result"
      );
      notifyError('Error sending parent email to ' + pEmail + ' for student ' + registrant.firstName + " " + registrant.lastName);
    }
  }
}
*/

// Send confirmation email to student
function sendStudentFirstEmail(sEmail, registrant) {
    // Data validation
    if (sEmail == "") {
        // If the email is empty, just print a message & return to sendFirstEmails()
        Logger.log("Student email was blank for reason... strange");
        notifyError("Student email blank for " + registrant.prefName + " " + registrant.lastName);
        return;
    }
    else if (sEmail == "pshspammail@gmail.com") { // put your email here when testing to avoid spam
        // If the email is *yours* (i.e. if you're testing shit), print a message & return without sending email
        // -- This lets you test the form without spamming yourself with a billion identical fucking emails
        // -- But like... also test the emails too lol
        Logger.log("Student email works but wasn't sent to save your fuckin inbox");
        return;
    }
    else {
        // Try sending the student email, if it errors print a message & also send an alert on Slack
        try {
            var studentName = registrant.prefName; // student pref name from form
            var sTemplate = HtmlService.createTemplateFromFile("html/first-email-student");

            sTemplate.studentName = studentName; // populate form w student name (in salutation) & all reg info (in verification section)
            sTemplate.registrant = registrant;

            var shtmlBody = sTemplate.evaluate().getContent(); // evaluate the template to get the final email body in HTML

            //send mail to student
            MailApp.sendEmail({
                to: sEmail,
                subject: "SUNIA 2023: Next Steps in Your Registration!",
                htmlBody: shtmlBody
            });
            Logger.log(studentName + " was contacted!");
        }
        catch (error) {
            // if something fucks up and the email throws an error, log it and also notify you on Slack so you can do something about it
            Logger.log(error + "\nError with student email, email likely not send as a result");
            notifyError("Error sending student email to " + sEmail + " for student " + registrant.prefName + " " + registrant.lastName);
        }
    }
}

// This just selects a random GLaDOS quote to append to messages from the Slack bot lol you do not have to keep using this
// -- If you want to change the Slack bot to be not GLaDOS see the Slack Bot/Webhooks section of the handover
function generateRandomGladosQuote() {
    var GladosQuotes = ["We've both said a lot of things that you're going to regret.",
        "I'm going to kill you. And all the cake is gone.",
        "Despite your violent behaviour, all you've managed to break so far is my heart.",
        "Killing you and giving you good advice aren't mutually exclusive.",
        "Here come the test results: You are a horrible person.",
        "Science has now validated your birth mother's decision to leave you on a doorstep."];
    return GladosQuotes[Math.floor(Math.random() * GladosQuotes.length)];
}

// This sends a Slack message to the #reg-errors channel to notify you of an error
function notifyError(error) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    // Generate the message text, including a ping
    // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID    
    var errorMessage = '<@U04HY8NFDRP> ERROR: ' + error;
    var testPayload = {
        channel: "#reg-errors",
        text: errorMessage
    };
    sendToSlack(url, testPayload);
}
