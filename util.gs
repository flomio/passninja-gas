var STATUS_LOOKUP = {
  success: {
    border: "#008000",
    color: "#000000",
    background: "#ADFF2F",
    bold: true
  },
  ok: {
    border: "#008000"
  },
  error: {
    border: "#000000",
    background: "#FF4500"
  }
};

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
    Browser.msgBox(
      "Error",
      Utilities.formatString('Row "%s" is not valid.', selectedRow),
      Browser.Buttons.OK
    );
    return false;
  }
  return rowNumber;
}

/** Returns the requested Google Sheet by name
 *
 * @param {string} sheetName Name of the sheet you want to get back
 * @returns {Sheet} Google Sheet object
 */
function getSheet(sheetName) {
  var spreadsheet = SpreadsheetApp.getActive();
  return spreadsheet.getSheetByName(sheetName);
}

/** Highlights a given range via custom status presets
 *
 * @param {Range} cells That you want to highlight
 * @param {string} status The type of higlighting you want to apply
 * @param {string} [value] Value to set the cell contents to
 */
function highlightCells(cells, status, value) {
  if (status === "error") Logger.log("error caught: ", value);
  if (value) cells.setValue(value);
  var statusColors = STATUS_LOOKUP[status];
  if (statusColors.border)
    cells.setBorder(
      true,
      true,
      true,
      true,
      true,
      true,
      statusColors.border,
      SpreadsheetApp.BorderStyle.SOLID
    );
  if (statusColors.background) cells.setBackground(statusColors.background);
  if (statusColors.color) cells.setFontColor(statusColors.color);
  if (statusColors.bold) cells.setFontWeight("bold");
}

/** Takes in a name and parses to an object with a name, lastName and secondLast Name
 *
 * @param {string} input Raw name
 * @returns {object} Object with the keys: name, lastName and secondLastName
 */
function parseName(input) {
  var fullName = input || "";
  var result = {};

  if (fullName.length > 0) {
    var nameTokens =
      fullName.match(
        /[A-ZÁ-ÚÑÜ][a-zá-úñü]+|([aeodlsz]+\s+)+[A-ZÁ-ÚÑÜ][a-zá-úñü]+/g
      ) || [];

    if (nameTokens.length > 3) {
      result.name = nameTokens.slice(0, 2).join(" ");
    } else {
      result.name = nameTokens.slice(0, 1).join(" ");
    }

    if (nameTokens.length > 2) {
      result.lastName = nameTokens.slice(-2, -1).join(" ");
      result.secondLastName = nameTokens.slice(-1).join(" ");
    } else {
      result.lastName = nameTokens.slice(-1).join(" ");
      result.secondLastName = "";
    }
  }

  return result;
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
    if (headers[i] == searchTerm) return i;
  }
  return -1;
}

/** Gets the column headers of the specified sheet
 *
 * @param {Sheet} sheet Google Sheet to query
 * @returns {array} The headers of the first column.
 */
function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/** Creates a JSON object from the first found match of the given serial number.
 *
 * @param {Sheet} sheet Google Sheet to query
 * @param {string} serialNumber Query string to match
 * @returns {object} The resulting match or an empty object if no match is found
 */
function findContactBySerial(sheet, serialNumber) {
  var serialNumberColumn = getColumnIndexFromString(sheet, "serialNumber");
  var serialNumberColumnData = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues();

  var matchIndex = findMatchIndexAtColumn(
    serialNumberColumnData,
    serialNumberColumn,
    serialNumber
  );

  if (matchIndex === -1) return {};
  return rowToJson(sheet, serialNumberColumnData[matchIndex]);
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

/** Creates an object from a sheet's first row headers as keys with the values from the data object.
 *
 * @param {Sheet} sheet String to query the column headers
 * @param {string[]} data Array of string data representing a row
 * @returns
 */
function rowToJson(sheet, data) {
  var obj = {};
  var keys = getHeaders(sheet);

  for (var i = 0; i < data.length; i++) {
    obj[keys[i]] = data[i];
  }

  return obj;
}
