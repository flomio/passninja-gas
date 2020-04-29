/**
 *  Built in definition for API deployment POST method
 * @module handlePost
 */

/** Creates an event entry in the Events spreadsheet
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doPost(e) {
  const spreadsheet = new VSpreadsheet();
  const response = addEvent(spreadsheet, e.postData.contents);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/** Adds a PassNinja event to a new row in the target spreadsheet
 * @param {Sheet} sheet Sheet to insert the event into
 * @param {object} eventJson JSON representation of the PassNinja event
 * @return {boolean} If the action completed successfully
 */
function addEvent(spreadsheet, eventJson) {
  log(log.FUNCTION, 'STARTING ADD_EVENT');
  let event;
  let scan = false;
  const eventsSheet = getSheet(ENUMS.EVENTS, spreadsheet);
  const callback = () => {
    spreadsheet.flush();
    log(log.FUNCTION, 'TECHNICALLY ALL LOGIC IS FINISHED, FLASHING FOLLOWS.');
    autoResizeSheet(eventsSheet._internal);
  };

  try {
    eventJson = JSON.parse(eventJson);
    event = [eventJson.date, eventJson.event.type, eventJson.event.passType, eventJson.event.serialNumber];
    if (eventJson.event.reader) {
      event.push(JSON.stringify(eventJson.event));
      scan = true;
    } else if (eventJson.event.passJson) {
      event.push(JSON.stringify(eventJson.event.passJson));
    } else {
      event.push(JSON.stringify(eventJson));
    }
  } catch (e) {
    insertRow(eventsSheet, ['Error parsing event:', 'ERROR', '', '', eventJson], 2);
    return { error: `Invalid event data sent: ${e} ${JSON.stringify(eventJson)}` };
  }
  insertRow(eventsSheet, event, 2);

  if (scan) processScanEvent(spreadsheet, eventJson);
  callback();
  log(log.FUNCTION, 'ENDING ADD_EVENT');
  return { data: event };
}
