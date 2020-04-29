/**
 *  General sheet helper functions
 * @module utils.sheet
 */

/** Attempts to return the spreadsheet connected to the GAS Script Project.
 *  Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet
 *  If multiple sheets have been programatically created it will only target the most recent.
 *
 * @returns {Spreadsheet} The spreadsheet that is linked to the GAS Script Project.
 */
function getLinkedSpreadsheet() {
  log(log.FUNCTION, 'STARTING getLinkedSpreadsheet');
  const fnRunner = [
    [SpreadsheetApp.getActive, []],
    [SpreadsheetApp.openById, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_ID, false)]],
    [SpreadsheetApp.openByUrl, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_URL, false)]]
  ];
  let ss = null;
  for ([fn, args] of fnRunner) {
    ss = fn(...args);
    if (ss) {
      log(log.FUNCTION, 'ENDING getLinkedSpreadsheet');
      log(log.SUCCESS, `Found spreadsheet ${ss.getName()}`);
      return ss;
    }
  }
  throw new UtilsError(
    `No linked/bound spreadsheet connected to GAS Project for user ${Session.getActiveUser().getEmail()}.`
  );
}

/** Creates a JSON object from the first found match of the given serial number.
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} serialNumber Query string to match
 * @returns {object} The resulting match or an empty object if no match is found
 */
function rowToJSONFromSerial(sheet, serialNumber) {
  const serialNumberColumn = getColumnIndexFromString(sheet, 'serialNumber') - 1;
  const serialNumberColumnData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  const matchIndex = findMatchIndexAtColumn(serialNumberColumnData, serialNumberColumn, serialNumber);

  if (matchIndex === -1) return {};
  return rowToJson(sheet, serialNumberColumnData[matchIndex]);
}

/** Retrieves the url for the script dev deployment
 *
 * @returns {string} the url for the script dev deployment
 */
const getDevDeploymentUrl = () => ScriptApp.getService().getUrl();

/** Retrieves the url to open the script
 *
 * @returns {string} the url for the connected script
 */
const getScriptUrl = () => `https://script.google.com/d/${ScriptApp.getScriptId()}/edit`;

/** Returns an Script Project environment variable if found or throws an error.
 *
 * @param {string} name Name of the env var to query
 * @param {boolean} throwError Whether to throw an error or return null otherwise
 * @returns {string} The contents of the env variable
 * @returns {null} If no env variable is found under that name
 */
function getEnvVar(name, throwError = true) {
  const envVar = PropertiesService.getScriptProperties().getProperty(name);
  if (throwError && !envVar) throw new UtilsError(`Script variable ${name} does not exist.`);
  return envVar;
}

/** Sets an Script Project environment variable.
 *
 * @param {string} name Name of the env var to query
 * @param {string} value The value you set
 * @returns {Properties} The Properties store, for chaining
 */
function setEnvVar(name, value) {
  return PropertiesService.getScriptProperties().setProperty(name, value);
}

/** Filters out non-pass related row entries and converts to JSON.
 *
 * @param {Range} rowRange Row range to query
 */
function getRowPassPayload(rowRange, spreadsheet) {
  log(log.FUNCTION, 'STARTING getRowPassPayload');
  const fieldsData = getConfigFields(spreadsheet);
  const { passType, ...passFieldConstants } = getConfigConstants(spreadsheet);
  const rowValues = rowRange.getValues()[0];
  log(log.STATUS, `Working on row #${rowRange.getRow()} with values [${rowValues}]`);
  const postData = {
    passType,
    pass: passFieldConstants
  };

  for (i = 0; i < rowValues.length; i++) {
    const [fieldName, fieldIncluded] = fieldsData[i];
    if (fieldIncluded === 'Y') {
      log(log.SUCCESS, `Added (${fieldName}: ${rowValues[i]}) to POST payload.`);
      postData.pass[fieldName] = rowValues[i];
    }
  }
  log(log.FUNCTION, 'ENDING getRowPassPayload');
  return postData;
}

/** Returns an object with key:value pairs from the Config sheet
 */
function getConfigConstants(spreadsheet) {
  log(log.FUNCTION, 'STARTING getConfigConstants');
  const constants = Object.fromEntries(
    spreadsheet
      .getRangeByName(ENUMS.CONFIG_CONSTANTS)
      .getValues()
      .filter((row) => !!row[0])
  );
  if (!constants.passType) throw new UtilsError('You must enter a passType in the Config sheet.');
  log(log.FUNCTION, 'ENDING getConfigConstants');
  return constants;
}

/** Returns a list of config field entries
 */
function getConfigFields(spreadsheet) {
  log(log.FUNCTION, 'STARTING getConfigFields');
  const fieldsData = spreadsheet
    .getRangeByName(ENUMS.CONFIG_FIELDS)
    .getValues()
    .filter((row) => !!row[0]);
  if (!fieldsData.length) throw new UtilsError('You must enter at least one field in the Config sheet.');
  log(log.FUNCTION, 'ENDING getConfigFields');
  return fieldsData;
}

function getAllFuncs(toCheck) {
  var props = [];
  var obj = toCheck;
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)));

  return props.sort().filter(function (e, i, arr) {
    if (e != arr[i + 1] && typeof toCheck[e] == 'function') return true;
  });
}

/** Returns the requested Google Sheet by name
 *
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName, ss) {
  log(log.FUNCTION, 'STARTING sheetName');
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new UtilsError(`Sheet ${sheetName} not found in spreadsheet ${ss}`);
  log(log.FUNCTION, 'ENDING sheetName');
  return sheet;
}

/** Determines whether the selected row is valid
 *
 * @param {Sheet} sheet The Google Sheet to check against
 * @returns {int} The selected row number
 * @returns {boolean} If the selected row is invalid
 */
function getValidSheetSelectedRow(sheet) {
  log(log.FUNCTION, 'STARTING getValidSheetSelectedRow');
  const selectedRow = sheet.getActiveCell().getRow();
  const rowNumber = Number(selectedRow);
  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    throw new UtilsError(`Row ${selectedRow} is not valid.`);
    return false;
  }
  log(log.FUNCTION, 'ENDING getValidSheetSelectedRow');
  return rowNumber;
}

/** Auto resizes all sheet columns
 *
 * @param {Sheet} sheet The sheet to resize
 */
function autoResizeSheet(sheet) {
  log(log.FUNCTION, 'STARTING autoResizeSheet');
  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, sheet.getMaxColumns());
  log(log.FUNCTION, 'ENDING autoResizeSheet');
}

/** Deletes all columns from last column with data to the end on the given sheet
 *
 * @param {Sheet} sheet The sheet to modify
 */
function autoDeleteUnusedColumns(sheet) {
  log(log.FUNCTION, 'STARTING autoDeleteUnusedColumns');
  const lastContentColumn = sheet.getLastColumn();
  const lastColumn = sheet.getMaxColumns();
  if (lastContentColumn < lastColumn) {
    log(log.WARNING, `Deleting columns ${lastContentColumn}-${lastColumn} on sheet ${sheet.getName()}`);
    sheet.deleteColumns(lastContentColumn + 1, lastColumn - lastContentColumn);
  }
  log(log.FUNCTION, 'ENDING autoDeleteUnusedColumns');
}

/** Shrinks sheet to specified number of rows
 *
 * @param {int} numRowsKeep The number of rows to keep
 */
function shrinkSheetRows(sheet, numRowsKeep) {
  log(log.FUNCTION, 'STARTING shrinkSheetRows');
  const lastRow = sheet.getMaxRows();
  if (numRowsKeep < lastRow) {
    log(log.WARNING, `Deleting rows ${numRowsKeep}-${lastRow} on sheet ${sheet.getName()}`);
    sheet.deleteRows(numRowsKeep, lastRow - numRowsKeep);
  }
  log(log.FUNCTION, 'ENDING shrinkSheetRows');
}

/** Highlights a given range via custom status presets
 *
 * @param {Range} range That you want to highlight
 * @param {string} status The type of higlighting you want to apply
 * @param {string} [value] Value to set the cell contents to
 */
function highlightRange(range, status, value) {
  log(log.FUNCTION, 'STARTING highlightRange');
  if (value) range.setValue(value);
  const statusColors = STATUS_LOOKUP[status];
  if (statusColors.border)
    range.setBorder(true, true, true, true, true, true, statusColors.border, SpreadsheetApp.BorderStyle.SOLID);
  if (statusColors.background) range.setBackground(statusColors.background);
  if (statusColors.color) range.setFontColor(statusColors.color);
  if (statusColors.bold) range.setFontWeight('bold');
  log(log.FUNCTION, 'ENDING highlightRange');
}

/** Creates an object from a sheet's first row headers as keys with the values from the data object.
 *
 * @param {Sheet} sheet String to query the column headers
 * @param {string[]} data Array of string data representing a row
 */
function rowToJson(sheet, data) {
  log(log.FUNCTION, 'STARTING rowToJson');
  const obj = {};
  const keys = getHeaders(sheet);

  for (var i = 0; i < data.length; i++) {
    obj[keys[i]] = data[i];
  }

  log(log.FUNCTION, 'ENDING rowToJson');
  return obj;
}

/** Inserts a row
 *  Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top
 * @param {Sheet} sheet Google Sheet to insert row data into
 * @param {string[]} rowData Array of string data to insert in the rows
 * @param {int} [index] Optional index to specify the insertion point
 */
function insertRow(sheet, rowData, index, cb) {
  log(log.FUNCTION, 'STARTING insertRow');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const rowIndex = index || 1;
    log(log.STATUS, `${sheet.getName()}.insertRow ${rowIndex}-${rowIndex + 1} columns ${1}-${1 + rowData.length}`);
    sheet.insertRowBefore(rowIndex).getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    SpreadsheetApp.flush();
    cb && cb();
  } finally {
    lock.releaseLock();
  }
  log(log.FUNCTION, 'ENDING insertRow');
}

/** Returns first found matching column (searches first row of the sheet)
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} searchTerm Search term
 * @returns {int} The first found column index, -1 if not found
 */
function getColumnIndexFromString(sheet, searchTerm) {
  log(log.FUNCTION, 'STARTING getColumnIndexFromString');
  const headers = getHeaders(sheet);
  log(log.STATUS, `Got headers: ${headers}`);
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] == searchTerm) {
      log(log.STATUS, `Header ${searchTerm} found at column ${i + 1}`);
      return i + 1;
    }
  }
  log(log.FUNCTION, 'ENDING getColumnIndexFromString');
  return -1;
}

/** Gets the column headers of the specified sheet
 *
 * @param {Sheet} sheet Google Sheet to query
 * @returns {array} The headers of the first row.
 */
function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/** Gets the named range of the given spreadsheet
 *
 * @param {string} name The name of the named range to query
 * @param {Spreadsheet} ss The Google spreadsheet to query
 * @returns {Range} The resulting range
 */
function getNamedRange(name, ss) {
  return ss
    .getNamedRanges()
    .filter((e) => e.getName() === name)[0]
    .getRange();
}

/** Flashes a row of a sheet
 *  Note: the range will end overridden with the top left's background color.
 *
 * @param {Range} range Range to flash across
 * @param {string} flashColor Valid Google SpreadSheet color to flash
 * @param {int} numFlashes Number of times to flash the range
 * @param {int} timeout The timeout (in ms) for the flashes
 */
function flashRange(range, flashColor, numFlashes, timeout) {
  const originalBgColor = range.getBackground();
  for (var i = 0; i < numFlashes; i++) {
    range.setBackground(flashColor);
    SpreadsheetApp.flush();
    Utilities.sleep(timeout);
    range.setBackground(originalBgColor);
    SpreadsheetApp.flush();
  }
}

/** Clears all previous form items from a form
 *
 * @param {Form} form The Google Form to clear
 */
function clearForm(form) {
  const items = form.getItems();
  while (items.length > 0) {
    form.deleteItem(items.pop());
  }
}

function getSelectedContactData(ss) {
  log(log.FUNCTION, 'RUNNING getSelectedContactData');
  try {
    const contactSheet = getSheet(ENUMS.CONTACTS, ss);
    const rowNumber = getValidSheetSelectedRow(contactSheet);

    const serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
    const serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex);
    const serialNumber = serialNumberRange.getValue();

    const passTypeColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.PASSTYPE);
    const passTypeRange = contactSheet.getRange(rowNumber, passTypeColumnIndex);
    const passType = passTypeRange.getValue();

    log(log.STATUS, `Selected contact info: ${serialNumber}, ${passType}`);
    log(log.FUNCTION, 'FINISHED getSelectedContactData');
    return { passType, serialNumber };
  } catch (err) {
    throw new ScriptError(`Could not find contact fields for serialNumber or passType: ${err}`);
  }
}

/** Returns the matching sheet that the form is dumping into
 *
 * @param {Form} form A Google Form
 * @returns {Sheet} The Google Sheet that is recording the responses
 * @returns {null} If no matching sheet is linked.
 */
function getFormDestinationSheet(form) {
  const formId = form.getId();
  const destinationId = form.getDestinationId();
  if (destinationId) {
    const spreadsheet = SpreadsheetApp.openById(destinationId);
    const matches = spreadsheet.getSheets().filter((sheet) => {
      const url = sheet.getFormUrl();
      return url && url.indexOf(formId) > -1;
    });
    if (matches.length) return matches[0];
  }
  return null;
}

/** Deletes and returns the data from the previous form response sheet
 *
 * @param {Form} form A Google Form
 * @param {Spreadsheet} ss The Google spreadsheet to relink to
 * @returns {null} If no matching sheet is linked.
 */
function clearFormDestinationSheet(form) {
  const destinationSheet = getFormDestinationSheet(form);
  form.removeDestination();
  form.deleteAllResponses();
  destinationSheet.setName(`${destinationSheet.getName()}_${new Date().toISOString().replace(/[:]/g, '.')}`);
  destinationSheet.hideSheet();
}
