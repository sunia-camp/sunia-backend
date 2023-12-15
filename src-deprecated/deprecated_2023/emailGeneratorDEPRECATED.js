function emailGenerator() {
  // clearly I made this for some purpose but fucked if I know what it is
  // I'll keep it in case I realize eight months from now that I need it after all
  var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
  var masterRegSource = SpreadsheetApp.openById(masterRegString);
  var mailoutSource = SpreadsheetApp.openById("1PDVvdsmiCRKq5GDW75WSa0SUxPJBS0iVysDe5D_DgWI");
  var mailoutSheet = mailoutSource.getSheetByName("Sheet1");

  var mrRegs = masterRegSource.getSheetByName("Regs");
  var mrInput = masterRegSource.getSheetByName("input");
  var regData = mrRegs.getDataRange().getValues();
  var data = mrInput.getDataRange().getValues();
  var mailout = mailoutSheet.getDataRange().getValues;
  var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)
  var colDropout = regData[0].indexOf("DROPOUT");
  var colMeme = regData[0].indexOf("MEME");
  var colVerified = regData[0].indexOf("VERIFIED");
  var colPrefName = data[0].indexOf("PREFERRED NAME");
  var colLastName = data[0].indexOf("LAST NAME");
  var colAddress = data[0].indexOf("STUDENT EMAIL");
  var colCity = data[0].indexOf("PARENT EMAIL");

  /*
  var nameCol = mailout[0].indexOf("Name");
  var addressCol = mailout[0].indexOf("Address");
  var cityCol = mailout[0].indexOf("City");
  var provinceCol = mailout[0].indexOf("Province");
  var postalCol = mailout[0].indexof("Postal Code");
  */

   for (var i = 1; i < lastReg; i++) {
        if (regData[i][colDropout] == false && regData[i][colMeme] == false && regData[i][colVerified] == true) {
          var name = data[i][colPrefName] + " " + data[i][colLastName];
          var address = data[i][colAddress];
          var city = data[i][colCity];

          var rowToWriteTo = mailoutSheet.getLastRow() + 1;

          mailoutSheet.getRange(rowToWriteTo, 1).setValue(name);
          mailoutSheet.getRange(rowToWriteTo, 2).setValue(address);
          mailoutSheet.getRange(rowToWriteTo, 3).setValue(city);
          



        }
  }
  Logger.log("Done!");




}
