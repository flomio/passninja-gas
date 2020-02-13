/** Adds the PassNinja script set as a menu item on load.
 * 
 */
function onOpen() {
    var sheet = SpreadsheetApp.getActive();
    var menuItems = [
        { name: "Create/Update A Pass", functionName: "createPass_" },
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
    var fieldsHash = getEnvVar('fieldsHash');
    var hash = MD5(JSON.stringify(fieldsData), true);
    log(log.STATUS, `Computed hash for fieldsData [new] <-> [old]: ${hash} <->${fieldsHash}`)

    if (hash !== fieldsHash) {
        setEnvVar('fieldsHash', hash)

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
    var pnService = new PassNinjaService()
    var ss = SpreadsheetApp.getActive();
    var contactSheet = getSheet(ENUMS.CONTACTS);

    var passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
    var serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
    var rowNumber = getValidSheetSelectedRow(contactSheet);

    var rowRange = contactSheet.getRange(rowNumber, 1, 1, passNinjaColumnStart - 1);
    var passNinjaContentRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 3);
    var passUrlRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 1);
    var serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex, 1, 1);

    var payloadJSONString = getRowPassPayload(ss, rowRange)
    var serial = serialNumberRange.getValue()
    var responseData = serial ? pnService.updatePass(payloadJSONString, serial) : pnService.createPass(payloadJSONString);

    passNinjaContentRange.setValues([
        [responseData.landingUrl,
            responseData.apple.passTypeIdentifier.replace("pass.com.passninja.", ""),
            responseData.apple.serialNumber
        ]
    ]);

    highlightCells(passNinjaContentRange, "success");
    contactSheet.setActiveSelection(passUrlRange)
    autoResizeSheet(contactSheet)

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