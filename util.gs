/** Attempts to return the spreadsheet connected to the GAS Script Project.
 *  Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet
 *  If multiple sheets have been programatically created it will only target the most recent.
 *
 * @returns {Spreadsheet} The spreadsheet that is linked to the GAS Script Project.
 */
function getLinkedSpreadsheet() {
  var fnRunner = [
    [SpreadsheetApp.getActive, []],
    [SpreadsheetApp.openById, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_ID, false)]],
    [SpreadsheetApp.openByUrl, [getEnvVar(ENUMS.CURRENT_SPREADSHEET_URL, false)]]
  ];
  var ss = null;
  for ([fn, args] of fnRunner) {
    log(log.STATUS, `Running function ${fn.name} with args ${args}`);
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
  var envVar = PropertiesService.getScriptProperties().getProperty(name);
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
 * @param {Spreadsheet} ss Spreadsheet to query for Config NamedRange
 * @param {Range} rowRange Row range to query
 */
function getRowPassPayload(ss, rowRange, fieldsData) {
  rowRange.setNumberFormat('@');
  var fieldsData = getConfigFields();
  var { passType, ...passFieldConstants } = getConfigConstants();
  var rowValues = rowRange.getValues()[0];
  log(log.STATUS, `Working on row #${rowRange.getRow()} with values [${rowValues}]`);
  var postData = {
    passType,
    pass: passFieldConstants
  };

  for (i = 0; i < rowValues.length; i++) {
    var [fieldName, fieldIncluded] = fieldsData[i];
    if (fieldIncluded === 'Y') {
      log(log.SUCCESS, `Added (${fieldName}: ${rowValues[i]}) to POST payload.`);
      postData.pass[fieldName] = rowValues[i];
    }
  }
  return postData;
}

/** Returns an object with key:value pairs from the Config sheet
 */
function getConfigConstants() {
  var constants = Object.fromEntries(
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
  var fieldsData = getLinkedSpreadsheet()
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
  var range = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn());
  range.sort({ column: 1, ascending: false });
}

/** Returns the requested Google Sheet by name
 *
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName) {
  var spreadsheet = getLinkedSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
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
  var selectedRow = sheet.getActiveCell().getRow();
  var rowNumber = Number(selectedRow);
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
  var statusColors = STATUS_LOOKUP[status];
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
  var obj = {};
  var keys = getHeaders(sheet);

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
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var index = index || 1;
    sheet
      .insertRowBefore(index)
      .getRange(index, 1, 1, rowData.length)
      .setValues([rowData]);
    SpreadsheetApp.flush();
    cb && cb();
  } finally {
    lock.releaseLock();
  }
}

/** Returns the index of the matching query in the 2D array at column index.
 *
 * @param {array} arr 2D Array to query
 * @param {int} column Index at second level to query
 * @param {string} query Query term
 * @returns {int} Query match index or -1 if not found
 */
function findMatchIndexAtColumn(arr, column, query) {
  var matchIndex = -1;
  for (i = 1; i < arr.length; ++i) {
    if (arr[i][column] == query) {
      matchIndex = i;
      break;
    }
  }
  return matchIndex;
}

/** Returns first found matching column (searches first row of the sheet)
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} searchTerm Search term
 * @returns {int} The first found column index, -1 if not found
 */
function getColumnIndexFromString(sheet, searchTerm) {
  var headers = getHeaders(sheet);
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
  var items = form.getItems();
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
  var destinationSheet = getFormDestinationSheet(form);
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
  var files = DriveApp.getFiles();
  while (files.hasNext()) {
    var file = files.next();
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
  var currentSpreadsheet = getLinkedSpreadsheet();
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
  var originalBgColor = range.getBackground();
  for (var i = 0; i < numFlashes; i++) {
    range.setBackground(flashColor);
    SpreadsheetApp.flush();
    Utilities.sleep(timeout);
    range.setBackground(originalBgColor);
    SpreadsheetApp.flush();
  }
}

/** Takes in a name and parses to an object with a name, lastName and secondLast Name
 *
 * @param {string} input Raw name
 * @returns {object} Object with the keys: name, lastName and secondLastName
 */
function parseName(input) {
  var fullName = input || '';
  var result = {};

  if (fullName.length > 0) {
    var nameTokens = fullName.match(/[A-ZÁ-ÚÑÜ][a-zá-úñü]+|([aeodlsz]+\s+)+[A-ZÁ-ÚÑÜ][a-zá-úñü]+/g) || [];

    if (nameTokens.length > 3) {
      result.name = nameTokens.slice(0, 2).join(' ');
    } else {
      result.name = nameTokens.slice(0, 1).join(' ');
    }

    if (nameTokens.length > 2) {
      result.lastName = nameTokens.slice(-2, -1).join(' ');
      result.secondLastName = nameTokens.slice(-1).join(' ');
    } else {
      result.lastName = nameTokens.slice(-1).join(' ');
      result.secondLastName = '';
    }
  }

  return result;
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

/** You can get a MD5 hash value and even a 4digit short Hash value of a string.
 * Latest version:
 *   https://gist.github.com/KEINOS/78cc23f37e55e848905fc4224483763d
 * Author:
 *   KEINOS @ https://github.com/keinos
 *
 * @param {string} input The value to hash.
 * @param {boolean} isShortMode Set true for 4 digit shortend hash, else returns usual MD5 hash.
 * @return {string} The hashed input
 * @customfunction
 *
 */
function MD5(input, isShortMode) {
  var txtHash = '';
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input, Utilities.Charset.UTF_8);
  var isShortMode = isShortMode == true ? true : false;

  if (!isShortMode) {
    for (i = 0; i < rawHash.length; i++) {
      var hashVal = rawHash[i];
      if (hashVal < 0) hashVal += 256;
      if (hashVal.toString(16).length == 1) txtHash += '0';
      txtHash += hashVal.toString(16);
    }
  } else {
    for (j = 0; j < 16; j += 8) {
      hashVal =
        (rawHash[j] + rawHash[j + 1] + rawHash[j + 2] + rawHash[j + 3]) ^
        (rawHash[j + 4] + rawHash[j + 5] + rawHash[j + 6] + rawHash[j + 7]);

      if (hashVal < 0) hashVal += 1024;
      if (hashVal.toString(36).length == 1) txtHash += '0';
      txtHash += hashVal.toString(36);
    }
  }
  return txtHash.toUpperCase();
}
