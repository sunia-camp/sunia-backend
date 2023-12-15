function makeStaffKnowsStoods() {
  const sksForm = FormApp.create('Staff Knows Stoods (2023)');

  // pull data from MRDB
  var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
  var masterRegSource = SpreadsheetApp.openById(masterRegString);
  var mrRegs = masterRegSource.getSheetByName("Regs");
  var mrInput = masterRegSource.getSheetByName("input");
  var data = mrRegs.getDataRange().getValues();
  var lastReg = mrInput.getLastRow(); // get last row from input, because REGS has true/falses all the way down (will check every row)

  // -- Get all the column indices by finding the column names 
  // -- UPDATE 2: if you update the form, you have to update these too
  var colFirstName = data[0].indexOf("pref_name"); // looks at top row of sheet
  var colLastName = data[0].indexOf("last_name");
  var colDropout = data[0].indexOf("dropped");
  var colMeme = data[0].indexOf("ignore");
  var colWeek = data[0].indexOf("week");

  // collect valid stoods by week
  var weekA = [];
  var weekB = [];

  for (var i = 1; i < lastReg; i++) {
    if (data[i][colDropout] == false && data[i][colMeme] == false) {
      if (data[i][colWeek] == "Week A") {
        weekA.push([data[i][colFirstName].toString().concat(" ", data[i][colLastName].toString())]);
      } else if (data[i][colWeek] == "Week B") {
        weekB.push([data[i][colFirstName].toString().concat(" ", data[i][colLastName].toString())]);
      } else {
        Logger.log("Error with student " + data[i][colFirstName] + " " + data[i][colLastName]);
      }
    }
  }

  // set form settings
  sksForm.setAllowResponseEdits(true);
  sksForm.setCollectEmail(true);
  sksForm.setDescription("Hi friends! If you know stoods, here's where you say that. That's all.");
  sksForm.setTitle("Staff Knows Stoods (2023)");
  sksForm.setRequireLogin(true);

  const nameItem = sksForm.addTextItem();
  nameItem.setRequired(true);
  nameItem.setTitle("WHAT IS... your name?");

  const countryItem = sksForm.addTextItem();
  countryItem.setRequired(true);
  countryItem.setTitle("WHAT IS... your SC country/countries?");
  countryItem.setHelpText("Include it even if there aren't going to be kids in it pls!");

  const stoodListA = sksForm.addGridItem();
  stoodListA.setRequired(true);
  stoodListA.setTitle("WHAT IS... the students that you-- okay never mind I'm sick of this joke, just tick off whether or not you know each stood in Week A pls");
  stoodListA.setRows(weekA).setColumns(['Yes', 'No']);

  const stoodListB = sksForm.addGridItem();
  stoodListB.setRequired(true);
  stoodListB.setTitle("Same drill for Week B!");
  stoodListB.setRows(weekB).setColumns(['Yes', 'No']);

  const confirmItem = sksForm.addMultipleChoiceItem();
  confirmItem.setRequired(true);
  confirmItem.setTitle("I hereby agree that I will monitor the registration updates coming in between now and Seminar (in #reg) on Slack, and if there is anyone further I know that registers, I will tell my Registrar and Good Friend Patrick Harvey promptly, expeditiously and immediately. I acknowledge this to be important. All hail registrar.");
  confirmItem.setHelpText("(I stole that from Erickson lol)");
  confirmItem.setChoices([
    confirmItem.createChoice('I agree'),
    confirmItem.createChoice('I am dead')
  ]);
  confirmItem.showOtherOption(false);

  Logger.log(sksForm.getEditUrl());








}
