const SCAN_PLATFORMS = ['apple-wallet', 'google-pay'];
const SCAN_TEMPLATE = {
  id: '', // #john@smith.com#dev.andres#<uuid>
  date: '', // timestamp
  callback: `https://script.google.com/macros/s/${Utilities.getUuid()}/exec`, // fake deployment url
  event: {
    serialNumber: '', // uuid
    date: '', // timestamp
    passType: '', // dev.andres
    type: 'PASS_SCAN',
    platform: '', // apple-wallet | google-pay
    reader: {
      type: 'FloBlePlus',
      serialNumber: '', // Arbitrary, default is RR464-0017564
      firmware: 'ACR1255U-J1 SWV 3.00.05'
    },
    uuid: '' // uuid
  }
};
const V_START_ROW_OFFSET = 2;

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
  const virtualScannerIndex = scannerMatchIndex + 2; // To Offset back to 1 indexing
  const range = scannersSheet.getRange(virtualScannerIndex, 1, 1, scannersSheet.getLastColumn());
  const serialNumberCellRange = scannersSheet.getRange(virtualScannerIndex, passSerialNumberColumnIndex);
  const [serial, id, status, provisioned, attachedPassSerial, start, end, price] = range.getValues()[0];

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
