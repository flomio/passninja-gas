/** Creates an event entry in the Events spreadsheet
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doPost(e) {
    var eventSheet = getSheet("Events");
    var response = addEvent(eventSheet, e.postData.contents);
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
        ContentService.MimeType.JSON
    );
}

/** Adds a PassNinja event to a new row in the target spreadsheet
 * @param {Sheet} targetSheet Sheet to insert the event into
 * @param {object} eventJson JSON representation of the PassNinja event
 * @return {boolean} If the action completed successfully
 */
function addEvent(targetSheet, eventJson) {
    Logger.log(targetSheet)
    Logger.log('event containing JSON', eventJson[0])
    Logger.log(eventJson.callback)

    try {
        eventJson = JSON.parse(eventJson);
        var eventData = [
            eventJson.date,
            eventJson.event.type,
            eventJson.event.passType,
            eventJson.event.serialNumber,
            eventJson.event.passJson
        ]
    } catch (e) {
        var msg = "Invalid event data sent: " + e;
        toast(msg, "Error", 5);
        return { "error": msg };
    }

    insertRow(targetSheet, eventData, 2);

    try {
        flashRange(targetSheet.getRange("A2:E2"), "red", 5, 500);
    } catch (e) {
        Logger.log("There was an error notifying the user", e)
    }

    return {
        "event": [
            eventJson.date,
            eventJson.event.type,
            eventJson.event.passType,
            eventJson.event.serialNumber,
            eventJson.event
        ]
    };
}