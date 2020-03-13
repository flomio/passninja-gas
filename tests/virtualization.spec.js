const { VSpreadsheet, VSheet, VRange } = require('../virtualization.gs');

// Patching globals from GAS runtime
global.log = (...args) => console.log('GAS: ', args);
global.log.STATUS = 'STATUS';
global.log.ERROR = 'ERROR';
global.log.WARNING = 'WARNING';
global.log.SUCCESS = 'SUCCESS';
global.ScriptError = Error;
global.testing = true;

describe('VSpreadsheet tests', () => {
  it('b spec', () => {
    expect(2 + 2).toBe(4);
  });
});

const createSheetProp = () => {
  return {
    getName: () => 'test_sheet',
    getLastRow: () => 3,
    getLastColumn: () => 3,
    getRange: (row, col, numRows, numCols) => {
      var arr = [];
      for (var i = 0; i < numRows; i++) {
        arr[i] = new Array(numCols).fill('');
      }
      return new VRange(arr, row, col, numRows, numCols);
    }
  };
};

describe('VSheet tests', () => {
  it('it to instantiate correctly', () => {
    const sheetProp = createSheetProp();
    console.log(sheetProp.getRange(1, 1, 3, 3));
    const range = new VSheet(sheetProp);
    expect(range).toHaveProperty('name', sheetProp.getName());
    expect(range).toHaveProperty('maxRow', sheetProp.getLastRow());
    expect(range).toHaveProperty('maxCol', sheetProp.getLastColumn());
    expect(range).toHaveProperty('rows', [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]);
  });
});

describe('VRange tests', () => {
  it('it to instantiate correctly', () => {
    const rows = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    expect(() => new VRange(rows, 1, 1, 3, 3)).toBeTruthy();
  });

  it('it to have proper get methods', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    expect(range.getRow()).toBe(1);
    expect(range.getColumn()).toBe(1);
    expect(range.getValue()).toEqual('A');
    expect(range.getValues()).toEqual([
      ['A', 'B'],
      ['D', 'E']
    ]);
  });

  it('it to start at 1, not 0', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    expect(() => new VRange(rows, 0, 0, 2, 2)).toThrow(ScriptError);
  });

  it('it to have setValue working as expected', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    range.setValue('X');
    expect(range.getValues()).toEqual([
      ['X', 'B'],
      ['D', 'E']
    ]);
    expect(range.getValue()).toBe('X');
  });

  it('setValues working as expected', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    range.setValues([
      [1, 2],
      [3, 4]
    ]);
    expect(range.getValues()).toEqual([
      [1, 2],
      [3, 4]
    ]);
    expect(range.getValue()).toBe(1);
  });

  it('setValues working as expected with less rows', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    range.setValues([[1, 2]]);
    expect(range.getValues()).toEqual([
      [1, 2],
      ['D', 'E']
    ]);
    expect(range.getValue()).toBe(1);
  });

  it('setValues working as expected with no rows', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    range.setValues([]);
    expect(range.getValues()).toEqual([
      ['A', 'B'],
      ['D', 'E']
    ]);
    expect(range.getValue()).toBe('A');
  });

  it('setValues does not work with too many columns and nothing was changed', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    expect(() => range.setValues([[1, 2, 3]])).toThrow(ScriptError);
    expect(range.getValues()).toEqual([
      ['A', 'B'],
      ['D', 'E']
    ]);
    expect(range.rows).toEqual(rows);
  });

  it('setValues does not work with too many columns and nothing was changed', () => {
    const rows = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
      ['J', 'K', 'L'],
      ['M', 'N', 'O']
    ];
    const range = new VRange(rows, 1, 1, 2, 2);
    expect(() =>
      range.setValues([
        [1, 2],
        [1, 2],
        [1, 2],
        [1, 2]
      ])
    ).toThrow(ScriptError);
    expect(range.getValues()).toEqual([
      ['A', 'B'],
      ['D', 'E']
    ]);
    expect(range.rows).toEqual(rows);
  });
});
