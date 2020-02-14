/** Creates an event entry in the Events spreadsheet
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doPost(e) {
    var response = addEvent(getSheet(ENUMS.EVENTS), e.postData.contents);
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
    try {
        eventJson = JSON.parse(eventJson);
        var event = [
            eventJson.date,
            eventJson.event.type,
            eventJson.event.passType,
            eventJson.event.serialNumber,
            eventJson.event.passJson
        ]
    } catch (e) {
        return { "error": `Invalid event data sent: ${e}` };
    }

    insertRow(targetSheet, event, 2);
    autoResizeSheet(targetSheet)

    try {
        flashRange(targetSheet.getRange("A2:E2"), "red", 3, 100);
    } catch (e) {
        log(log.ERROR, "There was an error notifying the user", e)
    }

    log(log.SUCCESS, 'Succesfully added event.')
    event.push(eventJson.event)
    return { event };
}