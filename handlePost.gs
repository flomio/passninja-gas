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
  log('FUNCTION', 'STARTING ADD EVENT');
  let event;
  let scan = false;
  const sheet = getSheet(ENUMS.EVENTS, spreadsheet);
  const callback = () => {
    spreadsheet.flush();
    log(log.FUNCTION, 'TECHNICALLY ALL LOGIC IS FINISHED, FLASHING FOLLOWS.');
    autoResizeSheet(sheet._internal);
    var range = sheet._internal.getRange('A2:E2');
    flashRange(range, 'red', 2, 50);
    sheet.setActiveSelection(range);
  };

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
    // insertRow(
    //   sheet,
    //   [
    //     new Date().toUTCString(),
    //     'SCAN_RESPONSE',
    //     eventJson.passTypeIdentifier.replace('pass.com.passninja.', ''),
    //     eventJson.data.message,
    //     ,
    //     JSON.stringify(processResponse)
    //   ],
    //   2,
    //   callback
    // );
  }

  insertRow(sheet, event, 2, callback);

  log('FUNCTION', 'ENDING ADD EVENT');
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
  log('FUNCTION', 'STARTING PROCESSSCANEVENT');
  const sheet = getSheet(ENUMS.SCANNERS, spreadsheet);
  const startingRow = 2;
  const serialNumberColumnIndex = getColumnIndexFromString(sheet, 'serialNumber');
  const passSerialNumberColumnIndex = getColumnIndexFromString(sheet, 'attachedPassSerial');
  const columnValues = sheet.getRange(startingRow, serialNumberColumnIndex, sheet.getLastRow() - 1).getValues();
  let matchIndex = columnValues.map(e => e[0]).indexOf(eventJson.reader.serial_number);

  if (matchIndex != -1) {
    log(log.SUCCESS, `Found match for serial ${eventJson.reader.serial_number} at row ${matchIndex}`);
    matchIndex += 2; // To Offset back to 1 indexing
    let range = sheet.getRange(matchIndex, 1, 1, sheet.getLastColumn());
    let serialNumberCellRange = sheet.getRange(matchIndex, passSerialNumberColumnIndex);
    const [serial, id, status, provisioned, attachedPassSerial, start, end, price] = range.getValues()[0];

    if (status === 'RESERVED') {
      if (attachedPassSerial === '') {
        throw new ScriptError('Requested resource is marked in use but no pass is attached...manual fix required.');
      }
      if (attachedPassSerial !== eventJson.data.message) {
        throw new ScriptError('Requested resource is already in use by another pass.');
      }
    }

    const eventTimestamp = new Date(eventJson.data.timeStamp);
    const eventTime = eventTimestamp.getHours() * 60 + eventTimestamp.getMinutes();
    const [startHours, startMinutes] = start.split(':');
    const [endHours, endMinutes] = end.split(':');
    const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
    const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);

    if (provisioned && startTime <= eventTime && eventTime <= endTime) {
      log(log.SUCCESS, 'Approved scan, finalizing processing...');
      const scannerPayload = { request: status === 'AVAILABLE' ? 'RESERVED' : 'AVAILABLE' };
      const scannerResponse = new PassNinjaScannerService().notifyScanner();

      const contactSheet = getSheet(ENUMS.CONTACTS, spreadsheet);
      const contactPassSerials = contactSheet.getRange(
        startingRow,
        getColumnIndexFromString(contactSheet, 'serialNumber'),
        contactSheet.getLastRow() - 1
      );

      const serialMatchIndex = contactPassSerials
        .getValues()
        .map(e => e[0])
        .indexOf(eventJson.data.message);
      if (serialMatchIndex != -1) {
        log(log.SUCCESS, `Found match for attachedPassSerial in contacts in row ${serialMatchIndex}.`);
        const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
        const contactRange = contactSheet.getRange(serialMatchIndex + startingRow, 1, 1, passNinjaColumnStart - 1);
        const passJson = getRowPassPayload(contactRange, spreadsheet);

        if (status === 'AVAILABLE') {
          serialNumberCellRange.setValue(eventJson.data.message);
          passJson.pass.lockerNumber = id;
          sheet.getRange(matchIndex, getColumnIndexFromString(sheet, 'status')).setValue('RESERVED');
        } else {
          serialNumberCellRange.setValue('');
          passJson.pass.lockerNumber = 'unassigned';
          sheet.getRange(matchIndex, getColumnIndexFromString(sheet, 'status')).setValue('AVAILABLE');
        }

        const putResponse = new PassNinjaService().putPass(passJson, eventJson.data.message);
        log('FUNCTION', 'ENDING PROCESSSCANEVENT');
        return scannerPayload;
      } else {
        log(log.ERROR, 'Could not find serial in the contacts sheet');
      }
    }
  }
}
