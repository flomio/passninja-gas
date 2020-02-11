# passninja-guestlist-gas

# Documentation
## Functions

<dl>
<dt><a href="#onOpen">onOpen()</a></dt>
<dd><p>Adds the PassNinja script set as a menu item on load.</p>
</dd>
<dt><a href="#createPass_">createPass_()</a> ⇒ <code>string</code></dt>
<dd><p>Creates a PassNinja pass from the selected row.</p>
</dd>
<dt><a href="#updatePass_">updatePass_()</a> ⇒ <code>string</code></dt>
<dd><p>Updates a given pass from the highlighted row with the new values in the row
 Pops up a dialog input box where the user can input new json data to overwrite the existing pass</p>
</dd>
<dt><a href="#onboardNewPassholderFromForm">onboardNewPassholderFromForm(e)</a> ⇒ <code>string</code></dt>
<dd><p>Inputs a new user&#39;s data from a form submit event and triggers a pass creation.</p>
</dd>
<dt><a href="#showEvents_">showEvents_()</a></dt>
<dd><p>Pops up a modal with the pass events of the current highlighted row
related to the pass via serial number</p>
</dd>
<dt><a href="#doGet">doGet(e)</a> ⇒ <code>object</code></dt>
<dd><p>Returns the corresponding user entry in the Contacts sheet
 matching the serialNumber query parameter</p>
</dd>
<dt><a href="#doPost">doPost(e)</a> ⇒ <code>object</code></dt>
<dd><p>Creates an event entry in the Events spreadsheet</p>
</dd>
<dt><a href="#findContactBySerial">findContactBySerial(sheet, serialNumber)</a> ⇒ <code>object</code></dt>
<dd><p>Creates a JSON object from the first found match of the given serial number.</p>
</dd>
<dt><a href="#addEvent">addEvent(targetSheet, eventJson)</a> ⇒ <code>boolean</code></dt>
<dd><p>Adds a PassNinja event to a new row in the target spreadsheet</p>
</dd>
<dt><a href="#getValidSheetSelectedRow">getValidSheetSelectedRow(sheet)</a> ⇒ <code>int</code> | <code>boolean</code></dt>
<dd><p>Determines whether the selected row is valid</p>
</dd>
<dt><a href="#sortSheet">sortSheet(sheet)</a></dt>
<dd><p>Sorts the specified sheet</p>
</dd>
<dt><a href="#getSheet">getSheet(sheetName)</a> ⇒ <code>Sheet</code></dt>
<dd><p>Returns the requested Google Sheet by name</p>
</dd>
<dt><a href="#highlightCells">highlightCells(cells, status, [value])</a></dt>
<dd><p>Highlights a given range via custom status presets</p>
</dd>
<dt><a href="#parseName">parseName(input)</a> ⇒ <code>object</code></dt>
<dd><p>Takes in a name and parses to an object with a name, lastName and secondLast Name</p>
</dd>
<dt><a href="#getColumnIndexFromString">getColumnIndexFromString(sheet, searchTerm)</a> ⇒ <code>int</code></dt>
<dd><p>Returns first found matching column (searches first row of the sheet)</p>
</dd>
<dt><a href="#getHeaders">getHeaders(sheet)</a> ⇒ <code>array</code></dt>
<dd><p>Gets the column headers of the specified sheet</p>
</dd>
<dt><a href="#findMatchIndexAtColumn">findMatchIndexAtColumn(arr, column, query)</a> ⇒ <code>int</code></dt>
<dd><p>Returns the index of the matching query in the 2D array at column index.</p>
</dd>
<dt><a href="#rowToJson">rowToJson(sheet, data)</a></dt>
<dd><p>Creates an object from a sheet&#39;s first row headers as keys with the values from the data object.</p>
</dd>
<dt><a href="#flashRange">flashRange(range, flashColor, numFlashes, timeout)</a></dt>
<dd><p>Flashes a row of a sheet
 Note: the range will end overridden with the top left&#39;s background color.</p>
</dd>
<dt><a href="#getFileId">getFileId()</a> ⇒ <code>string</code></dt>
<dd><p>Returns the file ID of the current spreadsheet.</p>
</dd>
<dt><a href="#insertRow">insertRow(sheet, rowData, [index])</a></dt>
<dd><p>Inserts a row
 Ref: <a href="https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top">https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top</a></p>   
</dd>
<dt><a href="#toast">toast(msg, title, timeout)</a></dt>
<dd><p>Toasts the user at the current spreadsheet</p>
</dd>
</dl>

<a name="doGet"></a>

## doGet(e) ⇒ <code>object</code>
Returns the corresponding user entry in the Contacts sheet
 matching the serialNumber query parameter

**Kind**: global function
**Returns**: <code>object</code> - Standard response with a JavaScript text body

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | Request event data |

<a name="findContactBySerial"></a>

## findContactBySerial(sheet, serialNumber) ⇒ <code>object</code>
Creates a JSON object from the first found match of the given serial number.

**Kind**: global function
**Returns**: <code>object</code> - The resulting match or an empty object if no match is found

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |
| serialNumber | <code>string</code> | Query string to match |

<a name="doPost"></a>

## doPost(e) ⇒ <code>object</code>
Creates an event entry in the Events spreadsheet

**Kind**: global function
**Returns**: <code>object</code> - Standard response with a JavaScript text body

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | Request event data |

<a name="addEvent"></a>

## addEvent(targetSheet, eventJson) ⇒ <code>boolean</code>
Adds a PassNinja event to a new row in the target spreadsheet

**Kind**: global function
**Returns**: <code>boolean</code> - If the action completed successfully

| Param | Type | Description |
| --- | --- | --- |
| targetSheet | <code>Sheet</code> | Sheet to insert the event into |
| eventJson | <code>object</code> | JSON representation of the PassNinja event |

<a name="getValidSheetSelectedRow"></a>

## getValidSheetSelectedRow(sheet) ⇒ <code>int</code> \| <code>boolean</code>
Determines whether the selected row is valid

**Kind**: global function
**Returns**: <code>int</code> - The selected row number<code>boolean</code> - If the selected row is invalid

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Google Sheet to check against |

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

<a name="highlightCells"></a>

## highlightCells(cells, status, [value])
Highlights a given range via custom status presets

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| cells | <code>Range</code> | That you want to highlight |
| status | <code>string</code> | The type of higlighting you want to apply |
| [value] | <code>string</code> | Value to set the cell contents to |

<a name="parseName"></a>

## parseName(input) ⇒ <code>object</code>
Takes in a name and parses to an object with a name, lastName and secondLast Name

**Kind**: global function
**Returns**: <code>object</code> - Object with the keys: name, lastName and secondLastName

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Raw name |

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
**Returns**: <code>array</code> - The headers of the first column.

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |

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

<a name="rowToJson"></a>

## rowToJson(sheet, data)
Creates an object from a sheet's first row headers as keys with the values from the data object.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | String to query the column headers |
| data | <code>Array.&lt;string&gt;</code> | Array of string data representing a row |

<a name="flashRange"></a>

## flashRange(range, flashColor, numFlashes, timeout)
Flashes a row of a sheet
 Note: the range will end overridden with the top left's background color.

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| range | <code>Range</code> | Range to flash across |
| flashColor | <code>string</code> | Valid Google SpreadSheet color to flash |
| numFlashes | <code>int</code> | Number of times to flash the range |
| timeout | <code>int</code> | The timeout (in ms) for the flashes |

<a name="getFileId"></a>

## getFileId() ⇒ <code>string</code>
Returns the file ID of the current spreadsheet.

**Kind**: global function
**Returns**: <code>string</code> - - The file ID or undefined if not found.
<a name="insertRow"></a>

## insertRow(sheet, rowData, [index])
Inserts a row
 Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to insert row data into |
| rowData | <code>Array.&lt;string&gt;</code> | Array of string data to insert in the rows |
| [index] | <code>int</code> | Optional index to specify the insertion point |

<a name="toast"></a>

## toast(msg, title, timeout)
Toasts the user at the current spreadsheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to sent |
| title | <code>string</code> | The title of the toast |
| timeout | <code>int</code> | The timeout of the toast |

<a name="onOpen"></a>

## onOpen()
Adds the PassNinja script set as a menu item on load.

**Kind**: global function  
<a name="onboardNewPassholderFromForm"></a>

## onboardNewPassholderFromForm(e) ⇒ <code>string</code>
Inputs a new user's data from a form submit event and triggers a pass creation.

**Kind**: global function
**Returns**: <code>string</code> - "Lock Timeout" if the contact sheet queries cause a timeout

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | The form event to read from |

<a name="updatePass_"></a>

## updatePass\_() ⇒ <code>string</code>
Updates a given pass from the highlighted row with the new values in the row
 Pops up a dialog input box where the user can input new json data to overwrite the existing pass

**Kind**: global function
**Returns**: <code>string</code> - The response from the PassNinja API.
<a name="showEvents_"></a>

## showEvents\_()
Pops up a modal with the pass events of the current highlighted row
related to the pass via serial number

**Kind**: global function
<a name="createPass_"></a>

## createPass\_() ⇒ <code>string</code>
Creates a PassNinja pass from the selected row.

**Kind**: global function
**Returns**: <code>string</code> - The response from the PassNinja API.

### Generated with [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown/wiki/Create-a-README-template)