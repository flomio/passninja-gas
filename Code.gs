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
    var fieldsData = getNamedRange('config_fields', ss).getValues().filter(v => !!v[0])
    var fieldsNames = fieldsData.map(f => f[0])

    var sheet = getSheet(ENUMS.CONTACTS)
    var lock = LockService.getPublicLock();
    if (lock.tryLock(10000)) {
        var newRow = sheet.appendRow(fieldsNames.map(field => e.namedValues[field][0])) //Object.keys(e.namedValues).map(k => e.namedValues[k][0]));
        lock.releaseLock();
    } else {
        return "Lock Timeout";
    }
    autoResizeSheet(sheet)

    //    createPass_();
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
        print(response.getContentText());
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

/** Creates a PassNinja pass from the selected row.
 * @returns {string} The response from the PassNinja API.
 */
function createPass_() {
    var contactSheet = getSheet(ENUMS.CONTACTS);
    var rowNumber = getValidSheetSelectedRow(contactSheet);
    var passTypeId = contactSheet.getRangeByName("passType").getValue();
    print("passTypeID: ", passTypeId);

    // Retrieve the addresses in that row.
    var row = contactSheet.getRange(rowNumber, 1, 1, 11);
    var rowValues = row.getValues();
    var fullName = rowValues[0][0];
    if (!fullName) {
        Browser.msgBox(
            "Error",
            "Row does not contain contact name or code.",
            Browser.Buttons.OK
        );
        return;
    }

    var parsedName = parseName(fullName);

    var postData = {
        passType: passTypeId,
        pass: {
            firstName: parsedName.name,
            lastName: parsedName.lastName + " " + parsedName.secondLastName,
            issuerName: "required",
            hexBackground: "#571616"
        }
    };

    try {
        response = UrlFetchApp.fetch(API_URL + "passes/", {
            method: "post",
            contentType: "application/json",
            muteHttpExceptions: true,
            payload: JSON.stringify(postData)
        });
    } catch (err) {
        highlightCells(contactSheet.getRange(rowNumber, getColumnIndexFromString('passUrl') - 1), "error", err);
    }

    print("response:", response.getContentText());
    data = JSON.parse(response.getContentText());
    contactSheet
        .getRange(rowNumber, getColumnFromName(contactSheet, "passUrl"))
        .setValue(data.landingUrl);
    contactSheet
        .getRange(rowNumber, getColumnFromName(contactSheet, "passType"))
        .setValue(data.apple.passTypeIdentifier.replace("pass.com.passninja.", ""));
    contactSheet
        .getRange(rowNumber, getColumnFromName(contactSheet, "serialNumber"))
        .setValue(data.apple.serialNumber);
    highlightCells(contactSheet.getRange(rowNumber, 12, 1, 3), "success");

    print(response.getContentText());
    return response.getContentText();
}