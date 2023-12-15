function myFunction() {
  var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
  var masterRegSource = SpreadsheetApp.openById(masterRegString);
  var mrRegs = masterRegSource.getSheetByName("Regs");
  var mrInput = masterRegSource.getSheetByName("input");
  var data = mrRegs.getDataRange().getValues();
  var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)
  var colDropout = data[0].indexOf("dropped");
  var colMeme = data[0].indexOf("ignore");
  var colVerified = data[0].indexOf("verified");
  var colWeek = data[0].indexOf("week");
  var numA = 0;
  var numB = 0;
  
  for (var i = 1; i < lastReg; i++) {
    if (data[i][colDropout] == false && data[i][colMeme] == false && data[i][colVerified] == true) {
      if (data[i][colWeek] == "Week A") {
        numA++;
      } else if (data[i][colWeek] == "Week B") {
        numB++;
      }
    }

  }
  Logger.log("A: " + numA +"\n");
  Logger.log("B: " + numB + "\n");
}
