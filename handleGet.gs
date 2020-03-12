/** Returns the corresponding user entry in the Contacts sheet
 *  matching the serialNumber query parameter
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doGet(request) {
  const ss = getLinkedSpreadsheet()
  const serialNumber = request.parameter.serialNumber;
  clientData = rowToJSONFromSerial(getSheet(ENUMS.CONTACTS, ss), serialNumber);
  return ContentService.createTextOutput(JSON.stringify(clientData)).setMimeType(ContentService.MimeType.JSON);
}

/** Creates a JSON object from the first found match of the given serial number.
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} serialNumber Query string to match
 * @returns {object} The resulting match or an empty object if no match is found
 */
function rowToJSONFromSerial(sheet, serialNumber) {
  const serialNumberColumn = getColumnIndexFromString(sheet, 'serialNumber') - 1;
  const serialNumberColumnData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const matchIndex = findMatchIndexAtColumn(serialNumberColumnData, serialNumberColumn, serialNumber);

  if (matchIndex === -1) return {};
  return rowToJson(sheet, serialNumberColumnData[matchIndex]);
}
