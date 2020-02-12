var API_URL = "https://api.passninja.com/v1/";

/** Adds the PassNinja script set as a menu item on load.
 * 
 */
function onOpen() {
    var sheet = SpreadsheetApp.getActive();
    updateFromConfig_(sheet)
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
    var fieldsNames = fieldsData.map(f => f[0])
    buildEventsSheet(ss)
    var sheet = buildContactsSheet(ss, fieldsNames);
    var form = buildContactsForm(ss, sheet, fieldsData);
}

/** Builds a contacts sheet based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildContactsSheet(ss, fieldsNames) {
    var sheet = initializeSheet(ENUMS.CONTACTS, ss)

    var fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length)
    fieldHeaders.setValues([fieldsNames])
    fieldHeaders.setBackground(COLORS.FIELD_PASS)
    fieldHeaders.setFontWeight('bold')

    var passNinjaFields = [ENUMS.PASSURL, ENUMS.PASSTYPE, ENUMS.SERIAL]
    var passNinjaHeaders = sheet.getRange(1, fieldsNames.length + 1, 1, passNinjaFields.length)
    passNinjaHeaders.setValues([passNinjaFields])
    passNinjaHeaders.setBackground(COLORS.FIELD_PASSNINJA)
    passNinjaHeaders.setFontWeight('bold')

    deleteUnusedColumns(passNinjaFields.length + fieldsNames.length + 1, sheet.getMaxColumns(), sheet)
}

/** Builds a events sheet based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildEventsSheet(ss) {
    var sheet = initializeSheet(ENUMS.EVENTS, ss)

    var fieldsNames = ["eventDate", "eventType", "passType", "serialNumber", "eventData"]
    var fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length)
    fieldHeaders.setValues([fieldsNames])
    fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA)
    fieldHeaders.setFontWeight('bold')

    deleteUnusedColumns(fieldsNames.length + 1, sheet.getMaxColumns(), sheet)
}

/** Builds a form based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {Sheet} sheet The container sheet for the form
 * @param {string[]} fieldData The fields that the user has entered in the config
 */
function buildContactsForm(ss, sheet, fieldData) {
    var form = FormApp.openByUrl(ss.getFormUrl())
    if (!form) {
        form = FormApp.create('Create New Contact');
        ss.setActiveSheet(sheet)
        form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
        ScriptApp.newTrigger('onboardNewPassholderFromForm').forSpreadsheet(ss).onFormSubmit().create();
    } else {
        clearForm(form)
    }

    for (field of fieldData) {
        Logger.log('header', field)
        form.addTextItem().setTitle(field[0]).setRequired(true);
    }
}

/** Inputs a new user's data from a form submit event and triggers a pass creation.
 * 
 * @param {object} e The form event to read from
 * @returns {string} "Lock Timeout" if the contact sheet queries cause a timeout
 */
function onboardNewPassholderFromForm(e) {
    var data = e.namedValues
    var sheet = getSheet(ENUMS.CONTACTS)

    var lock = LockService.getPublicLock();
    if (lock.tryLock(10000)) {
        var newRow = contactSheet.appendRow(Object.keys(data).map(k => data[k][0]));
        contactSheet.setActiveRange(newRow);
        lock.releaseLock();
    } else {
        return "Lock Timeout";
    }

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
        Logger.log(response.getContentText());
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
    Logger.log("passTypeID: ", passTypeId);

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

    Logger.log("response:", response.getContentText());
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

    Logger.log(response.getContentText());
    return response.getContentText();
}