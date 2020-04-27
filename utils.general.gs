/** Chose a random item from an array
 *
 * @param {array} arr Array to choose from
 */
function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

/** Localizes a date object to the user's timezone.
 *
 * @param {Date} date date object to format
 */
function formatDate(date) {
  const FUS1 = date.toString().substr(25, 6) + ':00';
  return Utilities.formatDate(date, FUS1, DATE_FORMAT);
}

/** Returns the index of the matching query in the 2D array at column index.
 *
 * @param {array} arr 2D Array to query
 * @param {int} column Index at second level to query
 * @param {string} query Query term
 * @returns {int} Query match index or -1 if not found
 */
function findMatchIndexAtColumn(arr, column, query) {
  let matchIndex = -1;
  for (i = 1; i < arr.length; ++i) {
    if (arr[i][column] == query) {
      matchIndex = i;
      break;
    }
  }
  return matchIndex;
}

/** Returns whether or not any non zero length string values are present in the nested arrays
 *
 * @param {array} arr Column[row] nested 2D array
 * @returns {boolean} Whether or not any values are present in the collection.
 */
function rangeValuesExist(rangeValues) {
  return rangeValues.reduce((acc, f) => acc || !!f.filter(g => g.length).length, false);
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
  let txtHash = '';
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input, Utilities.Charset.UTF_8);

  if (!isShortMode) {
    for (i = 0; i < rawHash.length; i++) {
      let hashVal = rawHash[i];
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
