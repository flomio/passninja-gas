## Functions

<dl>
<dt><a href="#findMatchIndexAtColumn">findMatchIndexAtColumn(arr, column, query)</a> ⇒ <code>int</code></dt>
<dd><p>Returns the index of the matching query in the 2D array at column index.</p>
</dd>
<dt><a href="#MD5">MD5(input, isShortMode)</a> ⇒ <code>string</code></dt>
<dd><p>You can get a MD5 hash value and even a 4digit short Hash value of a string.
Latest version:
  <a href="https://gist.github.com/KEINOS/78cc23f37e55e848905fc4224483763d">https://gist.github.com/KEINOS/78cc23f37e55e848905fc4224483763d</a>
Author:
  KEINOS @ <a href="https://github.com/keinos">https://github.com/keinos</a></p>
</dd>
<dt><a href="#getLinkedSpreadsheet">getLinkedSpreadsheet()</a> ⇒ <code>Spreadsheet</code></dt>
<dd><p>Attempts to return the spreadsheet connected to the GAS Script Project.
 Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet
 If multiple sheets have been programatically created it will only target the most recent.</p>
</dd>
<dt><a href="#getEnvVar">getEnvVar(name, throwError)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Returns an Script Project environment variable if found or throws an error.</p>
</dd>
<dt><a href="#setEnvVar">setEnvVar(name, value)</a> ⇒ <code>Properties</code></dt>
<dd><p>Sets an Script Project environment variable.</p>
</dd>
<dt><a href="#getRowPassPayload">getRowPassPayload(ss, rowRange)</a></dt>
<dd><p>Filters out non-pass related row entries and converts to JSON.</p>
</dd>
<dt><a href="#getConfigConstants">getConfigConstants()</a></dt>
<dd><p>Returns an object with key:value pairs from the Config sheet</p>
</dd>
<dt><a href="#getConfigFields">getConfigFields()</a></dt>
<dd><p>Returns a list of config field entries</p>
</dd>
<dt><a href="#sortSheet">sortSheet(sheet)</a></dt>
<dd><p>Sorts the specified sheet</p>
</dd>
<dt><a href="#getSheet">getSheet(sheetName)</a> ⇒ <code>Sheet</code></dt>
<dd><p>Returns the requested Google Sheet by name</p>
</dd>
<dt><a href="#getValidSheetSelectedRow">getValidSheetSelectedRow(sheet)</a> ⇒ <code>int</code> | <code>boolean</code></dt>
<dd><p>Determines whether the selected row is valid</p>
</dd>
<dt><a href="#autoResizeSheet">autoResizeSheet(sheet)</a></dt>
<dd><p>Auto resizes all sheet columns</p>
</dd>
<dt><a href="#deleteUnusedColumns">deleteUnusedColumns(min, max)</a></dt>
<dd><p>Deletes all columns from min-&gt;max on the given sheet</p>
</dd>
<dt><a href="#highlightCells">highlightCells(cells, status, [value])</a></dt>
<dd><p>Highlights a given range via custom status presets</p>
</dd>
<dt><a href="#rowToJson">rowToJson(sheet, data)</a></dt>
<dd><p>Creates an object from a sheet&#39;s first row headers as keys with the values from the data object.</p>
</dd>
<dt><a href="#insertRow">insertRow(sheet, rowData, [index])</a></dt>
<dd><p>Inserts a row
 Ref: <a href="https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top">https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top</a></p>
</dd>
<dt><a href="#getColumnIndexFromString">getColumnIndexFromString(sheet, searchTerm)</a> ⇒ <code>int</code></dt>
<dd><p>Returns first found matching column (searches first row of the sheet)</p>
</dd>
<dt><a href="#getHeaders">getHeaders(sheet)</a> ⇒ <code>array</code></dt>
<dd><p>Gets the column headers of the specified sheet</p>
</dd>
<dt><a href="#getNamedRange">getNamedRange(name, ss)</a> ⇒ <code>Range</code></dt>
<dd><p>Gets the named range of the given spreadsheet</p>
</dd>
<dt><a href="#clearForm">clearForm(form)</a></dt>
<dd><p>Clears all previous form items from a form</p>
</dd>
<dt><a href="#getFormDestinationSheet">getFormDestinationSheet(form)</a> ⇒ <code>Sheet</code> | <code>null</code></dt>
<dd><p>Returns the matching sheet that the form is dumping into</p>
</dd>
<dt><a href="#clearFormDestinationSheet">clearFormDestinationSheet(form, ss)</a> ⇒ <code>null</code></dt>
<dd><p>Deletes and returns the data from the previous form response sheet</p>
</dd>
<dt><a href="#getFileId">getFileId()</a> ⇒ <code>string</code></dt>
<dd><p>Returns the file ID of the current spreadsheet.</p>
</dd>
<dt><a href="#toast">toast(msg, title, timeout)</a></dt>
<dd><p>Toasts the user at the current spreadsheet</p>
</dd>
<dt><a href="#flashRange">flashRange(range, flashColor, numFlashes, timeout)</a></dt>
<dd><p>Flashes a row of a sheet
 Note: the range will end overridden with the top left&#39;s background color.</p>
</dd>
<dt><a href="#catchError">catchError(error, msg)</a></dt>
<dd><p>Runs the function and catches then throws any error and logs it.</p>
</dd>
</dl>

<a name="findMatchIndexAtColumn"></a>

## findMatchIndexAtColumn(arr, column, query) ⇒ <code>int</code>
Returns the index of the matching query in the 2D array at column index.

**Kind**: global function  
**Returns**: <code>int</code> - Query match index or -1 if not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | 2D Array to query |
| column | <code>int</code> | Index at second level to query |
| query | <code>string</code> | Query term |

<a name="MD5"></a>

## MD5(input, isShortMode) ⇒ <code>string</code>
You can get a MD5 hash value and even a 4digit short Hash value of a string.
Latest version:
  https://gist.github.com/KEINOS/78cc23f37e55e848905fc4224483763d
Author:
  KEINOS @ https://github.com/keinos

**Kind**: global function  
**Returns**: <code>string</code> - The hashed input  
**Customfunction**:   

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The value to hash. |
| isShortMode | <code>boolean</code> | Set true for 4 digit shortend hash, else returns usual MD5 hash. |

<a name="getLinkedSpreadsheet"></a>

## getLinkedSpreadsheet() ⇒ <code>Spreadsheet</code>
Attempts to return the spreadsheet connected to the GAS Script Project. Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet If multiple sheets have been programatically created it will only target the most recent.

**Kind**: global function  
**Returns**: <code>Spreadsheet</code> - The spreadsheet that is linked to the GAS Script Project.  
<a name="getEnvVar"></a>

## getEnvVar(name, throwError) ⇒ <code>string</code> \| <code>null</code>
Returns an Script Project environment variable if found or throws an error.

**Kind**: global function  
**Returns**: <code>string</code> - The contents of the env variable<code>null</code> - If no env variable is found under that name  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of the env var to query |
| throwError | <code>boolean</code> | <code>true</code> | Whether to throw an error or return null otherwise |

<a name="setEnvVar"></a>

## setEnvVar(name, value) ⇒ <code>Properties</code>
Sets an Script Project environment variable.

**Kind**: global function  
**Returns**: <code>Properties</code> - The Properties store, for chaining  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the env var to query |
| value | <code>string</code> | The value you set |

<a name="getRowPassPayload"></a>

## getRowPassPayload(ss, rowRange)
Filters out non-pass related row entries and converts to JSON.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | Spreadsheet to query for Config NamedRange |
| rowRange | <code>Range</code> | Row range to query |

<a name="getConfigConstants"></a>

## getConfigConstants()
Returns an object with key:value pairs from the Config sheet

**Kind**: global function  
<a name="getConfigFields"></a>

## getConfigFields()
Returns a list of config field entries

**Kind**: global function  
<a name="sortSheet"></a>

## sortSheet(sheet)
Sorts the specified sheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Google sheet to sort |

<a name="getSheet"></a>

## getSheet(sheetName) ⇒ <code>Sheet</code>
Returns the requested Google Sheet by name

**Kind**: global function  
**Returns**: <code>Sheet</code> - Google Sheet object  

| Param | Type | Description |
| --- | --- | --- |
| sheetName | <code>string</code> | Name of the sheet you want to get back |

<a name="getValidSheetSelectedRow"></a>

## getValidSheetSelectedRow(sheet) ⇒ <code>int</code> \| <code>boolean</code>
Determines whether the selected row is valid

**Kind**: global function  
**Returns**: <code>int</code> - The selected row number<code>boolean</code> - If the selected row is invalid  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Google Sheet to check against |

<a name="autoResizeSheet"></a>

## autoResizeSheet(sheet)
Auto resizes all sheet columns

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The sheet to resize |

<a name="deleteUnusedColumns"></a>

## deleteUnusedColumns(min, max)
Deletes all columns from min->max on the given sheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>int</code> | The starting column index |
| max | <code>int</code> | The final column index |

<a name="highlightCells"></a>

## highlightCells(cells, status, [value])
Highlights a given range via custom status presets

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cells | <code>Range</code> | That you want to highlight |
| status | <code>string</code> | The type of higlighting you want to apply |
| [value] | <code>string</code> | Value to set the cell contents to |

<a name="rowToJson"></a>

## rowToJson(sheet, data)
Creates an object from a sheet's first row headers as keys with the values from the data object.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | String to query the column headers |
| data | <code>Array.&lt;string&gt;</code> | Array of string data representing a row |

<a name="insertRow"></a>

## insertRow(sheet, rowData, [index])
Inserts a row Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to insert row data into |
| rowData | <code>Array.&lt;string&gt;</code> | Array of string data to insert in the rows |
| [index] | <code>int</code> | Optional index to specify the insertion point |

<a name="getColumnIndexFromString"></a>

## getColumnIndexFromString(sheet, searchTerm) ⇒ <code>int</code>
Returns first found matching column (searches first row of the sheet)

**Kind**: global function  
**Returns**: <code>int</code> - The first found column index, -1 if not found  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |
| searchTerm | <code>string</code> | Search term |

<a name="getHeaders"></a>

## getHeaders(sheet) ⇒ <code>array</code>
Gets the column headers of the specified sheet

**Kind**: global function  
**Returns**: <code>array</code> - The headers of the first row.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |

<a name="getNamedRange"></a>

## getNamedRange(name, ss) ⇒ <code>Range</code>
Gets the named range of the given spreadsheet

**Kind**: global function  
**Returns**: <code>Range</code> - The resulting range  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the named range to query |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to query |

<a name="clearForm"></a>

## clearForm(form)
Clears all previous form items from a form

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | The Google Form to clear |

<a name="getFormDestinationSheet"></a>

## getFormDestinationSheet(form) ⇒ <code>Sheet</code> \| <code>null</code>
Returns the matching sheet that the form is dumping into

**Kind**: global function  
**Returns**: <code>Sheet</code> - The Google Sheet that is recording the responses<code>null</code> - If no matching sheet is linked.  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | A Google Form |

<a name="clearFormDestinationSheet"></a>

## clearFormDestinationSheet(form, ss) ⇒ <code>null</code>
Deletes and returns the data from the previous form response sheet

**Kind**: global function  
**Returns**: <code>null</code> - If no matching sheet is linked.  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | A Google Form |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to relink to |

<a name="getFileId"></a>

## getFileId() ⇒ <code>string</code>
Returns the file ID of the current spreadsheet.

**Kind**: global function  
**Returns**: <code>string</code> - - The file ID or undefined if not found.  
<a name="toast"></a>

## toast(msg, title, timeout)
Toasts the user at the current spreadsheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to sent |
| title | <code>string</code> | The title of the toast |
| timeout | <code>int</code> | The timeout of the toast |

<a name="flashRange"></a>

## flashRange(range, flashColor, numFlashes, timeout)
Flashes a row of a sheet Note: the range will end overridden with the top left's background color.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| range | <code>Range</code> | Range to flash across |
| flashColor | <code>string</code> | Valid Google SpreadSheet color to flash |
| numFlashes | <code>int</code> | Number of times to flash the range |
| timeout | <code>int</code> | The timeout (in ms) for the flashes |

<a name="catchError"></a>

## catchError(error, msg)
Runs the function and catches then throws any error and logs it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>string</code> | Error to log |
| msg | <code>string</code> | The extra message to add |

