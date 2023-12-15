function mailoutGenerator() {
  var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
  var masterRegSource = SpreadsheetApp.openById(masterRegString);
  var mailoutSource = SpreadsheetApp.openById("1AjxkXhGi14H2o1DpAFKxDHh_jlOlkZbpnft1-FSeW1U");
  var mailoutSheet = mailoutSource.getSheetByName("Sheet1");

  var mrRegs = masterRegSource.getSheetByName("Regs");
  var mrInput = masterRegSource.getSheetByName("input");
  var regData = mrRegs.getDataRange().getValues();
  var data = mrInput.getDataRange().getValues();
  var mailout = mailoutSheet.getDataRange().getValues;
  var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)

  // -- Get all the column indices by finding the column names 
  // -- UPDATE 2: if you update the form, you have to update these too
  var colDropout = regData[0].indexOf("dropped");
  var colMeme = regData[0].indexOf("ignore");
  var colVerified = regData[0].indexOf("verified");
  var colPrefName = data[0].indexOf("pref_name");
  var colLastName = data[0].indexOf("last_name");
  var colAddress = data[0].indexOf("address");
  var colCity = data[0].indexOf("city");
  var colProvince = data[0].indexOf("prov");
  var colPostal = data[0].indexOf("postal");
  var colWeek = data[0].indexOf("week");

   for (var i = 1; i < lastReg; i++) {
        if (regData[i][colDropout] == false && regData[i][colMeme] == false && regData[i][colVerified] == true) {
          var name = data[i][colPrefName] + " " + data[i][colLastName];
          var address = data[i][colAddress];
          var city = data[i][colCity];
          var province = data[i][colProvince];
          var postal = data[i][colPostal];
          var week = data[i][colWeek];

          var rowToWriteTo = mailoutSheet.getLastRow() + 1;

          mailoutSheet.getRange(rowToWriteTo, 1).setValue(name);
          mailoutSheet.getRange(rowToWriteTo, 2).setValue(address);
          mailoutSheet.getRange(rowToWriteTo, 3).setValue(city);
          mailoutSheet.getRange(rowToWriteTo, 4).setValue(province);
          mailoutSheet.getRange(rowToWriteTo, 5).setValue(postal);
          mailoutSheet.getRange(rowToWriteTo, 6).setValue(week);
          



        }
  }
  Logger.log("Done!");




}
