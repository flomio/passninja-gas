/** Creates an event entry in the Events spreadsheet
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doPost(e) {
  const response = addEvent(getSheet(ENUMS.EVENTS), e.postData.contents);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/** Adds a PassNinja event to a new row in the target spreadsheet
 * @param {Sheet} targetSheet Sheet to insert the event into
 * @param {object} eventJson JSON representation of the PassNinja event
 * @return {boolean} If the action completed successfully
 */
function addEvent(targetSheet, eventJson) {
  let event;
 
  try {
    eventJson = JSON.parse(eventJson);
     if (eventJson.reader) {
     event = [
       eventJson.data.timeStamp,
       "APPLE_SCAN",
       eventJson.passTypeIdentifier.replace('pass.com.passninja.',''),
       eventJson.data.message,
       JSON.stringify(eventJson.data)
       ]
     processScanEvent(eventJson.data)
     } else {
     event = [
      eventJson.date,
      eventJson.event.type,
      eventJson.event.passType,
      eventJson.event.serialNumber,
      JSON.stringify(eventJson.event.passJson)
    ];
    }
  } catch (e) {
    insertRow(targetSheet, ['Error parsing event:', 'ERROR', '', '', eventJson], 2, () => {
      autoResizeSheet(targetSheet);
      let range = targetSheet.getRange('A2:E2');
      flashRange(range, 'red', 1, 50);
      targetSheet.setActiveSelection(range);
    });
    return { error: `Invalid event data sent: ${e} ${JSON.stringify(eventJson)}` };
  }

  insertRow(targetSheet, event, 2, () => {
    autoResizeSheet(targetSheet);
    var range = targetSheet.getRange('A2:E2');
    flashRange(range, 'red', 1, 50);
    targetSheet.setActiveSelection(range);
  });

  log(log.SUCCESS, 'Successfully added event.');
return {data: event}
       
  //return rowToJson(targetSheet, targetSheet.getRange('A2:E2'));
}

function processScanEvent(eventJson) {
  const sheet = getSheet(ENUMS.SCANNERS)
 // get serialNumber of scanner
 // find that scanner in scanner sheet
 // if no scanner, make scan in events RED .. or something?
 // if match, do validity checks.    
  
      var columnValues = sheet.getRange(2, getColumnIndexFromString(sheet, serialNumber), sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(eventJson.reader.serialNumber)+2; //Row Index - 2

    if(searchResult != -1)
    {
        //searchResult + 2 is row index.
        let range = sheet.getRange(searchResult, 1, 1, sheet.getLastColumn())
        
        // if provisioned = true 
        // and if time between values in. 6 and 7
        // and if attachedPassSerial is blank
        // and if status = UNLOCKED (?)
        // send LOCK REQUEST to scanner URL
        // on success (on fail change nothing), add serialnumber to column 5 (attachedSerialNumber)
        // putPass with locker Number (add that field to pass)
        // else if status = LOCKED
        // send UNLOCK REQUEST to scanner
        // on success (on fail change nothing), remove serialnumber to column 5
        // putPass with locker Number set to '-'
        // DONE :-)
        //{
        //  "request": "lock"
        //}  

      //response is a 200 OK if all is well or..       
    } else
    {//scanner not found logic}
    }}