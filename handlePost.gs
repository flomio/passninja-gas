/** placeholder script for now
 * @param {object} e - request event data
 * @returns {object} - Standard response with a JavaScript text body
 */
function doPost(e) {
    var result = {};

    console.log(e.postData.contents);
    var row = addEvent(e.postData.contents);

    return ContentService
        .createTextOutput(row)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
}


function testPost() {
    var data = {
        "callback": "https://script.google.com/macros/s/AKfycbxAnr781LarJsrDJgFzq1zr1rq2OECY4gzRA7Z8iFP_ShFQbnQB/exec",
        "date": "2020-02-04T15:15:13.341Z",
        "event": {
            "passJson": "{\"formatVersion\":1,\"description\":\"Pass Entry for Employee Number 232\",\"passTypeIdentifier\":\"pass.com.passninja.passentry.demo\",\"organizationName\":\"PassEntry\",\"teamIdentifier\":\"Q338UYGFZ8\",\"serialNumber\":\"810ce8e0-1f11-4e29-a35e-cdf326fb90c2\",\"backgroundColor\":\"rgb(41, 50, 58)\",\"labelColor\":\"rgb(255, 132, 119)\",\"foregroundColor\":\"rgb(255, 255, 255)\",\"logoText\":\"PassEntry\",\"generic\":{\"headerFields\":[{\"key\":\"passId\",\"label\":\"PASS ID\",\"value\":\"232\"}],\"primaryFields\":[{\"key\":\"staffName\",\"label\":\"NAME\",\"value\":\"Nico Cary\"}],\"secondaryFields\":[{\"key\":\"jobRole\",\"label\":\"JOB ROLE\",\"value\":\"Chief Innovation Officer\"},{\"key\":\"passExpiry\",\"label\":\"PASS EXPIRY\",\"value\":\"23 December 2020\"}]},\"nfc\":{\"message\":\"810ce8e0-1f11-4e29-a35e-cdf326fb90c2\",\"encryptionPublicKey\":\"MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgADTkFu6xr9i4GKk1+Jn+UxayuuC+SQLfXA0sE5J5iQx3o=\"},\"webServiceURL\":\"https://api.passninja.com/thumbnail\",\"authenticationToken\":\"8e98126bb7e60666\"}",
            "passType": "passentry.demo",
            "serialNumber": "810ce8e0-1f11-4e29-a35e-cdf326fb90c2",
            "type": "APPLE_CREATE"
        },
        "id": "#niko@passentry.com#passentry.demo#810ce8e0-1f11-4e29-a35e-cdf326fb90c2"
    };

    var e = { "postData": { "contents": {} } };



    e['postData']['contents'] = data;
    doPost(e);
}

/** Returns the file ID of the current spreadsheet.
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

function flashRange(sheet, range) {
    //no workeee?
    for (var i = 0; i < 5; i++) {
        range.setBackground("red");
        SpreadsheetApp.flush();
        range.setBackground("gray");
        SpreadsheetApp.flush();
        Utilities.sleep(1000);
    }
}

function sortContactSheet() {
    var spreadsheet = SpreadsheetApp.getActive();
    var eventSheet = spreadsheet.getSheetByName('Events');
    eventSheet.getRange('A1').activate();
    eventSheet.getFilter().sort(1, false);
    //  spreadsheet.toast("New Event Received");
};

/** Adds a PassNinja event to a new row in the current 'Events' spreadsheet
 * @param {object} eventJson - JSON representation of the PassNinja event
 * @return {boolean} - If the action completed successfully
 */
function addEvent(eventJson) {
    var spreadsheet = SpreadsheetApp.getActive();
    var eventSheet = spreadsheet.getSheetByName('Events');

    // SpreadsheetApp.open(DriveApp.getFileById(getFileId()));
    //SpreadsheetApp.openById();
    var spreadsheet = SpreadsheetApp.getActive();
    var eventSheet = spreadsheet.getSheetByName('Events');

    eventJson = JSON.parse(eventJson)
    eventSheet.appendRow([eventJson.date, eventJson.event.type, eventJson.event.passType, eventJson.event.serialNumber, eventJson.event]);
    // spreadsheet.toast((eventJson.event.passType,'/',eventJson.event.serialNumber), "New Event Received", 4);
    sortContactSheet();
    flashRange(eventSheet, 'A2:E2');
    return [eventJson.date, eventJson.event.type, eventJson.event.passType, eventJson.event.serialNumber, eventJson.event];

}