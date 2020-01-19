/**
 * @OnlyCurrentDoc Limits the script to only accessing the current sheet.
 */

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */

var API_URL = 'https://passninja.ngrok.io/'

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Create A Pass', functionName: 'createPass_'},
    {name: 'Update A Pass', functionName: 'updatePass_'},
        {name: 'show Modal', functionName: 'showModal_'}
  ];
  spreadsheet.addMenu('PassNinja', menuItems);
}


function updatePass_(firstName, LastName) {

  
  //*****************************
 
  var spreadsheet = SpreadsheetApp.getActive();
  var contactSheet = spreadsheet.getSheetByName('Contacts');

  // if valid, get the correct row of data.
    var rowNumber = contactSheet.getActiveCell().getRow();
  Logger.log("rowNumber:", rowNumber)

  // get the range for that row
    var rowRange = contactSheet.getRange(rowNumber, 1, 1, 12).getValues();
 
 if (!contactSheet.getRange(rowNumber,12).getValue()) {
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
  'method' : 'post',
  'contentType': 'application/json',
  'muteHttpExceptions' : true,
  // Convert the JavaScript object to a JSON string.
  'payload' : updateJson
};
  try{
  response = UrlFetchApp.fetch(API_URL + 'apple', options);
      Logger.log(response.getContentText());
  }
  catch(err) { {
   
  //  contactSheet.getRange(rowNumber, 13).setValue(data.statusCode);
    contactSheet.getRange(rowNumber, 12).setValue(data.response);
  contactSheet.getRange(rowNumber, 12).setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
contactSheet.getRange(rowNumber, 12).setBackground("#FF4500")
  }};
  
data = JSON.parse(response.getContentText());
  
  if (data.statusCode == '200') {
   
     contactSheet.getRange(rowNumber, 1, 1,12 ).setBorder(true, true, true, true, true, true, "#008000", SpreadsheetApp.BorderStyle.SOLID);


  }

 
  



return response.getContentText();
 

}

function showModal_() {
var htmlOutput = HtmlService
    .createHtmlOutput('<p>A change of speed, a change of style...</p>')
    .setWidth(250)
    .setHeight(300);
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'My add-on');

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
  
var postData =  { 
    "passType": "matthewkeil",
    "pass": {
    	"firstName": parsedName.name,
    	"lastName": parsedName.lastName + " " + parsedName.secondLastName
    }
};
  
var options = {
  'method' : 'post',
  'contentType': 'application/json',
  'muteHttpExceptions' : true,
  // Convert the JavaScript object to a JSON string.
  'payload' : JSON.stringify(postData)
};
  try{
  response = UrlFetchApp.fetch(API_URL +'passes/', options);
  }
  

  
  catch(err) { {
    Logger.log("error caught: ", err);
      data = JSON.parse(response.getContentText());
  //  contactSheet.getRange(rowNumber, 13).setValue(data.statusCode);
    contactSheet.getRange(rowNumber, 12).setValue(err);
  contactSheet.getRange(rowNumber, 12).setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
contactSheet.getRange(rowNumber, 12).setBackground("#FF4500")
  }};
  
  Logger.log("response:", response.getContentText())
    data = JSON.parse(response.getContentText());
 // if (data.statusCode == '200') {
 // contactSheet.getRange(rowNumber, 13).setValue(data.statusCode);
    contactSheet.getRange(rowNumber, 12).setValue(data.landingUrl);
    Logger.log("data.applePassUrl: ", data.landingUrl)
  // passTypeId =  data.applePassUrl.substring(data.applePassUrl.indexOf("passes/")+7,data.applePassUrl.indexof("/","passes/"+7))
    contactSheet.getRange(rowNumber, 13).setValue(data.apple.passTypeIdentifier);
       contactSheet.getRange(rowNumber, 14).setValue(data.apple.serialNumber);
    
     contactSheet.getRange(rowNumber, 12, 1,3 ).setBorder(true, true, true, true, true, true, "#008000", SpreadsheetApp.BorderStyle.SOLID);
    contactSheet.getRange(rowNumber, 12, 1,3).setBackground("#ADFF2F");
    contactSheet.getRange(rowNumber,12, 1, 3).setFontWeight("bold");
    contactSheet.getRange(rowNumber,12, 1, 3).setFontColor("#000000");

 // }
  
contactSheet.getRange
 
  
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

/**
 * A custom function that converts meters to miles.
 *
 * @param {Number} meters The distance in meters.
 * @return {Number} The distance in miles.
 
function metersToMiles(meters) {
  if (typeof meters != 'number') {
    return null;
  }
  return meters / 1000 * 0.621371;
}

/**
 * A custom function that gets the driving distance between two addresses.
 *
 * @param {String} origin The starting address.
 * @param {String} destination The ending address.
 * @return {Number} The distance in meters.
 
function drivingDistance(origin, destination) {
  var directions = getDirections_(origin, destination);
  return directions.routes[0].legs[0].distance.value;
}

/**
 * A function that adds headers and some initial data to the spreadsheet.
 
function prepareSheet_() {
  var sheet = SpreadsheetApp.getActiveSheet().setName('Settings');
  var headers = [
    'Start Address',
    'End Address',
    'Driving Distance (meters)',
    'Driving Distance (miles)'];
  var initialData = [
    '350 5th Ave, New York, NY 10118',
    '405 Lexington Ave, New York, NY 10174'];
  sheet.getRange('A1:D1').setValues([headers]).setFontWeight('bold');
  sheet.getRange('A2:B2').setValues([initialData]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 4);
}



// google template for poaching stuffs
/**
 * Creates a new sheet containing step-by-step directions between the two
 * addresses on the "Settings" sheet that the user selected.
 */





/*

function generateStepByStep_() {
  var spreadsheet = SpreadsheetApp.getActive();
  var settingsSheet = spreadsheet.getSheetByName('Settings');
  settingsSheet.activate();

  // Prompt the user for a row number.
  var selectedRow = Browser.inputBox('Generate step-by-step',
      'Please enter the row number of the addresses to use' +
      ' (for example, "2"):',
      Browser.Buttons.OK_CANCEL);
  if (selectedRow == 'cancel') {
    return;
  }
  var rowNumber = Number(selectedRow);
  if (isNaN(rowNumber) || rowNumber < 2 ||
      rowNumber > settingsSheet.getLastRow()) {
    Browser.msgBox('Error',
        Utilities.formatString('Row "%s" is not valid.', selectedRow),
        Browser.Buttons.OK);
    return;
  }

  // Retrieve the addresses in that row.
  var row = settingsSheet.getRange(rowNumber, 1, 1, 2);
  var rowValues = row.getValues();
  var origin = rowValues[0][0];
  var destination = rowValues[0][1];
  if (!origin || !destination) {
    Browser.msgBox('Error', 'Row does not contain two addresses.',
        Browser.Buttons.OK);
    return;
  }

  // Get the raw directions information.
  var directions = getDirections_(origin, destination);

  // Create a new sheet and append the steps in the directions.
  var sheetName = 'Driving Directions for Row ' + rowNumber;
  var directionsSheet = spreadsheet.getSheetByName(sheetName);
  if (directionsSheet) {
    directionsSheet.clear();
    directionsSheet.activate();
  } else {
    directionsSheet =
        spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }
  var sheetTitle = Utilities.formatString('Driving Directions from %s to %s',
      origin, destination);
  var headers = [
    [sheetTitle, '', ''],
    ['Step', 'Distance (Meters)', 'Distance (Miles)']
  ];
  var newRows = [];
  for (var i = 0; i < directions.routes[0].legs[0].steps.length; i++) {
    var step = directions.routes[0].legs[0].steps[i];
    // Remove HTML tags from the instructions.
    var instructions = step.html_instructions.replace(/<br>|<div.*?>/g, '\n')
        .replace(/<.*?>/g, '');
    newRows.push([
      instructions,
      step.distance.value
    ]);
  }
  directionsSheet.getRange(1, 1, headers.length, 3).setValues(headers);
  directionsSheet.getRange(headers.length + 1, 1, newRows.length, 2)
      .setValues(newRows);
  directionsSheet.getRange(headers.length + 1, 3, newRows.length, 1)
      .setFormulaR1C1('=METERSTOMILES(R[0]C[-1])');

  // Format the new sheet.
  directionsSheet.getRange('A1:C1').merge().setBackground('#ddddee');
  directionsSheet.getRange('A1:2').setFontWeight('bold');
  directionsSheet.setColumnWidth(1, 500);
  directionsSheet.getRange('B2:C').setVerticalAlignment('top');
  directionsSheet.getRange('C2:C').setNumberFormat('0.00');
  var stepsRange = directionsSheet.getDataRange()
      .offset(2, 0, directionsSheet.getLastRow() - 2);
  setAlternatingRowBackgroundColors_(stepsRange, '#ffffff', '#eeeeee');
  directionsSheet.setFrozenRows(2);
  SpreadsheetApp.flush();
}

/**
 * Sets the background colors for alternating rows within the range.
 * @param {Range} range The range to change the background colors of.
 * @param {string} oddColor The color to apply to odd rows (relative to the
 *     start of the range).
 * @param {string} evenColor The color to apply to even rows (relative to the
 *     start of the range).
 
 
function setAlternatingRowBackgroundColors_(range, oddColor, evenColor) {
  var backgrounds = [];
  for (var row = 1; row <= range.getNumRows(); row++) {
    var rowBackgrounds = [];
    for (var column = 1; column <= range.getNumColumns(); column++) {
      if (row % 2 == 0) {
        rowBackgrounds.push(evenColor);
      } else {
        rowBackgrounds.push(oddColor);
      }
    }
    backgrounds.push(rowBackgrounds);
  }
  range.setBackgrounds(backgrounds);
}

*/