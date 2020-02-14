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
      insertRow(targetSheet, ['Error parsing event:', 'ERROR', '', '', eventJson], 2, () => {
          autoResizeSheet(targetSheet)
          var range = targetSheet.getRange("A2:E2")
          flashRange(range, "red", 1, 50);
          targetSheet.setActiveSelection(range)
      });
      return { "error": `Invalid event data sent: ${e} ${JSON.stringify(eventJson)}` };
    }

    insertRow(targetSheet, event, 2, () => {
        autoResizeSheet(targetSheet)
        var range = targetSheet.getRange("A2:E2")
        flashRange(range, "red", 1, 50);
        targetSheet.setActiveSelection(range)
    });

    log(log.SUCCESS, 'Succesfully added event.')
    event.push(eventJson.event)
    return { event };
}