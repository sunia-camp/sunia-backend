// Compiled using sunia-backend 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
function promoPoints() {
    Logger.log("Sending promo point update...");
    var promoPointsSource = PropertiesService.getScriptProperties().getProperty("promoPointsSource");
    var promoPointsSheet = SpreadsheetApp.openById(promoPointsSource);
    var totalSheet = promoPointsSheet.getSheetByName("TOTALS");
    var totalStaff = totalSheet.getLastRow();
    var xOffset = 2;
    var yOffset = 3;
    var message = "Promo Point Standings for the Week of " + new Date() + "\n";
    for (var i = yOffset; i < totalStaff; i++) {
        var name = totalSheet.getRange(i, xOffset).getValue();
        var points = totalSheet.getRange(i, xOffset + 1).getValue();
        message += name + ": " + points + "\n";
    }
    try {
        sendPointsMessage(message);
    }
    catch (error) {
        Logger.log(error + "\nexiting the function as a result");
        return;
    }
    Logger.log("Done!");
}
// Send the point message to Slack by grabbing web hook URL and creating payloads
function sendPointsMessage(message) {
    var slackWebhook = PropertiesService.getScriptProperties().getProperty("slackTestingWebhook");
    var testingPayload = {
        channel: "#testing",
        text: message
    };
    var promoPayload = {
        channel: "#promo",
        text: message
    };
    sendToSlack(slackWebhook, testingPayload);
    // sendToSlack(slackWebhook, promoPayload);
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
