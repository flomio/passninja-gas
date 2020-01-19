var API_URL = 'https://api.passninja.com/callback/'


function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    { name: 'Create A Pass', functionName: 'createPass_' },
    { name: 'Update A Pass', functionName: 'updatePass_' },
    { name: 'Show Events', functionName: 'showEvents_' }
  ];
  spreadsheet.addMenu('PassNinja', menuItems);
}

function updatePass_(firstName, LastName) {

  var spreadsheet = SpreadsheetApp.getActive();
  var contactSheet = spreadsheet.getSheetByName('Contacts');

  // if valid, get the correct row of data.
  var rowNumber = contactSheet.getActiveCell().getRow();
  Logger.log("rowNumber:", rowNumber)

  // get the range for that row
  var rowRange = contactSheet.getRange(rowNumber, 1, 1, 12).getValues();

  if (!contactSheet.getRange(rowNumber, 12).getValue()) {
    Browser.msgBox("First Create a pass, then update.");
    return;
  }
  // Build the object to use in MailApp
  var name = rowRange[0][0];
  var phone = rowRange[0][1];
  var code = rowRange[0][10];

  // Prompt the user for json.
  var updateJson = Browser.inputBox('Update A Pass',
    'Please paste the json for your update.',
    Browser.Buttons.OK_CANCEL);
  if (updateJson == 'cancel') {
    return;
  }
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'muteHttpExceptions': true,
    // Convert the JavaScript object to a JSON string.
    'payload': updateJson
  };
  try {
    response = UrlFetchApp.fetch(API_URL + 'apple', options);
    Logger.log(response.getContentText());
  }
  catch (err) {
    {
      //  contactSheet.getRange(rowNumber, 13).setValue(data.statusCode);
      contactSheet.getRange(rowNumber, 12).setValue(data.response);
      contactSheet.getRange(rowNumber, 12).setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
      contactSheet.getRange(rowNumber, 12).setBackground("#FF4500")
    }
  };

  data = JSON.parse(response.getContentText());

  if (data.statusCode == '200') {
    contactSheet.getRange(rowNumber, 1, 1, 12).setBorder(true, true, true, true, true, true, "#008000", SpreadsheetApp.BorderStyle.SOLID);
  }
  return response.getContentText();
}

function showEvents_() {
    var spreadsheet = SpreadsheetApp.getActive();
    var contactSheet = spreadsheet.getSheetByName('Contacts');
    var selectedRow = contactSheet.getActiveCell().getRow();
  var rowNumber = Number(selectedRow);
   var row = contactSheet.getRange(rowNumber, 1, 1, 12);
  var rowValues = row.getValues()
    var serialNumber = rowRange[0][12];
  var html = '<p>' + serialNumber   + '<p>'
  var htmlOutput = HtmlService
    .createHtmlOutput(html)
    .setWidth(550)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Pass Events');

}
function createPass_() {

  var spreadsheet = SpreadsheetApp.getActive();
  var contactSheet = spreadsheet.getSheetByName('Contacts');

  // if valid, get the correct row of data.
  var selectedRow = contactSheet.getActiveCell().getRow();
  var rowNumber = Number(selectedRow);
  if (isNaN(rowNumber) || rowNumber < 2 ||
    rowNumber > contactSheet.getLastRow()) {
    Browser.msgBox('Error',
      Utilities.formatString('Row "%s" is not valid.', selectedRow),
      Browser.Buttons.OK);
    return;
  }

  // Retrieve the addresses in that row.
  var row = contactSheet.getRange(rowNumber, 1, 1, 11);
  var rowValues = row.getValues();
  var fullName = rowValues[0][0];
  var code = rowValues[0][10];
  if (!fullName /*|| !code*/) {
    Browser.msgBox('Error', 'Row does not contain contact name or code.',
      Browser.Buttons.OK);
    return;
  }

  /* var postData =  { 
    "passJson":{ 
       "passTypeIdentifier":"pass.com.passninja.matthewkeil",
      "serialNumber": code,
       "webServiceURL":"https://api.passninja.com/v1/",
       "authenticationToken":"1234567890123456"
    }
 };*/

  var parsedName = parseName(fullName);

  var postData = {
    "passType": "matthewkeil",
    "pass": {
      "firstName": parsedName.name,
      "lastName": parsedName.lastName + " " + parsedName.secondLastName
    }
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'muteHttpExceptions': true,
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(postData)
  };
  try {
    response = UrlFetchApp.fetch(API_URL + 'passes/', options);
  }

  catch (err) {
    {
      Logger.log("error caught: ", err);
      data = JSON.parse(response.getContentText());
      //  contactSheet.getRange(rowNumber, 13).setValue(data.statusCode);
      contactSheet.getRange(rowNumber, 12).setValue(err);
      contactSheet.getRange(rowNumber, 12).setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
      contactSheet.getRange(rowNumber, 12).setBackground("#FF4500")
    }
  };

  Logger.log("response:", response.getContentText())
  data = JSON.parse(response.getContentText());
  contactSheet.getRange(rowNumber, 12).setValue(data.landingUrl);
  Logger.log("data.applePassUrl: ", data.landingUrl)
  // passTypeId =  data.applePassUrl.substring(data.applePassUrl.indexOf("passes/")+7,data.applePassUrl.indexof("/","passes/"+7))
  contactSheet.getRange(rowNumber, 13).setValue(data.apple.passTypeIdentifier);
  contactSheet.getRange(rowNumber, 14).setValue(data.apple.serialNumber);

  contactSheet.getRange(rowNumber, 12, 1, 3).setBorder(true, true, true, true, true, true, "#008000", SpreadsheetApp.BorderStyle.SOLID);
  contactSheet.getRange(rowNumber, 12, 1, 3).setBackground("#ADFF2F");
  contactSheet.getRange(rowNumber, 12, 1, 3).setFontWeight("bold");
  contactSheet.getRange(rowNumber, 12, 1, 3).setFontColor("#000000");

  Logger.log(response.getContentText());
  return response.getContentText();
}

function parseName(input) {
  var fullName = input || "";
  var result = {};

  if (fullName.length > 0) {
    var nameTokens = fullName.match(/[A-ZÁ-ÚÑÜ][a-zá-úñü]+|([aeodlsz]+\s+)+[A-ZÁ-ÚÑÜ][a-zá-úñü]+/g) || [];

    if (nameTokens.length > 3) {
      result.name = nameTokens.slice(0, 2).join(' ');
    } else {
      result.name = nameTokens.slice(0, 1).join(' ');
    }

    if (nameTokens.length > 2) {
      result.lastName = nameTokens.slice(-2, -1).join(' ');
      result.secondLastName = nameTokens.slice(-1).join(' ');
    } else {
      result.lastName = nameTokens.slice(-1).join(' ');
      result.secondLastName = "";
    }
  }

  return result;
};
