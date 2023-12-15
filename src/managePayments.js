// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
// Exports payment information to main database
function managePayments() {
    Logger.log("Transferring payment details...");
    // registrar@sunia.ca should be the one executing the script, so that the email sends from the current reg
    // configure this by making sure the trigger for this script is under registrar@sunia.ca
    var email = Session.getActiveUser().getEmail();
    //transferPaypal(); // deprecated
    transferCheques();
    transferEtransfer();
    transferDeferrals();
    transferAid();
    transferStripe();
    // Note that Stripe data is handled within Squarespace
    // TODO: find way of integrating Stripe data with sheets
    Logger.log("Done!");
}

// Add test comment

function transferPaypal() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var paypalSource = PropertiesService.getScriptProperties().getProperty("paypalSource");
    var paypalForm = SpreadsheetApp.openById(paypalSource);
    var paypalMain = paypalForm.getSheetByName("PAYPAL"); //Raw input, from Squarespace
    var paypalUtils = paypalForm.getSheetByName("UTILS"); //Tracks last row added to main db
    var paypalTotal = paypalMain.getLastRow();
    var paypalLast = paypalUtils.getRange(1, 2).getValue() + 1;
    var paypalLastCell = paypalUtils.getRange(1, 2);
    for (var i = paypalLast + 1; i < paypalTotal + 1; i++) {
        paypalLastCell.setValue(paypalLastCell.getValue() + 1);
        // Get and set student name
        var studentName = paypalMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        // Set payment type to "Paypal"
        inputTab.getRange(openRow, 2).setValue("Paypal");
        //Get and set student's email
        var studentEmail = paypalMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        // Get and set payer's name
        var payerName = paypalMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(payerName);
        //No miscellaneous data to add, set to n/a
        inputTab.getRange(openRow, 5).setValue("n/a");
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("Paypal"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
function transferCheques() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var chequeSource = PropertiesService.getScriptProperties().getProperty("chequeSource");
    var chequeForm = SpreadsheetApp.openById(chequeSource);
    var chequeMain = chequeForm.getSheetByName("CHEQUE");
    var chequeUtils = chequeForm.getSheetByName("UTILS");
    var chequeTotal = chequeMain.getLastRow();
    var chequeLast = chequeUtils.getRange(1, 2).getValue() + 1;
    var chequeLastCell = chequeUtils.getRange(1, 2);
    for (var i = chequeLast + 1; i < chequeTotal + 1; i++) {
        // UPDATE 2: if you update the form, update the column values here accordingly
        // TODO: update this to use column names instead of hardcoded indices
        chequeLastCell.setValue(chequeLastCell.getValue() + 1);
        var studentName = chequeMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        inputTab.getRange(openRow, 2).setValue("Cheque");
        var studentEmail = chequeMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        var payerName = chequeMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(payerName);
        inputTab.getRange(openRow, 5).setValue("Cheque follow-up needed.");
        notifyRegistrar(studentName, 'Cheque');
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("Cheque"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
            regsTab.getRange(studentRow, 28).setValue(true);
            regsTab.getRange(studentRow, 31).setValue("Cheque follow-up needed.");
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
function transferStripe() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var stripeSource = PropertiesService.getScriptProperties().getProperty("stripeSource");
    var stripeForm = SpreadsheetApp.openById(stripeSource);
    var stripeMain = stripeForm.getSheetByName("STRIPE");
    var stripeUtils = stripeForm.getSheetByName("UTILS");
    var stripeTotal = stripeMain.getLastRow();
    var stripeLast = stripeUtils.getRange(1, 2).getValue() + 1;
    var stripeLastCell = stripeUtils.getRange(1, 2);
    for (var i = stripeLast + 1; i < stripeTotal + 1; i++) {
        // UPDATE 2: if you update the form, update the column values here accordingly
        // TODO: update this to use column names instead of hardcoded indices
        stripeLastCell.setValue(stripeLastCell.getValue() + 1);
        var studentName = stripeMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        inputTab.getRange(openRow, 2).setValue("Stripe");
        var studentEmail = stripeMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        var cardholderName = stripeMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(cardholderName);
        inputTab.getRange(openRow, 5).setValue("n/a");
        notifyRegistrar(studentName, "Stripe");
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("Stripe"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
            regsTab.getRange(studentRow, 28).setValue(true);
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
function transferEtransfer() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var etransferSource = PropertiesService.getScriptProperties().getProperty("etransferSource");
    var etransferForm = SpreadsheetApp.openById(etransferSource);
    var etransferMain = etransferForm.getSheetByName("ETRANSFER");
    var etransferUtils = etransferForm.getSheetByName("UTILS");
    var etransferTotal = etransferMain.getLastRow();
    var etransferLast = etransferUtils.getRange(1, 2).getValue() + 1;
    var etransferLastCell = etransferUtils.getRange(1, 2);
    for (var i = etransferLast + 1; i < etransferTotal + 1; i++) {
        // UPDATE 2: if you update the form, update the column values here accordingly
        // TODO: update this to use column names instead of hardcoded indices
        etransferLastCell.setValue(etransferLastCell.getValue() + 1);
        var studentName = etransferMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        inputTab.getRange(openRow, 2).setValue("E-Transfer");
        var studentEmail = etransferMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        var payerName = etransferMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(payerName);
        inputTab.getRange(openRow, 5).setValue("E-Transfer follow-up needed.");
        notifyRegistrar(studentName, "E-Transfer");
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("E-Transfer"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
            regsTab.getRange(studentRow, 28).setValue(true);
            regsTab.getRange(studentRow, 31).setValue("E-transfer follow-up needed.");
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
function transferDeferrals() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var deferralSource = PropertiesService.getScriptProperties().getProperty("deferralSource");
    var deferralForm = SpreadsheetApp.openById(deferralSource);
    var deferralMain = deferralForm.getSheetByName("DEFERRAL");
    var deferralUtils = deferralForm.getSheetByName("UTILS");
    var deferralTotal = deferralMain.getLastRow();
    var deferralLast = deferralUtils.getRange(1, 2).getValue() + 1;
    var deferralLastCell = deferralUtils.getRange(1, 2);
    for (var i = deferralLast + 1; i < deferralTotal + 1; i++) {
        // UPDATE 2: if you update the form, update the column values here accordingly
        // TODO: update this to use column names instead of hardcoded indices
        deferralLastCell.setValue(deferralLastCell.getValue() + 1);
        var studentName = deferralMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        inputTab.getRange(openRow, 2).setValue("Deferral");
        var studentEmail = deferralMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        var payerName = deferralMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(payerName);
        var planOutline = deferralMain.getRange(i, 5).getValue();
        inputTab.getRange(openRow, 5).setValue(planOutline);
        notifyRegistrar(studentName, "Deferral");
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("Deferral"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
            regsTab.getRange(studentRow, 31).setValue(planOutline);
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
function transferAid() {
    var openRow = getOpenRow();
    var inputTab = getInputPayment();
    var regsTab = getMasterReg();
    var feesTab = getMasterFees();
    var aidSource = PropertiesService.getScriptProperties().getProperty("aidSource");
    var aidForm = SpreadsheetApp.openById(aidSource);
    var aidMain = aidForm.getSheetByName("AID");
    var aidUtils = aidForm.getSheetByName("UTILS");
    var aidTotal = aidMain.getLastRow();
    var aidLast = aidUtils.getRange(1, 2).getValue()+1;
    var aidLastCell = aidUtils.getRange(1, 2);
    for (var i = aidLast + 1; i < aidTotal + 1; i++) {
        // UPDATE 2: if you update the form, update the column values here accordingly
        // TODO: update this to use column names instead of hardcoded indices
        aidLastCell.setValue(aidLastCell.getValue() + 1);
        var studentName = aidMain.getRange(i, 2).getValue();
        inputTab.getRange(openRow, 1).setValue(studentName);
        inputTab.getRange(openRow, 2).setValue("Aid");
        var studentEmail = aidMain.getRange(i, 3).getValue();
        inputTab.getRange(openRow, 3).setValue(studentEmail);
        var payerName = aidMain.getRange(i, 4).getValue();
        inputTab.getRange(openRow, 4).setValue(payerName);
        var reason = aidMain.getRange(i, 6).getValue();
        inputTab.getRange(openRow, 5).setValue(reason);
        notifyRegistrar(studentName, "Aid");
        //Find the student's ID from the REGS tab, based on email, and copy it into the FEES tab
        try {
            var studentRow = regsTab.createTextFinder(studentEmail).findNext().getRow();
            regsTab.getRange(studentRow, 29).setValue("Aid"); //THIS WILL BREAK IF THE REG SHEET IS CHANGED
            regsTab.getRange(studentRow, 31).setValue(reason);
        }
        catch (error) {
            Logger.log(error + "\nThere was an error with the email-based ID system.\nStudent email likely couldn't be found.");
            var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
            var payload = {
                channel: "reg-errors",
                // -- UPDATE 3: update the @ here to the member ID for the new CTO/Reg (or both), it's in Profile -> [three dots] -> Copy member ID
                text: "<@US20FNHGB> PAYMENT ERROR\nName: ".concat(studentName)
            };
            sendToSlack(url, payload);
        }
        openRow++;
    }
}
// Get bottom row of input payment sheet (to write to)
function getOpenRow() {
    var mrPayment = getInputPayment();
    return mrPayment.getLastRow() + 1; // begin updating at last row + 1
}
// Return input payment spreadsheet
function getInputPayment() {
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    return masterRegSource.getSheetByName("input_payment");
}
function getMasterReg() {
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    return masterRegSource.getSheetByName("Regs");
}
function getMasterFees() {
    var masterRegString = PropertiesService.getScriptProperties().getProperty("masterRegSource");
    var masterRegSource = SpreadsheetApp.openById(masterRegString);
    return masterRegSource.getSheetByName("FEES");
}
function notifyRegistrar(student, paymentType) {
    var url = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var message = "*NEW PAYMENT*\nStudent: ".concat(student, "\nPayment Type: ").concat(paymentType);
    var payload = {
        channel: "#reg-payment",
        text: message
    };
    sendToSlack(url, payload);
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
