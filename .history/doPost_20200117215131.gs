function doPost(e) {
  var result = {};
  Logger.log(e.postData.contents)
  addEvent(e.postData.contents)
  return ContentService
    .createTextOutput('(' + e.postData.contents + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function addEvent(eventJson) {

  function listFiles() {
    var files = DriveApp.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      Logger.log(file.getName() + ' ' + file.getId());
    }
  }
  SpreadsheetApp.open(DriveApp.getFileById("1vDYpwmRk5PrIM1Q0VJOsdGqOuRLng5aHEYX3TJnuNjI"))
  //SpreadsheetApp.openById();
  var spreadsheet = SpreadsheetApp.getActive();
  var eventSheet = spreadsheet.getSheetByName('Events');

  eventJson = JSON.parse(eventJson)

  eventSheet.appendRow([eventJson.pass.type, eventJson.pass.serialNumber, eventJson.event.timeStamp, eventJson.event.data, eventJson.version, eventJson.id]);

}