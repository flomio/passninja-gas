var API_URL = "https://api.passninja.com/v1/";

/** Adds the PassNinja script set as a menu item on load.
 * 
 */
function onOpen() {
    var sheet = SpreadsheetApp.getActive();
    var menuItems = [
        { name: "Create A Pass", functionName: "createPass_" },
        { name: "Update A Pass", functionName: "updatePass_" },
        { name: "Show Events", functionName: "showEvents_" },
        { name: "Build/Update From Config", functionName: "updateFromConfig_" }
    ];
    sheet.addMenu("PassNinja", menuItems);
}

/**
 * Creates a Google Form that allows respondents to select which conference
 * sessions they would like to attend, grouped by date and start time.
 *
 * @param {Spreadsheet} ss The spreadsheet that contains the conference data.
 * @param {string[]} values Cell values for the spreadsheet range.
 */
function updateFromConfig_() {
    var ss = SpreadsheetApp.getActive();
    var fieldsData = getNamedRange('config_fields', ss).getValues().filter(v => !!v[0])
    var fieldsHash = PropertiesService.getScriptProperties().getProperty('fieldsHash');
    var hash = MD5(JSON.stringify(fieldsData), true);
    log(log.STATUS, `Computed hash for fieldsData [new] <-> [old]: ${hash} <->${fieldsHash}`)

    if (hash !== fieldsHash) {
        PropertiesService.getScriptProperties().setProperty('fieldsHash', hash);

        var fieldsNames = fieldsData.map(f => f[0])

        catchError(() => buildEventsSheet(ss), 'Error building Contacts Form - ')
        var sheet = catchError(() => buildContactsSheet(ss, fieldsNames), 'Error building Contacts Sheet - ')
        catchError(() => buildContactsForm(ss, sheet, fieldsData), 'Error building Contacts Form - ')
    } else {
        Browser.msgBox(
            "No Update",
            "The Config sheet's field data has not changed, not updating.",
            Browser.Buttons.OK
        );
    }
}

/** Inputs a new user's data from a form submit event and triggers a pass creation.
 * 
 * @param {object} e The form event to read from
 * @returns {string} "Lock Timeout" if the contact sheet queries cause a timeout
 */
function onboardNewPassholderFromForm(e) {
    var ss = SpreadsheetApp.getActive();
    var sheet = getSheet(ENUMS.CONTACTS)
    var fieldsData = getNamedRange('config_fields', ss).getValues().filter(v => !!v[0])
    var fieldsNames = fieldsData.map(f => f[0])

    var lock = LockService.getPublicLock();
    if (lock.tryLock(10000)) {
        sheet.appendRow(fieldsNames.map(field => e.namedValues[field][0]))
        lock.releaseLock();
    } else {
        return "Lock Timeout";
    }
    autoResizeSheet(sheet)
    sheet.setActiveRange(sheet.getRange(sheet.getLastRow(), 1));
    createPass_();
}

/** Creates a PassNinja pass from the selected row.
 * @returns {string} The response from the PassNinja API.
 */
function createPass_() {
    var ss = SpreadsheetApp.getActive();
    var contactSheet = getSheet(ENUMS.CONTACTS);

    var passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
    var serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
    var rowNumber = getValidSheetSelectedRow(contactSheet);
    var rowRange = contactSheet.getRange(rowNumber, 1, 1, passNinjaColumnStart - 1);
    var passNinjaContentRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 3);
    var passUrlRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 1);
    var serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex, 1, 1);
    var { passTypeId, ...passFieldConstants } = getConfigConstants()
    var fieldsData = getNamedRange('config_fields', ss).getValues().filter(v => !!v[0]);
    var rowValues = rowRange.getValues()[0];
    log(log.STATUS, `Working on row #${rowNumber} with values [${rowValues}]`)

    var postData = {
        passType: passTypeId,
        pass: passFieldConstants
    };

    for (i = 0; i < rowValues.length; i++) {
        var [fieldName, fieldIncluded] = fieldsData[i]
        if (fieldIncluded === 'Y') {
            log(log.SUCCESS, `Added (${fieldName}: ${rowValues[i]}) to POST payload.`)
            postData.pass[fieldName] = rowValues[i]
        }
    }

    var data = undefined;
    try {
        log(log.STATUS, "Attempting to POST /passes with: ", JSON.stringify(postData));
        response = UrlFetchApp.fetch(API_URL + "passes/", {
            method: "post",
            contentType: "application/json",
            muteHttpExceptions: true,
            payload: JSON.stringify(postData)
        });
        if ((response.getResponseCode() < 200 || response.getResponseCode() > 299)) throw (response)
    } catch (e) {
        var errorString = JSON.stringify(e.getContentText && e.getContentText() || e)
        log(log.ERROR, `PassNinja API Error:\n${errorString}`)
        throw (`PassNinja API error: ${errorString}`)
    }

    data = JSON.parse(response.getContentText());
    passNinjaContentRange.setValues([
        [data.landingUrl, data.apple.passTypeIdentifier.replace("pass.com.passninja.", ""), data.apple.serialNumber]
    ]);

    highlightCells(passNinjaContentRange, "success");
    contactSheet.setActiveSelection(passUrlRange)
    autoResizeSheet(contactSheet)

    return response.getContentText();
}

/** Updates a given pass from the highlighted row with the new values in the row
 *  Pops up a dialog input box where the user can input new json data to overwrite the existing pass
 * 
 * @returns {string} The response from the PassNinja API.
 */
function updatePass_() {
    var contactSheet = getSheet(ENUMS.CONTACTS);
    var rowNumber = getValidSheetSelectedRow(contactSheet);
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
    var updateJson = Browser.inputBox(
        "Update A Pass",
        "Please paste the json for your update.",
        Browser.Buttons.OK_CANCEL
    );
    if (updateJson == "cancel") {
        return;
    }
    var options = {
        method: "post",
        contentType: "application/json",
        muteHttpExceptions: true,
        payload: updateJson
    };
    try {
        response = UrlFetchApp.fetch(API_URL + "apple", options);
        log(log.SUCCESS, response.getContentText());
    } catch (err) {
        range = contactSheet.getRange(rowNumber, 12);
        highlightCells(range, "error", data.response);
    }

    data = JSON.parse(response.getContentText());

    if (data.statusCode == "200") {
        highlightCells(contactSheet.getRange(rowNumber, 1, 1, 12), "ok");
    }
    return response.getContentText();
}

/** Pops up a modal with the pass events of the current highlighted row
 * related to the pass via serial number
 * 
 */
function showEvents_() {
    var contactSheet = getSheet(ENUMS.CONTACTS);
    var rowNumber = getValidSheetSelectedRow(contactSheet);
    var row = contactSheet.getRange(rowNumber, 1, 1, 12);
    var rowValues = row.getValues();
    var serialNumber = rowRange[0][12];
    var html = "<p>" + serialNumber + "<p>";
    var htmlOutput = HtmlService.createHtmlOutput(html)
        .setWidth(550)
        .setHeight(300);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Pass Events");
}