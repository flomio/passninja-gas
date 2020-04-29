/**
 *  Implementation for cached/virtual spreadsheets to reduce slow sheet queries
 * @module virtualization
 */
class VSpreadsheet {
  constructor() {
    this._internal = getLinkedSpreadsheet();
    this.sheets = {};
  }

  getRangeByName(name) {
    return this._internal.getRangeByName(name);
  }

  getSheetByName(name) {
    const sheet = this.sheets[name] || this._internal.getSheetByName(name);
    if (sheet) {
      this.sheets[name] = new VSheet(sheet);
      return this.sheets[name];
    } else {
      throw new ScriptError(`Could not find sheet: ${name}`);
    }
  }

  getId() {
    return this._internal.getId();
  }

  getNamedRanges() {
    return this._internal.getNamedRanges();
  }

  flush() {
    log(log.VIRTUAL, 'FLUSHING SHEETS');
    if (Object.keys(this.sheets).length) {
      for (let sheetName in this.sheets) {
        log(log.VIRTUAL, `FLUSHING SHEET ${sheetName}`);
        this.sheets[sheetName].flush();
      }
    } else {
      log(log.VIRTUAL, 'SHEET FLUSH SKIPPED, PREVIOUSLY FLUSHED');
    }
    this.sheets = {};
  }
}

class VSheet {
  constructor(sheet) {
    this._internal = sheet;
    this.name = this._internal.getName();
    this.lastRow = this._internal.getLastRow();
    this.lastCol = this._internal.getLastColumn();
    this.maxRow = this._internal.getMaxRows();
    this.maxCol = this._internal.getMaxColumns();
    log(log.VIRTUAL, `Sheet ${this.name} has ${this.maxRow} rows and ${this.maxCol} columns.`);
    this.rows = sheet.getRange(1, 1, this.maxRow, this.maxCol).getValues();
  }

  flush() {
    log(log.VIRTUAL, `Flushing virtual sheet ${this._internal.getName()}:`);
    this.rows.forEach((row) => log(log.VIRTUAL, `[${row.map((val) => String(val).substring(0, 10)).join(', ')}]`));
    log(log.VIRTUAL, `Overwriting actual spreadsheet range: 1-${this.maxRow + 1}, 1-${this.maxCol + 1}`);
    return this._internal.getRange(1, 1, this.maxRow, this.maxCol).setValues(this.rows);
  }

  getActiveCell() {
    return this._internal.getActiveCell();
  }

  setActiveSelection(range) {
    return this._internal.setActiveSelection(range);
  }

  insertRowBefore(rowIndex) {
    log(log.VIRTUAL, `Rows before...`, this.rows);
    this.rows.splice(rowIndex - 1, 0, Array(this.maxCol).fill(''));
    log(log.VIRTUAL, `Rows after...`, this.rows);
    this.maxRow++;
    return this;
  }

  insertColBefore(colIndex) {
    this.rows.forEach((row) => row.splice(colIndex - 1, 0, ''));
    this.maxCol++;
    return this;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this._internal.getId();
  }

  getLastColumn() {
    return this.lastCol;
  }

  getLastRow() {
    return this.lastRow;
  }

  getMaxColumns() {
    return this.maxCol;
  }

  getMaxRows() {
    return this.maxRow;
  }

  getRange(row, col, numRows = 1, numColumns = 1) {
    log(log.VIRTUAL, `Attempting to ${this.name}.getRange(${row}, ${col}, ${numRows}, ${numColumns})`);
    return new VRange(this.rows, row, col, numRows, numColumns);
  }
}

class VRange {
  constructor(rows, row, col, numRows = 1, numColumns = 1) {
    log(log.VIRTUAL, `Creating range from row ${row}-${row + numRows} and columns ${col}-${col + numColumns}`, row < 1);
    if (row < 1 || col < 1 || numRows < 1 || numColumns < 1) {
      throw new ScriptError('Cannot create a VRange with any parameter < 1');
    }
    if (
      (row > rows.length || row - 1 + numRows > rows.length) &&
      (col - 1 + numColumns > rows[0].length || col > rows[0].length)
    ) {
      throw new ScriptError('Cannot create a VRange out of bounds of source data');
    }
    this.rows = rows;
    this.row = row;
    this.col = col;
    this.numRows = numRows;
    this.numColumns = numColumns;
  }

  getColumn() {
    return this.col;
  }

  getRow() {
    return this.row;
  }

  getValue() {
    return this.rows[this.row - 1][this.col - 1];
  }

  getValues() {
    const result = [];
    for (let i = this.row; i <= this.row + this.numRows - 1; i++) {
      const row = [];
      for (let j = this.col; j <= this.col + this.numColumns - 1; j++) {
        row.push(this.rows[i - 1][j - 1]);
      }
      result.push(row);
    }
    return result;
  }

  setValue(value) {
    log(log.VIRTUAL, `Attempting to set single value ${value} at position ${this.row}, ${this.col}`);
    this.rows[this.row - 1][this.col - 1] = value;
  }

  setValues(values) {
    log(log.VIRTUAL, `Before writing lines to data, rows are: `, this.rows);
    if (this.numRows >= values.length) {
      values.map((value, i) => {
        log(log.VIRTUAL, `Comparing values of length ${values[i].length} and rows of length ${this.numColumns}`);
        if (this.numColumns < values[i].length)
          throw new ScriptError(`Row ${i} does not match for the range and values given`);
        values[i].forEach((value, j) => {
          log(log.VIRTUAL, `Writing value ${value} to [${this.row - 1 + i},${this.col - 1 + j}]`);
          this.rows[this.row - 1 + i][this.col - 1 + j] = value;
        });
      });
      log(log.VIRTUAL, `Wrote all lines to data, rows are now: `, this.rows);
    } else throw new ScriptError('The values given do not match the size of the 2D array range.');
  }
}

try {
  module.exports = {
    VSpreadsheet,
    VSheet,
    VRange
  };
} catch (err) {}
