var STATUS_LOOKUP = {
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
};

/** Determines whether the selected row is valid
 *
 * @param {Sheet} sheet The Google Sheet to check against
 * @returns {int} The selected row number
 * @returns {boolean} If the selected row is invalid
 */
function getValidSheetSelectedRow(sheet) {
    var selectedRow = sheet.getActiveCell().getRow();
    var rowNumber = Number(selectedRow);
    if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
        Browser.msgBox(
            "Error",
            Utilities.formatString('Row "%s" is not valid.', selectedRow),
            Browser.Buttons.OK
        );
        return false;
    }
    return rowNumber;
}

/** Sorts the specified sheet
 *
 * @param {Sheet} sheet The Google sheet to sort
 */
function sortSheet(sheet) {
    var range = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn())
    range.sort({ column: 1, ascending: false })
        //  sheet.getRange("A1").activate();
        //  Logger.log(sheet.getRange("A1").getFilter())
        //  sheet.getFilter().sort(1, false);
}

/** Returns the requested Google Sheet by name
 *
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName) {
    var spreadsheet = SpreadsheetApp.getActive();
    return spreadsheet.getSheetByName(sheetName);
}

/** Highlights a given range via custom status presets
 *
 * @param {Range} cells That you want to highlight
 * @param {string} status The type of higlighting you want to apply
 * @param {string} [value] Value to set the cell contents to
 */
function highlightCells(cells, status, value) {
    if (status === "error") Logger.log("error caught: ", value);
    if (value) cells.setValue(value);
    var statusColors = STATUS_LOOKUP[status];
    if (statusColors.border)
        cells.setBorder(
            true,
            true,
            true,
            true,
            true,
            true,
            statusColors.border,
            SpreadsheetApp.BorderStyle.SOLID
        );
    if (statusColors.background) cells.setBackground(statusColors.background);
    if (statusColors.color) cells.setFontColor(statusColors.color);
    if (statusColors.bold) cells.setFontWeight("bold");
}

/** Takes in a name and parses to an object with a name, lastName and secondLast Name
 *
 * @param {string} input Raw name
 * @returns {object} Object with the keys: name, lastName and secondLastName
 */
function parseName(input) {
    var fullName = input || "";
    var result = {};

    if (fullName.length > 0) {
        var nameTokens =
            fullName.match(
                /[A-ZÁ-ÚÑÜ][a-zá-úñü]+|([aeodlsz]+\s+)+[A-ZÁ-ÚÑÜ][a-zá-úñü]+/g
            ) || [];

        if (nameTokens.length > 3) {
            result.name = nameTokens.slice(0, 2).join(" ");
        } else {
            result.name = nameTokens.slice(0, 1).join(" ");
        }

        if (nameTokens.length > 2) {
            result.lastName = nameTokens.slice(-2, -1).join(" ");
            result.secondLastName = nameTokens.slice(-1).join(" ");
        } else {
            result.lastName = nameTokens.slice(-1).join(" ");
            result.secondLastName = "";
        }
    }

    return result;
}

/** Returns first found matching column (searches first row of the sheet)
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} searchTerm Search term
 * @returns {int} The first found column index, -1 if not found
 */
function getColumnIndexFromString(sheet, searchTerm) {
    var headers = getHeaders(sheet);
    for (var i = 0; i < headers.length; i++) {
        if (headers[i] == searchTerm) return i;
    }
    return -1;
}

/** Gets the column headers of the specified sheet
 *
 * @param {Sheet} sheet Google Sheet to query
 * @returns {array} The headers of the first column.
 */
function getHeaders(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}


/** Returns the index of the matching query in the 2D array at column index.
 *
 * @param {array} arr 2D Array to query
 * @param {int} column Index at second level to query
 * @param {string} query Query term
 * @returns {int} Query match index or -1 if not found
 */
function findMatchIndexAtColumn(arr, column, query) {
    var matchIndex = -1;
    for (i = 1; i < arr.length; ++i) {
        if (arr[i][column] == query) {
            matchIndex = i;
            break;
        }
    }
    return matchIndex;
}

/** Creates an object from a sheet's first row headers as keys with the values from the data object.
 *
 * @param {Sheet} sheet String to query the column headers
 * @param {string[]} data Array of string data representing a row
 * @returns
 */
function rowToJson(sheet, data) {
    var obj = {};
    var keys = getHeaders(sheet);

    for (var i = 0; i < data.length; i++) {
        obj[keys[i]] = data[i];
    }

    return obj;
}

/** Flashes a row of a sheet
 *  Note: the range will end overridden with the top left's background color.
 *
 * @param {Range} range Range to flash across
 * @param {string} flashColor Valid Google SpreadSheet color to flash
 * @param {int} numFlashes Number of times to flash the range
 * @param {int} timeout The timeout (in ms) for the flashes
 * @returns
 */
function flashRange(range, flashColor, numFlashes, timeout) {
    var originalBgColor = range.getBackground()
    for (var i = 0; i < numFlashes; i++) {
        range.setBackground(flashColor);
        SpreadsheetApp.flush();
        Utilities.sleep(timeout);
        range.setBackground(originalBgColor);
        SpreadsheetApp.flush();
    }
}

/** Returns the file ID of the current spreadsheet.
 *
 * @returns {string} - The file ID or undefined if not found.
 */
function getFileId() {
    var files = DriveApp.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        if (file.getName() == DriveApp.getFileById(current.getId())) {
            return file.getId();
        }
    }
}

/** Inserts a row
 *  Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top
 * @param {Sheet} sheet Google Sheet to insert row data into
 * @param {string[]} rowData Array of string data to insert in the rows
 * @param {int} [index] Optional index to specify the insertion point
 */
function insertRow(sheet, rowData, index) {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
        var index = index || 1;
        sheet.insertRowBefore(index).getRange(index, 1, 1, rowData.length).setValues([rowData]);
        SpreadsheetApp.flush();
    } finally {
        lock.releaseLock();
    }
}

/** Toasts the user at the current spreadsheet
 *
 * @param {string} msg The message to sent
 * @param {string} title The title of the toast
 * @param {int} timeout The timeout of the toast
 */
function toast(msg, title, timeout) {
    var currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    currentSpreadsheet.toast(msg, title, timeout);
}