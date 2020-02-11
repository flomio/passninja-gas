function doGet(request) {
  var serialNumber = request.parameter.serialNumber;
  clientData = findContactBySerial(getSheet('Contacts'), serialNumber);
  return ContentService.createTextOutput(
    JSON.stringify(clientData)
  ).setMimeType(ContentService.MimeType.JSON);
}
