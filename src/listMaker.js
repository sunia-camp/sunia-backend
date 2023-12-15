function listMaker() {
  var students = getMasterData();
  //makeBusLists(students);
  //makeWreckLists(students);
  transferToAckLists(students);
  Logger.log("Done!");
}

function getMasterData() {
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    var mrInput = masterRegSource.getSheetByName("Input");
    var mrRegs = masterRegSource.getSheetByName("regs");
    var lastReg = mrInput.getLastRow();
    var fullData = mrInput.getDataRange().getValues();
    var regData = mrRegs.getDataRange().getValues();

    // -- Get all the column indices by finding the column names 
    // -- UPDATE 2: if you update the form, you have to update these too
    var prefCol = fullData[0].indexOf("pref_name");
    var lnCol = fullData[0].indexOf("last_name");
    var sessionCol = fullData[0].indexOf("week");
    var busCol = fullData[0].indexOf("bus");
    var stuPhoneCol = fullData[0].indexOf("student_phone");
    var hcCol= fullData[0].indexOf("health_num");
    var stuAgeCol = fullData[0].indexOf("age");
    var genderCol = fullData[0].indexOf("gender");
    var healthCol = fullData[0].indexOf("health_concerns");
    var medCol = fullData[0].indexOf("medications");
    var dietCol = fullData[0].indexOf("dietary");
    var parentPhoneCol = fullData[0].indexOf("parent_phone");
    var schoolNameCol = fullData[0].indexOf("school_name");

    var verifiedCol = regData[0].indexOf("verified");
    var dropCol = regData[0].indexOf("dropped");
    var memeCol = regData[0].indexOf("ignore");

    var studentsA = [];
    var studentsB = [];
    for (var i = 1; i < lastReg; i++) {
        if (regData[i][verifiedCol] == true && regData[i][dropCol] == false && regData[i][memeCol] == false) {
          var student = {
            prefName: fullData[i][prefCol],
            lastName: fullData[i][lnCol],
            week: fullData[i][sessionCol],
            bus: fullData[i][busCol],
            studentPhone: fullData[i][stuPhoneCol],
            hcNum:fullData[i][hcCol],
            age: fullData[i][stuAgeCol],
            gender: fullData[i][genderCol],
            healthConcerns: fullData[i][healthCol],
            medications: fullData[i][medCol],
            diet: fullData[i][dietCol],
            parentPhone: fullData[i][parentPhoneCol],
            schoolName: fullData[i][schoolNameCol],
          };
          if (student.week == "Week A") {
            studentsA.push(student);
          } else if (student.week == "Week B") {
            studentsB.push(student);
          }
        }
    }
    Logger.log(studentsA.length);
    Logger.log(studentsB.length);
    var students = [studentsA, studentsB];
    return students;
}

function makeBusLists(students) {
  var busListSource = SpreadsheetApp.openById("1pVUo5mbOjd8IELPsKorTgthd_0Sic9bP0BWFTpyojCs");
  var busA = busListSource.getSheetByName("Week A");
  var studentsA = students[0];
  var studentsB = students[1];
  
  // -- Set all the column indices (currently hardcoded)
  // -- UPDATE 2: if you update the form, you have to update these too
  // -- TODO: change these to reference col names
  var prefCol = 2;
  var lnCol = 3;
  var busCol = 4;
  var stuPhoneCol = 5;
  var parentPhoneCol = 6;

  var rowToWrite = 2;
  for (var i = 0; i < studentsA.length; i++) {
    var student = studentsA[i];

    busA.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    busA.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    busA.getRange(rowToWrite, busCol + 1).setValue(student.bus);
    busA.getRange(rowToWrite, stuPhoneCol+1).setValue(student.studentPhone);
    busA.getRange(rowToWrite, parentPhoneCol+1).setValue(student.parentPhone);

    rowToWrite = rowToWrite + 1;

  }


  var busB = busListSource.getSheetByName("Week B");

  rowToWrite = 2;
  for (var i = 0; i < studentsB.length; i++) {
    var student = studentsB[i]

    busB.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    busB.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    busB.getRange(rowToWrite, busCol + 1).setValue(student.bus);
    busB.getRange(rowToWrite, stuPhoneCol+1).setValue(student.studentPhone);
    busB.getRange(rowToWrite, parentPhoneCol+1).setValue(student.parentPhone);

    rowToWrite = rowToWrite + 1;

  }


}

function makeWreckLists(students) {
  var hikeListSource = SpreadsheetApp.openById("11ondsNuJu6OV4llqpoe00aScqTy0dCHyM6ebnm7kNUs");
  var hikeA = hikeListSource.getSheetByName("Week A");
  var studentsA = students[0];
  var studentsB = students[1];
  
  // -- Set all the column indices (currently hardcoded)
  // -- UPDATE 2: if you update the form, you have to update these too
  // -- TODO: change these to reference col names
  var prefCol = 0;
  var lnCol = 1;
  var healthCol = 2;
  var medCol = 3;
  var dietCol = 4;
  var hcCol = 5;

  var rowToWrite = 2;
  for (var i = 0; i < studentsA.length; i++) {
    var student = studentsA[i];

    hikeA.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    hikeA.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    hikeA.getRange(rowToWrite, healthCol+1).setValue(student.healthConcerns);
    hikeA.getRange(rowToWrite, medCol + 1).setValue(student.medications);
    hikeA.getRange(rowToWrite, dietCol+1).setValue(student.diet);
    hikeA.getRange(rowToWrite, hcCol+1).setValue(student.hcNum);

    rowToWrite = rowToWrite + 1;

  }


  var hikeB = hikeListSource.getSheetByName("Week B");

  rowToWrite = 2;
  for (var i = 0; i < studentsB.length; i++) {
    var student = studentsB[i]

    hikeB.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    hikeB.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    hikeB.getRange(rowToWrite, healthCol+1).setValue(student.healthConcerns);
    hikeB.getRange(rowToWrite, medCol + 1).setValue(student.medications);
    hikeB.getRange(rowToWrite, dietCol+1).setValue(student.diet);
    hikeB.getRange(rowToWrite, hcCol+1).setValue(student.hcNum);

    rowToWrite = rowToWrite + 1;

  }


}

function transferToAckLists(students) {
  var ackListSource = SpreadsheetApp.openById("1is613D1QKQTZp-NcToH2LhecQYveg2vgLytHhbSeXYA");
  var ackA = ackListSource.getSheetByName("Week A");
  var ackB = ackListSource.getSheetByName("Week B");
  var gridtacASource = SpreadsheetApp.openById("1bm4W4QObXf5aS-hFgQ06bPPLJp_KNZDjsy2LS_XMaq8");
  var gridtacBSource = SpreadsheetApp.openById("1JS-2jkfOWRKFpWZ3xvVsSbQoP65CaI_bjBQwp6QhLEY");
  var scA = gridtacASource.getSheetByName("SC");
  var cabinsA = gridtacASource.getSheetByName("Cabins");
  var semsA = gridtacASource.getSheetByName("Sems");
  var dgsA = gridtacASource.getSheetByName("DGs");
  var estafriA = gridtacASource.getSheetByName("Estafri");
  var plA = gridtacASource.getSheetByName("PL");
  var toozA = gridtacASource.getSheetByName("TOOZ");

  var scB = gridtacBSource.getSheetByName("SC");
  var cabinsB = gridtacBSource.getSheetByName("Cabins");
  var semsB = gridtacBSource.getSheetByName("Sems");
  var dgsB = gridtacBSource.getSheetByName("DGs");
  var estafriB = gridtacBSource.getSheetByName("Estafri");
  var plB = gridtacBSource.getSheetByName("PL");
  var toozB = gridtacBSource.getSheetByName("TOOZ");


  var studentsA = students[0];
  var studentsB = students[1];
  

  var prefCol = 0;
  var lnCol = 1;
  var ageCol = 2;
  var genderCol = 3;
  var schoolNameCol = 4;
  var countryCol = 5;
  var councilCol = 6;
  var estafriCol = 7;
  var plCol = 8;
  var semCol = 9;
  var dgCol = 10;
  var cabinCol = 11;
  var toozCol =  12;

  var rowToWrite = 2;
  for (var i = 0; i < studentsA.length; i++) {
    var student = studentsA[i];

    ackA.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    ackA.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    ackA.getRange(rowToWrite, ageCol+1).setValue(student.age);
    ackA.getRange(rowToWrite, genderCol + 1).setValue(student.gender);
    ackA.getRange(rowToWrite, schoolNameCol+1).setValue(student.schoolName);

    rowToWrite = rowToWrite + 1;

  }

  var rowToWrite = 2;
  for (var i = 0; i < studentsB.length; i++) {
    var student = studentsB[i];

    ackB.getRange(rowToWrite, prefCol + 1).setValue(student.prefName);
    ackB.getRange(rowToWrite, lnCol+1).setValue(student.lastName);
    ackB.getRange(rowToWrite, ageCol+1).setValue(student.age);
    ackB.getRange(rowToWrite, genderCol + 1).setValue(student.gender);
    ackB.getRange(rowToWrite, schoolNameCol+1).setValue(student.schoolName);

    rowToWrite = rowToWrite + 1;

  }

  var countries = ["China","China","China","China","United States","United States","United States","United States","United Kingdom","United Kingdom","United Kingdom","United Kingdom","Russia","Russia","Russia","Russia","France","France","France","France","Chinese Taipei","Chinese Taipei","Chinese Taipei","Chinese Taipei","Japan","Japan","Japan","Japan","UAE","UAE","UAE","UAE","Brazil","Brazil","Brazil","Brazil","Mozambique","Mozambique","Mozambique","Mozambique","Gabon","Gabon","Gabon","Gabon","Switzerland","Switzerland","Switzerland","Switzerland","Albania","Albania","Albania","Albania","Ecuador","Ecuador","Ecuador","Ecuador"];
  var councils = [1, 2, 3, 4];
  var estafri = ["Mikumi", "Ugala"];
  var pl = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"];
  var sem = ["A", "B", "C", "D","E"];
  var tooz = ["McTrout", "Crow", "Net", "An'Nemo", "Dr. Net", "Fisker"];
  var dg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var cabinCount = [0,0,0,0,0,0];
  var estafriCount = [0, 0];
  var plCount = [0,0,0,0,0,0,0,0,0,0];
  var semCount = [0,0,0,0,0];
  var toozCount = [0,0,0,0,0,0];
  var dgCount = [0,0,0,0,0,0,0,0,0,0];
  var scMap = {
    "China": 1,
    "United States": 2,
    "United Kingdom": 3,
    "Russia": 4,
    "France": 5,
    "Chinese Taipei": 6,
    "Japan": 7,
    "UAE": 8,
    "Brazil": 9,
    "Mozambique": 10,
    "Gabon": 11,
    "Switzerland": 12,
    "Albania": 13,
    "Ecuador": 14
  }


  var arrayA1 = new Array(studentsA.length);
  for (var i = 0; i < arrayA1.length; i++) {
    arrayA1[i] = i + 2;
  }
  arrayA1 = randomOrder(arrayA1);
  var arrayA2 = new Array(studentsA.length);
  for (var i = 0; i < arrayA2.length; i++) {
    arrayA2[i] = i + 2;
  }
  arrayA2 = randomOrder(arrayA2);
  var arrayA3 = new Array(studentsA.length);
  for (var i = 0; i < arrayA3.length; i++) {
    arrayA3[i] = i + 2;
  }
  arrayA3 = randomOrder(arrayA3);
  var arrayA4 = new Array(studentsA.length);
  for (var i = 0; i < arrayA4.length; i++) {
    arrayA4[i] = i + 2;
  }
  arrayA4 = randomOrder(arrayA4);
  var arrayA5 = new Array(studentsA.length);
  for (var i = 0; i < arrayA5.length; i++) {
    arrayA5[i] = i + 2;
  }
  arrayA5 = randomOrder(arrayA4)

  for (var i = 0; i < arrayA1.length; i++){
    var semNum = 0;
    ackA.getRange(arrayA1[i], countryCol + 1).setValue(countries[i]);
    ackA.getRange(arrayA1[i], councilCol + 1).setValue(councils[i % 4]);
    ackA.getRange(arrayA2[i], estafriCol + 1).setValue(estafri[i % 2]);
    ackA.getRange(arrayA3[i], plCol + 1).setValue(pl[i % 10]);
    ackA.getRange(arrayA4[i], dgCol + 1).setValue(dg[i % 10]);
    ackA.getRange(arrayA5[i], toozCol + 1).setValue(tooz[i % 6]);
    if ((i % 10) < 5) {
      ackA.getRange(arrayA4[i], semCol + 1).setValue(sem[i % 3]);
      semNum = (i % 3);
    } else if ((i % 10) >= 5) {
      ackA.getRange(arrayA4[i], semCol + 1).setValue(sem[(i % 2) + 3]);
      semNum = (i % 2) + 3
    }

    var prefName1 = ackA.getRange(arrayA1[i], prefCol + 1).getValue();
    var lastName1 = ackA.getRange(arrayA1[i], lnCol + 1).getValue();
    var name1 = prefName1 + " " + lastName1;

    var prefName2 = ackA.getRange(arrayA2[i], prefCol + 1).getValue();
    var lastName2 = ackA.getRange(arrayA2[i], lnCol + 1).getValue();
    var name2 = prefName2 + " " + lastName2;

    var prefName3 = ackA.getRange(arrayA3[i], prefCol + 1).getValue();
    var lastName3 = ackA.getRange(arrayA3[i], lnCol + 1).getValue();
    var name3 = prefName3 + " " + lastName3;

    var prefName4 = ackA.getRange(arrayA4[i], prefCol + 1).getValue();
    var lastName4 = ackA.getRange(arrayA4[i], lnCol + 1).getValue();
    var name4 = prefName4 + " " + lastName4;

    var prefName5 = ackA.getRange(arrayA5[i], prefCol + 1).getValue();
    var lastName5 = ackA.getRange(arrayA5[i], lnCol + 1).getValue();
    var name5 = prefName5 + " " + lastName5;

    scA.getRange(scMap[countries[i]] + 1, councils[i % 4] + 1).setValue(name1);
    
    cabin = parseInt(ackA.getRange(arrayA1[i], cabinCol + 1).getValue());
    if (cabin > 3) {
      cabin -= 1;
    }
    cabinsA.getRange(cabinCount[cabin - 1] + 2, cabin).setValue(name1);
    cabinCount[cabin - 1]++;

    Logger.log(semNum);
    semsA.getRange(semCount[semNum] + 2, semNum + 1).setValue(name4);
    semCount[semNum]++;

    dgsA.getRange(dgCount[i % 10] + 2, (i % 10) + 1).setValue(name4);
    dgCount[i % 10]++;

    estafriA.getRange(estafriCount[i % 2] + 2, (i % 2) + 1).setValue(name2);
    estafriCount[i % 2]++;

    plA.getRange(plCount[i % 10] + 2, (i % 10) + 1).setValue(name3);
    plCount[i % 10]++;

    toozA.getRange(toozCount[i % 6] + 2, (i % 6) + 1).setValue(name5);
    toozCount[i % 6]++;

  }

  var countries = ["China","China","China","United States","United States","United States","United Kingdom","United Kingdom","United Kingdom","Russia","Russia","Russia","France","France","France","Chinese Taipei","Chinese Taipei","Chinese Taipei","Japan","Japan","Japan","UAE","UAE","UAE","Brazil","Brazil","Brazil","Mozambique","Mozambique","Mozambique","Gabon","Gabon","Gabon","Switzerland","Switzerland","Switzerland","Albania","Albania","Albania","Ecuador","Ecuador","Ecuador"];
  var dg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var councils = [1, 2, 3];
  var cabinCount = [0,0,0,0,0,0];
  var estafriCount = [0, 0];
  var plCount = [0,0,0,0,0,0,0,0,0,0];
  var semCount = [0,0,0,0,0];
  var toozCount = [0,0,0,0,0,0];
  var dgCount = [0,0,0,0,0,0,0,0,0,0];

  var arrayB1 = new Array(studentsB.length);
  for (var i = 0; i < arrayB1.length; i++) {
    arrayB1[i] = i + 2;
  }
  arrayB1 = randomOrder(arrayB1);
  var arrayB2 = new Array(studentsB.length);
  for (var i = 0; i < arrayB2.length; i++) {
    arrayB2[i] = i + 2;
  }
  arrayB2 = randomOrder(arrayB2);
  var arrayB3 = new Array(studentsB.length);
  for (var i = 0; i < arrayB3.length; i++) {
    arrayB3[i] = i + 2;
  }
  arrayB3 = randomOrder(arrayB3);
  var arrayB4 = new Array(studentsB.length);
  for (var i = 0; i < arrayB4.length; i++) {
    arrayB4[i] = i + 2;
  }
  arrayB4 = randomOrder(arrayB4);
  var arrayB5 = new Array(studentsB.length);
  for (var i = 0; i < arrayB5.length; i++) {
    arrayB5[i] = i + 2;
  }
  arrayB5 = randomOrder(arrayB5);


for (var i = 0; i < arrayB1.length; i++){
  var semNum = 0;
    ackB.getRange(arrayB1[i], countryCol + 1).setValue(countries[i]);
    ackB.getRange(arrayB1[i], councilCol + 1).setValue(councils[i % 3]);
    ackB.getRange(arrayB2[i], estafriCol + 1).setValue(estafri[i % 2]);
    ackB.getRange(arrayB3[i], plCol + 1).setValue(pl[i % 10]);
    ackB.getRange(arrayB4[i], dgCol + 1).setValue(dg[i % 10]);
    ackB.getRange(arrayB5[i], toozCol + 1).setValue(tooz[i % 6]);
    if ((i % 10) < 5) {
      ackB.getRange(arrayB4[i], semCol + 1).setValue(sem[i % 3]);
      semNum = i % 3;
    } else if ((i % 10) >= 5) {
      ackB.getRange(arrayB4[i], semCol + 1).setValue(sem[(i % 2) + 3]);
      semNum = (i % 2) + 3;
    }

    var prefName1 = ackB.getRange(arrayB1[i], prefCol + 1).getValue();
    var lastName1 = ackB.getRange(arrayB1[i], lnCol + 1).getValue();
    var name1 = prefName1 + " " + lastName1;

    var prefName2 = ackB.getRange(arrayB2[i], prefCol + 1).getValue();
    var lastName2 = ackB.getRange(arrayB2[i], lnCol + 1).getValue();
    var name2 = prefName2 + " " + lastName2;

    var prefName3 = ackB.getRange(arrayB3[i], prefCol + 1).getValue();
    var lastName3 = ackB.getRange(arrayB3[i], lnCol + 1).getValue();
    var name3 = prefName3 + " " + lastName3;

    var prefName4 = ackB.getRange(arrayB4[i], prefCol + 1).getValue();
    var lastName4 = ackB.getRange(arrayB4[i], lnCol + 1).getValue();
    var name4 = prefName4 + " " + lastName4;

    var prefName5 = ackB.getRange(arrayB5[i], prefCol + 1).getValue();
    var lastName5 = ackB.getRange(arrayB5[i], lnCol + 1).getValue();
    var name5 = prefName5 + " " + lastName5;

    scB.getRange(scMap[countries[i]] + 1, councils[i % 3] + 1).setValue(name1);
    
    cabin = parseInt(ackB.getRange(arrayB1[i], cabinCol + 1).getValue());
    if (cabin > 3) {
      cabin -= 1;
    }
    cabinsB.getRange(cabinCount[cabin - 1] + 2, cabin).setValue(name1);
    cabinCount[cabin - 1]++;

    semsB.getRange(semCount[semNum] + 2, (semNum) + 1).setValue(name4);
    semCount[semNum]++;

    dgsB.getRange(dgCount[i % 10] + 2, (i % 10) + 1).setValue(name4);
    dgCount[i % 10]++;

    estafriB.getRange(estafriCount[i % 2] + 2, (i % 2) + 1).setValue(name2);
    estafriCount[i % 2]++;

    plB.getRange(plCount[i % 10] + 2, (i % 10) + 1).setValue(name3);
    plCount[i % 10]++;

    toozB.getRange(toozCount[i % 6] + 2, (i % 6) + 1).setValue(name5);
    toozCount[i % 6]++;

  }




}

function randomOrder(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i+1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}







