function doGet(request) {
  var serialNumber = request.parameter.serialNumber;
  clientData = findContactBySerial(serialNumber);
  return ContentService.createTextOutput(
    JSON.stringify(clientData)
  ).setMimeType(ContentService.MimeType.JSON);
}
