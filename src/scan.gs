/**
 *  All functions relating to scanning feature
 * @module scan
 */

/** Generates a mock payload for a scan event that matches the format of a PN scan event
 *
 * @param {string} passType The passninja passtype
 * @param {string} serialNumber a UUID that matches a serial number in the Contacts sheet
 * @param {string} scannerSerialNumber a UUID that matches a scanner serial Number in the Scanners sheet
 * @returns {Object} Mock scan event payload with current time and relevant details
 */
function createMockScanPayload(passType, serialNumber, scannerSerialNumber) {
  log(log.FUNCTION, 'RUNNING createMockScanPayload');
  const payload = Object.assign(SCAN_TEMPLATE);
  const eventStart = new Date();
  const eventEnd = new Date(eventStart);
  eventEnd.setSeconds(eventEnd.getSeconds() + 5);
  payload.id = `#john@smith.com#${passType}#${Utilities.getUuid()}`;
  payload.date = formatDate(eventStart);
  payload.uuid = Utilities.getUuid();
  payload.event.serialNumber = serialNumber;
  payload.event.date = formatDate(eventEnd);
  payload.event.passType = passType;
  payload.event.platform = randomChoice(SCAN_PLATFORMS);
  payload.event.reader.serialNumber = scannerSerialNumber;

  log(log.FUNCTION, 'FINISHED createMockScanPayload');
  return payload;
}
/**
 * @typedef {Object} ScannerMatch
 * @property {number} scannerMatchIndex The matching index for the scanner row (-1 if not found)
 * @property {number} passSerialNumberColumnIndex The attached serial number column
 */

/** Finds a matching scanner from the scanner sheet or returns {-1, number}
 *
 * @param {Sheet} scannerSheet The sheet object for the Scanner sheet
 * @param {string} serialNumber a UUID for the scanner we are looking for
 * @returns {ScannerMatch}
 */
function getScanner(scannerSheet, serialNumber) {
  log(log.FUNCTION, 'STARTING getScanner');
  const serialNumberColumnIndex = getColumnIndexFromString(scannerSheet, 'serialNumber');
  const passSerialNumberColumnIndex = getColumnIndexFromString(scannerSheet, 'attachedPassSerial');
  const columnValues = scannerSheet
    .getRange(V_START_ROW_OFFSET, serialNumberColumnIndex, scannerSheet.getLastRow() - 1)
    .getValues();
  const scannerMatchIndex = columnValues.map(e => e[0]).indexOf(serialNumber);
  log(log.FUNCTION, 'ENDING getScanner');
  return { scannerMatchIndex, passSerialNumberColumnIndex };
}

/** Overall validation for business permission logic of scan event
 *
 * @param {string} status The scanner status, either: "RESERVED" | "AVAILABLE"
 * @param {string} eventPassSerial UUID of the scanned pass
 * @param {string} currentPassSerial UUID of the currently used pass, "" | UUID
 * @param {string} date The date of the scan event
 * @param {string} start The available start time for the scanner in format "HH:mm"
 * @param {string} end The available end time for the scanner in format "HH:mm"
 * @param {string} provisioned Whether we can use this scanner or not, TRUE | ""
 * @throws {ScriptError} If one of the validations is not passed it will throw a related error
 */
function validateScan(status, eventPassSerial, currentPassSerial, date, start, end, provisioned) {
  if (status === 'RESERVED') {
    if (currentPassSerial === '') {
      throw new ScriptError('Requested resource is marked in use but no pass is attached...manual fix required.');
    }
    if (currentPassSerial !== eventPassSerial) {
      throw new ScriptError('Requested resource is already in use by another pass.');
    }
  }

  const { eventTime, startTime, endTime } = getScannerEventTimes(date, start, end);
  if (!provisioned || !(startTime <= eventTime && eventTime <= endTime)) {
    const eventDate = new Date(date);
    throw new ScriptError(
      `Scan failed due to being outside scanner valid usage time: ${start}-${end}, scan: ${eventDate.getUTCHours()}:${eventDate.getUTCMinutes()}.`
    );
  }
}

/** Returns all times in a normalized format of total minutes
 *
 * @param {string} eventDate The date of the scan event
 * @param {string} scannerStart The available start time for the scanner in format "HH:mm"
 * @param {string} scannerEnd The available end time for the scanner in format "HH:mm"
 * @returns {Object} The formatted times in total minute format for { eventTime, startTime, endTime }
 * @throws {ScriptError} If the scanner fields are incorrectly formatted
 */
function getScannerEventTimes(eventDate, scannerStart, scannerEnd) {
  try {
    const eventTimestamp = new Date(eventDate);
    const eventTime = eventTimestamp.getUTCHours() * 60 + eventTimestamp.getUTCMinutes();
    const [startHours, startMinutes] = scannerStart.split(':');
    const [endHours, endMinutes] = scannerEnd.split(':');
    const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
    const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);
    return { eventTime, startTime, endTime };
  } catch (err) {
    throw new ScriptError(`Scanner start/end fields must be in the format: '##:##'`);
  }
}

/** Responsible for updating the scanner sheet from a scan event and PUT updating the scanned pass
 *
 * @param {Spreadsheet} ss
 * @param {Sheet} contactSheet
 * @param {Sheet} scannersSheet
 * @param {string} status The status of the scanner being used: "AVAILABLE" | "RESERVED"
 * @param {string} id The ID of the scanner to be added to the pass
 * @param {Range} serialNumberCellRange The range for the attachedPassSerialNumber entry in the Scanners sheet
 * @param {string} serialNumber The serial number of the scanned pass
 * @param {number} scannerMatchIndex Row index in the Scanners sheet for the matching scanner
 * @param {number} contactMatchIndex Row index in the Contacts sheet for the matching pass
 */
function updateScannerSheetAndPass(
  ss,
  contactSheet,
  scannersSheet,
  status,
  id,
  serialNumberCellRange,
  serialNumber,
  scannerMatchIndex,
  contactMatchIndex
) {
  log(log.FUNCTION, 'STARTING updateScannerSheetAndPass');
  const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
  const contactRange = contactSheet.getRange(contactMatchIndex + V_START_ROW_OFFSET, 1, 1, passNinjaColumnStart - 1);
  const passJson = getRowPassPayload(contactRange, ss);
  const statusIndex = getColumnIndexFromString(scannersSheet, ENUMS.STATUS);

  if (status === ENUMS.AVAILABLE) {
    serialNumberCellRange.setValue(serialNumber);
    passJson.pass.lockerNumber = id;
    scannersSheet.getRange(scannerMatchIndex, statusIndex).setValue(ENUMS.RESERVED);
  } else {
    serialNumberCellRange.setValue('');
    passJson.pass.lockerNumber = ENUMS.UNASSIGNED;
    scannersSheet.getRange(scannerMatchIndex, statusIndex).setValue(ENUMS.AVAILABLE);
  }

  log(log.STATUS, `Attempting to update pass ${serialNumber} with payload: ${passJson}`);
  try {
    new PassNinjaService().putPass(passJson, serialNumber);
  } catch (err) {
    log(log.ERROR, err);
  }
  log(log.FUNCTION, 'ENDING updateScannerSheetAndPass');
}

/** Finds a mtaching row number for the serial in question in the Contacts sheet
 *
 * @param {Sheet} contactSheet The object for Contacts sheet
 * @param {string} serialNumber The serial number to match
 * @returns {number} Row index if found, -1 if not
 */
function getRowSerialMatchIndex(contactSheet, serialNumber) {
  const contactPassSerials = contactSheet.getRange(
    V_START_ROW_OFFSET,
    getColumnIndexFromString(contactSheet, ENUMS.SERIAL),
    contactSheet.getLastRow() - 1
  );
  return contactPassSerials
    .getValues()
    .map(e => e[0])
    .indexOf(serialNumber);
}

/** Overall function responsible for processing an inbound scan event
 *
 * @param {Spreadsheet} ss The spreadsheet we are using to process the event
 * @param {Object} eventJson The incoming event json to be parsed
 * @returns {Object} The response from our sheet updating with any modifications
 * @throws {ScriptError} If we cannot find a matching scanner or matching pass will throw an error
 */
function processScanEvent(ss, eventJson) {
  log(log.FUNCTION, 'STARTING PROCESSSCANEVENT');
  log(log.STATUS, `Processing scan event from JSON: ${eventJson}`);
  const scannersSheet = getSheet(ENUMS.SCANNERS, ss);
  const { serialNumber, reader, date } = eventJson.event;
  const { scannerMatchIndex, passSerialNumberColumnIndex } = getScanner(scannersSheet, reader.serialNumber);

  if (scannerMatchIndex === -1) {
    throw new ScriptError(`Scan failed: Could not find scanner serial '${reader.serialNumber}' in Scanners sheet`);
  }

  log(log.SUCCESS, `Found match for serial ${reader.serialNumber} at row ${scannerMatchIndex}`);
  const virtualScannerIndex = scannerMatchIndex + V_START_ROW_OFFSET;
  const range = scannersSheet.getRange(virtualScannerIndex, 1, 1, scannersSheet.getLastColumn());
  const serialNumberCellRange = scannersSheet.getRange(virtualScannerIndex, passSerialNumberColumnIndex);
  const [, id, status, provisioned, attachedPassSerial, start, end] = range.getValues()[0];

  validateScan(status, serialNumber, attachedPassSerial, date, start, end, provisioned);
  log(log.SUCCESS, 'Scan is valid, processing...');
  const scannerPayload = { request: status === ENUMS.AVAILABLE ? ENUMS.RESERVED : ENUMS.AVAILABLE };
  const scannerResponse = new PassNinjaScannerService().notifyScanner(scannerPayload);
  log(log.STATUS, scannerResponse);

  const contactSheet = getSheet(ENUMS.CONTACTS, ss);
  const contactMatchIndex = getRowSerialMatchIndex(contactSheet, serialNumber);
  if (contactMatchIndex === -1) throw new ScriptError('Could not find serial in the contacts sheet.');
  log(log.SUCCESS, `Found match for attachedPassSerial in contacts in row ${contactMatchIndex}.`);

  updateScannerSheetAndPass(
    ss,
    contactSheet,
    scannersSheet,
    status,
    id,
    serialNumberCellRange,
    serialNumber,
    virtualScannerIndex,
    contactMatchIndex
  );
  autoResizeSheet(scannersSheet._internal);
  log(log.FUNCTION, 'ENDING PROCESSSCANEVENT');
  return scannerPayload;
}
