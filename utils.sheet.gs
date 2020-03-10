/** Attempts to return the spreadsheet connected to the GAS Script Project.
 *  Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet
 *  If multiple sheets have been programatically created it will only target the most recent.
 *
 * @returns {Spreadsheet} The spreadsheet that is linked to the GAS Script Project.
 */
function getLinkedSpreadsheet() {
  const fnRunner = [
    [SpreadsheetApp.getActive, []],
    [SpreadsheetApp.openById, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_ID, false)]],
    [SpreadsheetApp.openByUrl, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_URL, false)]]
  ];
  let ss = null;
  for ([fn, args] of fnRunner) {
    ss = fn(...args);
    if (ss) {
      log(log.SUCCESS, `Found spreadsheet ${ss.getName()}`);
      return ss;
    }
  }
  throw new ScriptError(
    'UTILS',
    `No linked/bound spreadsheet connected to GAS Project for user ${Session.getActiveUser().getEmail()}.`
  );
}

/** Returns an Script Project environment variable if found or throws an error.
 *
 * @param {string} name Name of the env var to query
 * @param {boolean} throwError Whether to throw an error or return null otherwise
 * @returns {string} The contents of the env variable
 * @returns {null} If no env variable is found under that name
 */
function getEnvVar(name, throwError = true) {
  const envVar = PropertiesService.getScriptProperties().getProperty(name);
  if (throwError && !envVar) throw new ScriptError('UTILS', `Script variable ${name} does not exist.`);
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
function getRowPassPayload(rowRange) {
  rowRange.setNumberFormat('@');
  const fieldsData = getConfigFields();
  const { passType, ...passFieldConstants } = getConfigConstants();
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
  log(log.SUCCESS, postData);
  return postData;
}

/** Returns an object with key:value pairs from the Config sheet
 */
function getConfigConstants() {
  const constants = Object.fromEntries(
    getLinkedSpreadsheet()
      .getRangeByName(ENUMS.CONFIG_CONSTANTS)
      .getValues()
      .filter(row => !!row[0])
  );
  if (!constants.passType) throw new ScriptError('UTILS', 'You must enter a passType in the Config sheet.');
  return constants;
}

/** Returns a list of config field entries
 */
function getConfigFields() {
  const fieldsData = getLinkedSpreadsheet()
    .getRangeByName(ENUMS.CONFIG_FIELDS)
    .getValues()
    .filter(row => !!row[0]);
  if (!fieldsData.length) throw new ScriptError('UTILS', 'You must enter at least one field in the Config sheet.');
  return fieldsData;
}
/** Sorts the specified sheet
 *
 * @param {Sheet} sheet The Google sheet to sort
 */
function sortSheet(sheet) {
  const range = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn());
  range.sort({ column: 1, ascending: false });
}

/** Returns the requested Google Sheet by name
 *
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName) {
  const spreadsheet = getLinkedSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new ScriptError('UTILS', `Sheet ${sheetName} not found in spreadsheet ${spreadsheet}`);
  return sheet;
}

/** Determines whether the selected row is valid
 *
 * @param {Sheet} sheet The Google Sheet to check against
 * @returns {int} The selected row number
 * @returns {boolean} If the selected row is invalid
 */
function getValidSheetSelectedRow(sheet) {
  const selectedRow = sheet.getActiveCell().getRow();
  const rowNumber = Number(selectedRow);
  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    throw new ScriptError('UTILS', `Row ${selectedRow} is not valid.`);
    return false;
  }
  return rowNumber;
}

/** Auto resizes all sheet columns
 *
 * @param {Sheet} sheet The sheet to resize
 */
function autoResizeSheet(sheet) {
  for (i = 1; i <= sheet.getMaxColumns(); i++) {
    sheet.autoResizeColumn(i);
  }
}

/** Deletes all columns from min->max on the given sheet
 *
 * @param {int} min The starting column index
 * @param {int} max The final column index
 */
function deleteUnusedColumns(min, max, sheet) {
  for (var i = max; i >= min; i--) {
    sheet.deleteColumn(i);
  }
}

/** Highlights a given range via custom status presets
 *
 * @param {Range} cells That you want to highlight
 * @param {string} status The type of higlighting you want to apply
 * @param {string} [value] Value to set the cell contents to
 */
function highlightCells(cells, status, value) {
  if (value) cells.setValue(value);
  const statusColors = STATUS_LOOKUP[status];
  if (statusColors.border)
    cells.setBorder(true, true, true, true, true, true, statusColors.border, SpreadsheetApp.BorderStyle.SOLID);
  if (statusColors.background) cells.setBackground(statusColors.background);
  if (statusColors.color) cells.setFontColor(statusColors.color);
  if (statusColors.bold) cells.setFontWeight('bold');
}

/** Creates an object from a sheet's first row headers as keys with the values from the data object.
 *
 * @param {Sheet} sheet String to query the column headers
 * @param {string[]} data Array of string data representing a row
 */
function rowToJson(sheet, data) {
  const obj = {};
  const keys = getHeaders(sheet);

  for (var i = 0; i < data.length; i++) {
    obj[keys[i]] = data[i];
  }

  return obj;
}

/** Inserts a row
 *  Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top
 * @param {Sheet} sheet Google Sheet to insert row data into
 * @param {string[]} rowData Array of string data to insert in the rows
 * @param {int} [index] Optional index to specify the insertion point
 */
function insertRow(sheet, rowData, index, cb) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const rowIndex = index || 1;
    sheet
      .insertRowBefore(rowIndex)
      .getRange(rowIndex, 1, 1, rowData.length)
      .setValues([rowData]);
    SpreadsheetApp.flush();
    cb && cb();
  } finally {
    lock.releaseLock();
  }
}

/** Returns first found matching column (searches first row of the sheet)
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} searchTerm Search term
 * @returns {int} The first found column index, -1 if not found
 */
function getColumnIndexFromString(sheet, searchTerm) {
  const headers = getHeaders(sheet);
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] == searchTerm) return i + 1;
  }
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
    .filter(e => e.getName() === name)[0]
    .getRange();
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
    const matches = spreadsheet.getSheets().filter(sheet => {
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

/** Returns the file ID of the current spreadsheet.
 *
 * @returns {string} - The file ID or undefined if not found.
 */
function getFileId() {
  const files = DriveApp.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName() == DriveApp.getFileById(current.getId())) {
      return file.getId();
    }
  }
}

/** Toasts the user at the current spreadsheet
 *
 * @param {string} msg The message to sent
 * @param {string} title The title of the toast
 * @param {int} timeout The timeout of the toast
 */
function toast(msg, title, timeout) {
  const currentSpreadsheet = getLinkedSpreadsheet();
  currentSpreadsheet.toast(msg, title, timeout);
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

/** Runs the function and catches then throws any error and logs it.
 *
 * @param {string} error Error to log
 * @param {string} msg The extra message to add
 */
function catchError(fn, errorMsg) {
  try {
    return fn();
  } catch (e) {
    log(log.ERROR, errorMsg, e);
    throw new ScriptError('BUILD', errorMsg, e);
  }
}
