function getRecipients() {
  Logger.log("Sending Mass Email...");
  
  var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
  var masterRegSource = SpreadsheetApp.openById(masterRegString);
  var mrRegs = masterRegSource.getSheetByName("Regs");
  var mrInput = masterRegSource.getSheetByName("input");
  var data = mrRegs.getDataRange().getValues();
  var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)

  // -- Get all the column indices by finding the column names 
    // -- UPDATE 2: if you update the form, you have to update these too
  var colPayment = data[0].indexOf("payment_type_complete"); // looks at top row of sheet
  var colAge = data[0].indexOf("age");
  var colWaivers = data[0].indexOf("waivers_complete"); // looks at top row of sheet
  var colParentEmail = data[0].indexOf("parent_email"); // looks at top row of sheet
  //var colInfopack = data[0].indexOf("infopack_sent"); // looks at top row of sheet
  var colHCNum = data[0].indexOf("health_num");
  var colStudentEmail = data[0].indexOf("student_email");
  var colDropout = data[0].indexOf("dropped");
  var colMeme = data[0].indexOf("ignore");
  var colVerified = data[0].indexOf("verified");
  var colWeek = data[0].indexOf("week");
  if (colPayment == -1 || colWaivers == -1 || colParentEmail == -1 || colHCNum == -1 || colStudentEmail == -1) {
        Logger.log("A column name was not found, exiting script as a result");
        return;
  }

  var emailsSent = 0;
  var stoodsContacted = 0;
  for (var i = 1; i < lastReg; i++) {
        if (data[i][colDropout] == false && data[i][colMeme] == false) {
          var week = data[i][colWeek];
            if (data[i][colParentEmail] == "" || (data[i][colParentEmail] == data[i][colStudentEmail])) {
              if (data[i][colStudentEmail] == "") {
                continue;
              } else {
                sendMassEmail(data[i][colStudentEmail], week);
                //mrRegs.getRange(i+1, colInfopack+1).setValue("TRUE");
                Logger.log("Sent to " + data[i][colStudentEmail] + " - no parent available")
                emailsSent = emailsSent + 1;
                stoodsContacted = stoodsContacted + 1;
              }
            } else {
              sendMassEmail(data[i][colStudentEmail], week);
              sendMassEmail(data[i][colParentEmail], week);
              //mrRegs.getRange(i+1, colInfopack+1).setValue("TRUE");
              Logger.log("Sent to " + data[i][colStudentEmail])
              Logger.log("Sent to " + data[i][colParentEmail])
              emailsSent = emailsSent + 2;
              stoodsContacted = stoodsContacted + 1
            }
        }
  }
  Logger.log("Done! Sent " + emailsSent + " emails to " + stoodsContacted + " students");
}

function sendMassEmail(pEmail, week) {
  try {
    //if (week == "Week A") {
    var pTemplate = HtmlService.createTemplateFromFile("tourguide");
    //} else if (week == "Week B") {
    //  var pTemplate = HtmlService.createTemplateFromFile("html/image-sale")
    //  return;
    //} else {
    //  Logger.log("Invalid week for " + pEmail + "\n");
    //  return;
    //}

    var tourguideFile = DriveApp.getFileById("1MprVfelPZ23Bq0e3h3pRa3IkV_iMCz8h");

    var htmlEmailBody = pTemplate.evaluate().getContent();

    MailApp.sendEmail({
      to: pEmail,
      subject: "Your Tour Guide to SUNIA",
      htmlBody: htmlEmailBody,
      attachments: [tourguideFile.getAs(MimeType.PDF)],
    })
    Logger.log(pEmail + " was contacted with the Tourguide");
  }
  catch {
    Logger.log("Attempted to send Tourguide Email to " + pEmail + " but there was an error");
  }
}








