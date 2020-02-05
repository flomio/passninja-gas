function doPost(e) {
  var result = {};
  Logger.log(e.postData.contents)
  addEvent(e.postData.contents)
  return ContentService
  .createTextOutput('(' + e.postData.contents + ')')
  .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

  

function getFileId() {
 // SpreadsheetApp.getActive();
  var files = DriveApp.getFiles();
  while ( files.hasNext() ) {
    var file = files.next();
    if (file.getName() == DriveApp.getFileById(current.getId())) {
      return file.getId();
    }
  }
}

function addEvent(eventJson) {
  

 // SpreadsheetApp.open(DriveApp.getFileById(getFileId()));
  //SpreadsheetApp.openById();
  var spreadsheet = SpreadsheetApp.getActive();
  var eventSheet = spreadsheet.getSheetByName('Events');

  eventJson = JSON.parse(eventJson)
    eventSheet.appendRow([eventJson.date,eventJson.event.type,eventJson.event.passType,eventJson.event.serialNumber, eventJson.event]);
}