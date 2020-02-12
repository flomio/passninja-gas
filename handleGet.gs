/** Returns the corresponding user entry in the Contacts sheet
 *  matching the serialNumber query parameter
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doGet(request) {
    var serialNumber = request.parameter.serialNumber;
    clientData = findContactBySerial(getSheet(ENUMS.CONTACTS), serialNumber);
    return ContentService.createTextOutput(
        JSON.stringify(clientData)
    ).setMimeType(ContentService.MimeType.JSON);
}

/** Creates a JSON object from the first found match of the given serial number.
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} serialNumber Query string to match
 * @returns {object} The resulting match or an empty object if no match is found
 */
function findContactBySerial(sheet, serialNumber) {
    var serialNumberColumn = getColumnIndexFromString(sheet, "serialNumber") - 1;
    var serialNumberColumnData = sheet
        .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
        .getValues();

    var matchIndex = findMatchIndexAtColumn(
        serialNumberColumnData,
        serialNumberColumn,
        serialNumber
    );

    if (matchIndex === -1) return {};
    return rowToJson(sheet, serialNumberColumnData[matchIndex]);
}