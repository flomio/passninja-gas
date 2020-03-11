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
        'APPLE_SCAN',
        eventJson.passTypeIdentifier.replace('pass.com.passninja.', ''),
        eventJson.data.message,
        JSON.stringify(eventJson.data)
      ];
      processScanEvent(eventJson);
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
    return {
      error: `Invalid event data sent: ${e} ${JSON.stringify(eventJson)}`
    };
  }

  insertRow(targetSheet, event, 2, () => {
    autoResizeSheet(targetSheet);
    var range = targetSheet.getRange('A2:E2');
    flashRange(range, 'red', 1, 50);
    targetSheet.setActiveSelection(range);
  });

  log(log.SUCCESS, 'Successfully added event.');
  return {
    data: event
  };

  //return rowToJson(targetSheet, targetSheet.getRange('A2:E2'));
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
function processScanEvent(eventJson) {
  const sheet = getSheet(ENUMS.SCANNERS);
  const startingRow = 2;
  const columnValues = sheet
    .getRange(startingRow, getColumnIndexFromString(sheet, 'serialNumber'), sheet.getLastRow())
    .getValues();
  const matchIndex = columnValues.map(e => e[0]).indexOf(eventJson.reader.serial_number);

  if (matchIndex != -1) {
    let range = sheet.getRange(matchIndex + startingRow, 1, 1, sheet.getLastColumn());

    let serialNumberCellRange = sheet.getRange(
      matchIndex + startingRow,
      getColumnIndexFromString(sheet, 'attachedPassSerial')
    );

    const [serial, id, status, provisioned, attachedPassSerial, start, end, price] = range.getValues()[0];
    if (status === "RESERVED" && attachedPassSerial !== eventJson.data.message){
      throw new ScriptError('Requested resource is already in use by another pass.')
    }
    const eventTimestamp = new Date(eventJson.data.timeStamp)
    const eventTime = eventTimestamp.getHours() * 60 + eventTimestamp.getMinutes()
    const [startHours, startMinutes] = start.split(':')
    const [endHours, endMinutes] = end.split(':')
    const startTime = parseInt(startHours) * 60 + parseInt(startMinutes)
    const endTime = parseInt(endHours) * 60 + parseInt(endMinutes)
    
    if (provisioned && startTime <= eventTime && eventTime <= endTime) {
      new PassNinjaScannerService().notifyScanner({
        request: status === 'AVAILABLE' ? 'RESERVED' : 'AVAILABLE'
      });

      const contactSheet = getSheet(ENUMS.CONTACTS);
      const contactPassSerials = contactSheet
        .getRange(startingRow, getColumnIndexFromString(contactSheet, 'serialNumber'), contactSheet.getLastRow())
        .getValues();
      const serialMatchIndex = contactPassSerials.map(e => e[0]).indexOf(eventJson.data.message);

      if (serialMatchIndex != -1) {
        const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
        const contactRange = contactSheet.getRange(serialMatchIndex + startingRow, 1, 1, passNinjaColumnStart - 1);
        const passJson = getRowPassPayload(contactRange);

        if (status === 'AVAILABLE') {
          serialNumberCellRange.setValue(eventJson.data.message);
          passJson.pass.lockerNumber = id;
          sheet.getRange(matchIndex + startingRow, getColumnIndexFromString(sheet, 'status')).setValue('RESERVED');
          // need to set locker # in contacts
        } else {
          serialNumberCellRange.setValue('');
          passJson.pass.lockerNumber = 'unassigned';
          sheet.getRange(matchIndex + startingRow, getColumnIndexFromString(sheet, 'status')).setValue('AVAILABLE');
        }

        const putResponse = new PassNinjaService().putPass(passJson, eventJson.data.message);
        log(log.STATUS, JSON.stringify(putResponse));
        eventJson.data.serialNumber;
      } else {
        /*die*/
      }
    }
  } else {
    // Scanner not found logic
    // Add new scanner to the sheet?
    sheet.getRange(6, 1).setValue(eventJson);
  }
}

function testPost() {
const payload = {
  "reader": {
    "type": "FloBlePlus",
    "serial_number": "RR464-0017564",
    "firmware": "ACR1255U-J1 SWV 3.00.05"
  },
  "uuid": "358bb260-62e2-11ea-a4c8-136282d9f83b",
  "type": "apple-pay",
  "passTypeIdentifier": "pass.com.passninja.ripped.beta",
  "data": {
    "timeStamp": "2020-03-10T15:17:04.789Z",
    "message": "3bdc8ba0-aade-4d0d-84d6-38abe4ff4baa"
  }
}
processScanEvent(payload)
}
