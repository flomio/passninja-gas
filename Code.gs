var API_URL = 'https://api.passninja.com/v1/'

//var API_URL = 'https://passninja.ngrok.io/'

/** Adds the PassNinja script set as a menu item on load.
 */
function onOpen() {
    var spreadsheet = SpreadsheetApp.getActive();
    var menuItems = [
        { name: 'Create A Pass', functionName: 'createPass_' },
        { name: 'Update A Pass', functionName: 'updatePass_' },
        { name: 'Show Events', functionName: 'showEvents_' }
    ];
    spreadsheet.addMenu('PassNinja', menuItems);
}

/** Inputs a new user's data from a form submit event and triggers a pass creation.
 * @param {object} e The form event to read from
 * @returns {string} "Lock Timeout" if the contact sheet queries cause a timeout
 */
function onboardNewPassholderFromForm(e) {
    var data = e.namedValues
    Logger.log(data);

    var spreadsheet = SpreadsheetApp.getActive();
    var contactSheet = spreadsheet.getSheetByName('Contacts');
    var lock = LockService.getPublicLock();
    if (lock.tryLock(10000)) {
        var newRow = contactSheet.getLastRow() + 1;
        contactSheet.getRange(newRow, 1).setValue(e.namedValues['First and Last Name'][0]);
        contactSheet.getRange(newRow, 2).setValue(e.namedValues['Birthday'][0]);
        contactSheet.getRange(newRow, 3).setValue(e.namedValues['Email Address'][0]);
        contactSheet.getRange(newRow, 4).setValue(e.namedValues['Phone'][0]);
        contactSheet.getRange(newRow, 5).setValue(e.namedValues['carrier'][0]);
        contactSheet.getRange(newRow, 6).setValue(e.namedValues['city'][0]);
        contactSheet.getRange(newRow, 7).setValue(e.namedValues['state'][0]);
        contactSheet.getRange(newRow, 8).setValue(e.namedValues['referral_code'][0]);
        contactSheet.getRange(newRow, 9).setValue(e.namedValues['date_created'][0]);
        contactSheet.getRange(newRow, 10).setValue(e.namedValues['s'][0]);
        contactSheet.getRange(newRow, 11).setValue(e.namedValues['code'][0]);
        lock.releaseLock();
        contactSheet.setActiveRange(contactSheet.getRange(newRow, 1));

    } else {
        return "Lock Timeout";
    }

    createPass_();

}

/** Updates a given pass from the highlighted row with the new values in the row
 *  Pops up a dialog input box where the user can input new json data to overwrite the existing pass
 * @returns {string} The response from the PassNinja API.
 */
function updatePass_() {

    var spreadsheet = SpreadsheetApp.getActive();
    var contactSheet = spreadsheet.getSheetByName('Contacts');

    // if valid, get the correct row of data.
    var rowNumber = contactSheet.getActiveCell().getRow();
    Logger.log("rowNumber:", rowNumber)

    // get the range for that row
    var rowRangeValues = contactSheet.getRange(rowNumber, 1, 1, 12).getValues();

    if (!contactSheet.getRange(rowNumber, 12).getValue()) {
        Browser.msgBox("First Create a pass, then update.");
        return;
    }
    // Build the object to use in MailApp
    var name = rowRangeValues[0][0];
    var phone = rowRangeValues[0][1];
    var code = rowRangeValues[0][10];

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
        'payload': updateJson
    };
    try {
        response = UrlFetchApp.fetch(API_URL + 'apple', options);
        Logger.log(response.getContentText());
    } catch (err) {
        range = contactSheet.getRange(rowNumber, 12)
        highlightCells(range, 'error', data.response)
    };

    data = JSON.parse(response.getContentText());

    if (data.statusCode == '200') {
        highlightCells(contactSheet.getRange(rowNumber, 1, 1, 12), 'ok')
    }
    return response.getContentText();
}

/** Pops up a modal with the pass events of the current highlighted row
 * related to the pass via serial number
 */
function showEvents_() {
    var contactSheet = getSheet('Contacts')
    var rowNumber = getValidSheetSelectedRow(contactSheet)
    var row = contactSheet.getRange(rowNumber, 1, 1, 12);
    var rowValues = row.getValues()
    var serialNumber = rowRange[0][12];
    var html = '<p>' + serialNumber + '<p>'
    var htmlOutput = HtmlService
        .createHtmlOutput(html)
        .setWidth(550)
        .setHeight(300);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Pass Events');
}

/** Creates a PassNinja pass from the selected row.
 * @returns {string} The response from the PassNinja API.
 */
function createPass_() {
    var contactSheet = getSheet('Contacts')
    var rowNumber = getValidSheetSelectedRow(contactSheet)
    var passTypeId = spreadsheet.getRangeByName("passTypeId").getValue();
    Logger.log("passTypeID: ", passTypeId);

    // Retrieve the addresses in that row.
    var row = contactSheet.getRange(rowNumber, 1, 1, 11);
    var rowValues = row.getValues();
    var fullName = rowValues[0][0];
    if (!fullName) {
        Browser.msgBox('Error', 'Row does not contain contact name or code.',
            Browser.Buttons.OK);
        return;
    }

    var parsedName = parseName(fullName);

    var postData = {
        "passType": passTypeId,
        "pass": {
            "firstName": parsedName.name,
            "lastName": parsedName.lastName + " " + parsedName.secondLastName,
            "issuerName": "required",
            "hexBackground": "#571616"
        }
    };

    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(postData)
    };

    try {
        response = UrlFetchApp.fetch(API_URL + 'passes/', options);
    } catch (err) {
        highlightCells(contactSheet.getRange(rowNumber, 12), 'error', err)
    };

    Logger.log("response:", response.getContentText())
    data = JSON.parse(response.getContentText());
    contactSheet.getRange(rowNumber, (getColumnFromName(contactSheet, 'passUrl'))).setValue(data.landingUrl);
    contactSheet.getRange(rowNumber, (getColumnFromName(contactSheet, 'passType'))).setValue(data.apple.passTypeIdentifier.replace(
        "pass.com.passninja.",
        ""
    ));
    contactSheet.getRange(rowNumber, (getColumnFromName(contactSheet, 'serialNumber'))).setValue(data.apple.serialNumber);
    highlightCells(contactSheet.getRange(rowNumber, 12, 1, 3), 'success')

    Logger.log(response.getContentText());
    return response.getContentText();
}

var status_lookup = {
    success: {
        border: "#008000",
        color: "#000000",
        background: "#ADFF2F",
        bold: true
    },
    ok: {
        border: "#008000"
    },
    error: {
        border: "#000000",
        background: "#FF4500"
    }
}

/** Determines whether the selected row is valid
 * @param {Sheet} sheet The Google Sheet to check against
 * @returns {int} The selected row number
 * @returns {boolean} If the selected row is invalid
 */
function getValidSheetSelectedRow(sheet) {
    var selectedRow = sheet.getActiveCell().getRow();
    var rowNumber = Number(selectedRow);
    if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
        Browser.msgBox(
            'Error',
            Utilities.formatString('Row "%s" is not valid.', selectedRow),
            Browser.Buttons.OK
        );
        return false;
    }
    return rowNumber;
}

/** Returns the requested Google Sheet by name
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName) {
    var spreadsheet = SpreadsheetApp.getActive();
    return spreadsheet.getSheetByName(sheetName);
}

/** Highlights a given range via custom status presets
 * @param {Range} cells That you want to highlight
 * @param {string} status The type of higlighting you want to apply
 * @param {string} [value] Value to set the cell contents to 
 */
function highlightCells(cells, status, value) {
    if (status === 'error') Logger.log("error caught: ", value);
    if (value) cells.setValue(value)
    var statusColors = status_lookup[status]
    if (statusColors.border) cells.setBorder(true, true, true, true, true, true, statusColors.border, SpreadsheetApp.BorderStyle.SOLID);
    if (statusColors.background) cells.setBackground(statusColors.background);
    if (statusColors.color) cells.setFontColor(statusColors.color)
    if (statusColors.bold) cells.setFontWeight("bold");
}

/** Takes in a name and parses to an object with a name, lastName and secondLast Name
 * @param {string} input Raw name
 * @returns {object} Object with the keys: name, lastName and secondLastName
 */
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