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
            processScanEvent(eventJson.data);
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
async function processScanEvent(eventJson) {
    const sheet = getSheet(ENUMS.SCANNERS);
    // get serialNumber of scanner
    // find that scanner in scanner sheet
    // if no scanner, make scan in events RED .. or something?
    // if match, do validity checks.
    const startingRow = 2
    const columnValues = sheet.getRange(startingRow, getColumnIndexFromString(sheet, 'serialNumber'), sheet.getLastRow()).getValues();
    const matchIndex = columnValues.findIndex(eventJson.reader.serialNumber) + startingRow;

    if (matchIndex != -1) {
        let range = sheet.getRange(matchIndex, 1, 1, sheet.getLastColumn());

        let serialNumberCellRange = sheet.getRange(matchIndex, getColumnIndexFromString(sheet, 'attachedPassSerial'));
        const [serial, id, status, provisioned, passSerial, start, end, price] = range.getValues()[0]
        // const now = new Date()

        if (provisioned && !passSerial.length) { // && start < now && now < end ) {
            await new PassNinjaScannerService().notifyScanner({
                request: status === 'UNLOCKED' ? 'LOCK' : 'UNLOCK'
            })

            const contactSheet = getSheet(ENUMS.CONTACTS)
            const contactPassSerials = sheet.getRange(startingRow, getColumnIndexFromString(contactSheet, 'serialNumber'), sheet.getLastRow()).getValues();
            const serialMatchIndex = contactPassSerials.findIndex(passSerial) + startingRow;
            const contactRange = contactSheet.getRange(serialMatchIndex, 1, 1, contactSheet.getLastColumn());
            const passJSON = getRowPassPayload(contactRange)

            if (status === 'UNLOCKED') {
                serialNumberCellRange.setValue(passSerial)
                passJson.lockerNumber = id
            } else {
                serialNumberCellRange.setValue('')
                passJson.lockerNumber = 'unassigned'
            }

            new PassNinjaService().putPass(passJSON, eventJson.data.message)
            eventJson.data.serialNumber
        }
    } else {
        // Scanner not found logic
        // Add new scanner to the sheet?
        log(log.ERROR, eventJson)
    }
}