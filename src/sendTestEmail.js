function sendTestEmail() {
  try {
    var pTemplate = HtmlService.createTemplateFromFile("tourguide");

    var tourguideFile = DriveApp.getFileById("1MprVfelPZ23Bq0e3h3pRa3IkV_iMCz8h");

    var htmlEmailBody = pTemplate.evaluate().getContent();

    MailApp.sendEmail({
      to: "patrick@sunia.ca",
      subject: "Your Tour Guide to SUNIA",
      htmlBody: htmlEmailBody,
      attachments: [tourguideFile.getAs(MimeType.PDF)],
    })
    Logger.log("sent!");
  }
  catch {
    Logger.log("Attempted to send email but there was an error");
  }
}
