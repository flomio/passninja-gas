/** Creates an event entry in the Events spreadsheet
 * @param {object} e Request event data
 * @returns {object} Standard response with a JavaScript text body
 */
function doPost(e) {
  const spreadsheet = new VSpreadsheet()
  const response = addEvent(spreadsheet, e.postData.contents);
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/** Adds a PassNinja event to a new row in the target spreadsheet
 * @param {Sheet} sheet Sheet to insert the event into
 * @param {object} eventJson JSON representation of the PassNinja event
 * @return {boolean} If the action completed successfully
 */
function addEvent(spreadsheet, eventJson) {
  let event;
  let scan=false;
  const sheet = getSheet(ENUMS.EVENTS, spreadsheet)
  const callback = () => {
    spreadsheet.flush()
    autoResizeSheet(sheet._internal);
    var range = sheet._internal.getRange('A2:E2');
    flashRange(range, 'red', 2, 50);
    sheet.setActiveSelection(range);
  }
    
 try {
    eventJson = JSON.parse(eventJson);
    if (eventJson.reader) {
      event = [
        eventJson.data.timeStamp,
        'APPLE_SCAN',
        eventJson.passTypeIdentifier.replace('pass.com.passninja.', ''),
        eventJson.data.message,
        JSON.stringify(eventJson.data)
      ];
      scan = true;
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
   insertRow(sheet, ['Error parsing event:', 'ERROR', '', '', eventJson], 2, callback);
   return {
     error: `Invalid event data sent: ${e} ${JSON.stringify(eventJson)}`
   };
 }
 
 if (scan) {
   const processResponse = processScanEvent(spreadsheet, eventJson);
   insertRow(sheet, [new Date().toUTCString(), 'SCAN_RESPONSE', eventJson.passTypeIdentifier.replace('pass.com.passninja.', ''), eventJson.data.message,, JSON.stringify(processResponse)], 2, callback);
 }

  insertRow(sheet, event, 2, callback);

  log(log.SUCCESS, 'Successfully added event.');
  return {
    data: event
  };
}

/*
 * Example structure:
 *{
 *    "reader": {
 *        "type": "FloBlePlus",
 *        "serial_number": "RR464-0017564",
 *        "firmware": "ACR1255U-J1 SWV 3.00.05"
 *    },
 *    "uuid": "9ce26320-62e0-11ea-9db9-9f7cacc638f7",
 *    "type": "apple-pay",
 *    "passTypeIdentifier": "pass.com.passninja.ripped.beta",
 *    "data": {
 *        "timeStamp": "2020-03-10T15:05:40.207Z",
 *        "message": "5adc37df-d9ff-4398-9d5b-34f5c0d6da00"
 *    }
 *}
 */
function processScanEvent(spreadsheet, eventJson) {
  log(log.STATUS, 'DETECTED SCAN EVENT, PROCESSING...')
  const sheet = getSheet(ENUMS.SCANNERS, spreadsheet)
  const startingRow = 2;
  const serialNumberColumnIndex = getColumnIndexFromString(sheet, 'serialNumber')
  const passSerialNumberColumnIndex = getColumnIndexFromString(sheet, 'attachedPassSerial')
  const columnValues = sheet
    .getRange(startingRow, serialNumberColumnIndex, sheet.getLastRow()-1)
    .getValues();
  let matchIndex = columnValues.map(e => e[0]).indexOf(eventJson.reader.serial_number);
  log(log.SUCCESS, `Found match for serial ${eventJson.reader.serial_number} at row ${matchIndex}`)

  if (matchIndex != -1) {
    matchIndex+=2 // To Offset back to 1 indexing
    let range = sheet.getRange(matchIndex, 1, 1, sheet.getLastColumn());
    log(log.STATUS, `Got cell range for matched scanner with last column ${sheet.getLastColumn()}`)
        log(log.STATUS, `Range values are: ${range.getValues()}`)

    let serialNumberCellRange = sheet.getRange(matchIndex, passSerialNumberColumnIndex);
    log(log.WARNING, range.getValues())

    const [serial, id, status, provisioned, attachedPassSerial, start, end, price] = range.getValues()[0];
    log(log.STATUS, serial, id, status, provisioned, attachedPassSerial, start, end, price)
    if (status === 'RESERVED' && attachedPassSerial !== eventJson.data.message) {
      throw new ScriptError('Requested resource is already in use by another pass.');
    }
    const eventTimestamp = new Date(eventJson.data.timeStamp);
    const eventTime = eventTimestamp.getHours() * 60 + eventTimestamp.getMinutes();
    const [startHours, startMinutes] = start.split(':');
    const [endHours, endMinutes] = end.split(':');
    const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
    const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);

    log(log.STATUS, 'Attempting to approve scan...', provisioned, startTime, endTime, eventTime)
    if (provisioned && startTime <= eventTime && eventTime <= endTime) {
      const scannerPayload = {request: status === 'AVAILABLE' ? 'RESERVED' : 'AVAILABLE'}
      log(log.SUCCESS, 'Approved scan, finalizing processing...')
      const scannerResponse = new PassNinjaScannerService().notifyScanner();

      const contactSheet = getSheet(ENUMS.CONTACTS, spreadsheet);
      log(log.WARNING, contactSheet.getLastRow())
      const contactPassSerials = contactSheet.getRange(startingRow, getColumnIndexFromString(contactSheet, 'serialNumber'), contactSheet.getLastRow()-1)
      
      log(log.STATUS, 'Attemping to find a match for event serial in contacts.')  
      const serialMatchIndex = contactPassSerials.getValues().map(e => e[0]).indexOf(eventJson.data.message);
      if (serialMatchIndex != -1) {
        log(log.SUCCESS, `Found match for attachedPassSerial in contacts in row ${serialMatchIndex}.`)
        const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
        const contactRange = contactSheet.getRange(serialMatchIndex + startingRow, 1, 1, passNinjaColumnStart - 1);
        const passJson = getRowPassPayload(contactRange);

        if (status === 'AVAILABLE') {
          serialNumberCellRange.setValue(eventJson.data.message);
          passJson.pass.lockerNumber = id;
          sheet.getRange(matchIndex, getColumnIndexFromString(sheet, 'status')).setValue('RESERVED');
          // need to set locker # in contacts
        } else {
          serialNumberCellRange.setValue('');
          passJson.pass.lockerNumber = 'unassigned';
          sheet.getRange(matchIndex, getColumnIndexFromString(sheet, 'status')).setValue('AVAILABLE');
        }

        const putResponse = new PassNinjaService().putPass(passJson, eventJson.data.message);
        log(log.STATUS, JSON.stringify(putResponse));
        return scannerPayload
      } else {
        log(log.ERROR, 'Could not find serial in the contacts sheet') 
      }
    }
  }
}

function testPost() {
  const payload = {
    reader: {
      type: 'FloBlePlus',
      serial_number: 'RR464-0017564',
      firmware: 'ACR1255U-J1 SWV 3.00.05'
    },
    uuid: '358bb260-62e2-11ea-a4c8-136282d9f83b',
    type: 'apple-pay',
    passTypeIdentifier: 'pass.com.passninja.ripped.beta',
    data: {
      timeStamp: '2020-03-10T15:17:04.789Z',
      message: '3bdc8ba0-aade-4d0d-84d6-38abe4ff4baa'
    }
  };
  addEvent(new VSpreadsheet(), JSON.stringify(payload))
}