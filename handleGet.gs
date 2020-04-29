/**
 *  Built in definition for API deploment GET method
 * @module handleGet
 */

/** Returns the corresponding user entry in the Contacts sheet
 *  matching the serialNumber query parameter
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doGet(request) {
  const ss = getLinkedSpreadsheet();
  const serialNumber = request.parameter.serialNumber;
  clientData = rowToJSONFromSerial(getSheet(ENUMS.CONTACTS, ss), serialNumber);
  return ContentService.createTextOutput(JSON.stringify(clientData)).setMimeType(ContentService.MimeType.JSON);
}
