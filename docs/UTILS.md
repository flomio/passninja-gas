## Modules

<dl>
<dt><a href="#utils.module_general">general</a></dt>
<dd><p>General utility helper functions</p>
</dd>
<dt><a href="#utils.module_sheet">sheet</a></dt>
<dd><p>General sheet helper functions</p>
</dd>
<dt><a href="#module_config">config</a></dt>
<dd><p>Responsible for defining project-level reusable config + constants</p>
</dd>
<dt><a href="#module_errors">errors</a></dt>
<dd><p>Custom error definitions</p>
</dd>
<dt><a href="#module_virtualization">virtualization</a></dt>
<dd><p>Implementation for cached/virtual spreadsheets to reduce slow sheet queries</p>
</dd>
</dl>

<a name="utils.module_general"></a>

## general
General utility helper functions


* [general](#utils.module_general)
    * [~randomChoice(arr)](#utils.module_general..randomChoice)
    * [~sendErrorAsEvent(serviceName, code, body)](#utils.module_general..sendErrorAsEvent)
    * [~formatDate(date)](#utils.module_general..formatDate)
    * [~now()](#utils.module_general..now) ⇒ <code>string</code>
    * [~findMatchIndexAtColumn(arr, column, query)](#utils.module_general..findMatchIndexAtColumn) ⇒ <code>int</code>
    * [~rangeValuesExist(arr)](#utils.module_general..rangeValuesExist) ⇒ <code>boolean</code>
    * [~MD5(input, isShortMode)](#utils.module_general..MD5) ⇒ <code>string</code>

<a name="utils.module_general..randomChoice"></a>

### general~randomChoice(arr)
Chose a random item from an array

**Kind**: inner method of [<code>general</code>](#utils.module_general)  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | Array to choose from |

<a name="utils.module_general..sendErrorAsEvent"></a>

### general~sendErrorAsEvent(serviceName, code, body)
Formats an error as an event and adds it to the events sheet

**Kind**: inner method of [<code>general</code>](#utils.module_general)  

| Param | Type | Description |
| --- | --- | --- |
| serviceName | <code>string</code> | The service sending the error |
| code | <code>string</code> | The response code of the error |
| body | <code>string</code> | The body of the response |

<a name="utils.module_general..formatDate"></a>

### general~formatDate(date)
Localizes a date object to the user's timezone.

**Kind**: inner method of [<code>general</code>](#utils.module_general)  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> | date object to format |

<a name="utils.module_general..now"></a>

### general~now() ⇒ <code>string</code>
Returns a localized time string

**Kind**: inner method of [<code>general</code>](#utils.module_general)  
**Returns**: <code>string</code> - The current timestamp  
<a name="utils.module_general..findMatchIndexAtColumn"></a>

### general~findMatchIndexAtColumn(arr, column, query) ⇒ <code>int</code>
Returns the index of the matching query in the 2D array at column index.

**Kind**: inner method of [<code>general</code>](#utils.module_general)  
**Returns**: <code>int</code> - Query match index or -1 if not found  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | 2D Array to query |
| column | <code>int</code> | Index at second level to query |
| query | <code>string</code> | Query term |

<a name="utils.module_general..rangeValuesExist"></a>

### general~rangeValuesExist(arr) ⇒ <code>boolean</code>
Returns whether or not any non zero length string values are present in the nested arrays

**Kind**: inner method of [<code>general</code>](#utils.module_general)  
**Returns**: <code>boolean</code> - Whether or not any values are present in the collection.  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | Column[row] nested 2D array |

<a name="utils.module_general..MD5"></a>

### general~MD5(input, isShortMode) ⇒ <code>string</code>
You can get a MD5 hash value and even a 4digit short Hash value of a string.
Latest version:
  https://gist.github.com/KEINOS/78cc23f37e55e848905fc4224483763d
Author:
  KEINOS @ https://github.com/keinos

**Kind**: inner method of [<code>general</code>](#utils.module_general)  
**Returns**: <code>string</code> - The hashed input  
**Customfunction**:   

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The value to hash. |
| isShortMode | <code>boolean</code> | Set true for 4 digit shortend hash, else returns usual MD5 hash. |

<a name="utils.module_sheet"></a>

## sheet
General sheet helper functions


* [sheet](#utils.module_sheet)
    * [~getLinkedSpreadsheet()](#utils.module_sheet..getLinkedSpreadsheet) ⇒ <code>Spreadsheet</code>
    * [~rowToJSONFromSerial(sheet, serialNumber)](#utils.module_sheet..rowToJSONFromSerial) ⇒ <code>object</code>
    * [~getDevDeploymentUrl()](#utils.module_sheet..getDevDeploymentUrl) ⇒ <code>string</code>
    * [~getScriptUrl()](#utils.module_sheet..getScriptUrl) ⇒ <code>string</code>
    * [~getEnvVar(name, throwError)](#utils.module_sheet..getEnvVar) ⇒ <code>string</code> \| <code>null</code>
    * [~setEnvVar(name, value)](#utils.module_sheet..setEnvVar) ⇒ <code>Properties</code>
    * [~getRowPassPayload(rowRange)](#utils.module_sheet..getRowPassPayload)
    * [~getConfigConstants()](#utils.module_sheet..getConfigConstants)
    * [~getConfigFields()](#utils.module_sheet..getConfigFields)
    * [~getSheet(sheetName)](#utils.module_sheet..getSheet) ⇒ <code>Sheet</code>
    * [~getValidSheetSelectedRow(sheet)](#utils.module_sheet..getValidSheetSelectedRow) ⇒ <code>int</code> \| <code>boolean</code>
    * [~autoResizeSheet(sheet)](#utils.module_sheet..autoResizeSheet)
    * [~autoDeleteUnusedColumns(sheet)](#utils.module_sheet..autoDeleteUnusedColumns)
    * [~shrinkSheetRows(numRowsKeep)](#utils.module_sheet..shrinkSheetRows)
    * [~highlightRange(range, status, [value])](#utils.module_sheet..highlightRange)
    * [~rowToJson(sheet, data)](#utils.module_sheet..rowToJson)
    * [~insertRow(sheet, rowData, [index])](#utils.module_sheet..insertRow)
    * [~getColumnIndexFromString(sheet, searchTerm)](#utils.module_sheet..getColumnIndexFromString) ⇒ <code>int</code>
    * [~getHeaders(sheet)](#utils.module_sheet..getHeaders) ⇒ <code>array</code>
    * [~getNamedRange(name, ss)](#utils.module_sheet..getNamedRange) ⇒ <code>Range</code>
    * [~flashRange(range, flashColor, numFlashes, timeout)](#utils.module_sheet..flashRange)
    * [~clearForm(form)](#utils.module_sheet..clearForm)
    * [~getFormDestinationSheet(form)](#utils.module_sheet..getFormDestinationSheet) ⇒ <code>Sheet</code> \| <code>null</code>
    * [~clearFormDestinationSheet(form, ss)](#utils.module_sheet..clearFormDestinationSheet) ⇒ <code>null</code>

<a name="utils.module_sheet..getLinkedSpreadsheet"></a>

### sheet~getLinkedSpreadsheet() ⇒ <code>Spreadsheet</code>
Attempts to return the spreadsheet connected to the GAS Script Project.
 Uses three methods: id env var, url env var and SpreadsheetApp.getActiveSheet
 If multiple sheets have been programatically created it will only target the most recent.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>Spreadsheet</code> - The spreadsheet that is linked to the GAS Script Project.  
<a name="utils.module_sheet..rowToJSONFromSerial"></a>

### sheet~rowToJSONFromSerial(sheet, serialNumber) ⇒ <code>object</code>
Creates a JSON object from the first found match of the given serial number.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>object</code> - The resulting match or an empty object if no match is found  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |
| serialNumber | <code>string</code> | Query string to match |

<a name="utils.module_sheet..getDevDeploymentUrl"></a>

### sheet~getDevDeploymentUrl() ⇒ <code>string</code>
Retrieves the url for the script dev deployment

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>string</code> - the url for the script dev deployment  
<a name="utils.module_sheet..getScriptUrl"></a>

### sheet~getScriptUrl() ⇒ <code>string</code>
Retrieves the url to open the script

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>string</code> - the url for the connected script  
<a name="utils.module_sheet..getEnvVar"></a>

### sheet~getEnvVar(name, throwError) ⇒ <code>string</code> \| <code>null</code>
Returns an Script Project environment variable if found or throws an error.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>string</code> - The contents of the env variable<code>null</code> - If no env variable is found under that name  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name of the env var to query |
| throwError | <code>boolean</code> | <code>true</code> | Whether to throw an error or return null otherwise |

<a name="utils.module_sheet..setEnvVar"></a>

### sheet~setEnvVar(name, value) ⇒ <code>Properties</code>
Sets an Script Project environment variable.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>Properties</code> - The Properties store, for chaining  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the env var to query |
| value | <code>string</code> | The value you set |

<a name="utils.module_sheet..getRowPassPayload"></a>

### sheet~getRowPassPayload(rowRange)
Filters out non-pass related row entries and converts to JSON.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| rowRange | <code>Range</code> | Row range to query |

<a name="utils.module_sheet..getConfigConstants"></a>

### sheet~getConfigConstants()
Returns an object with key:value pairs from the Config sheet

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
<a name="utils.module_sheet..getConfigFields"></a>

### sheet~getConfigFields()
Returns a list of config field entries

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
<a name="utils.module_sheet..getSheet"></a>

### sheet~getSheet(sheetName) ⇒ <code>Sheet</code>
Returns the requested Google Sheet by name

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>Sheet</code> - Google Sheet object  

| Param | Type | Description |
| --- | --- | --- |
| sheetName | <code>string</code> | Name of the sheet you want to get back |

<a name="utils.module_sheet..getValidSheetSelectedRow"></a>

### sheet~getValidSheetSelectedRow(sheet) ⇒ <code>int</code> \| <code>boolean</code>
Determines whether the selected row is valid

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>int</code> - The selected row number<code>boolean</code> - If the selected row is invalid  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Google Sheet to check against |

<a name="utils.module_sheet..autoResizeSheet"></a>

### sheet~autoResizeSheet(sheet)
Auto resizes all sheet columns

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The sheet to resize |

<a name="utils.module_sheet..autoDeleteUnusedColumns"></a>

### sheet~autoDeleteUnusedColumns(sheet)
Deletes all columns from last column with data to the end on the given sheet

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The sheet to modify |

<a name="utils.module_sheet..shrinkSheetRows"></a>

### sheet~shrinkSheetRows(numRowsKeep)
Shrinks sheet to specified number of rows

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| numRowsKeep | <code>int</code> | The number of rows to keep |

<a name="utils.module_sheet..highlightRange"></a>

### sheet~highlightRange(range, status, [value])
Highlights a given range via custom status presets

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| range | <code>Range</code> | That you want to highlight |
| status | <code>string</code> | The type of higlighting you want to apply |
| [value] | <code>string</code> | Value to set the cell contents to |

<a name="utils.module_sheet..rowToJson"></a>

### sheet~rowToJson(sheet, data)
Creates an object from a sheet's first row headers as keys with the values from the data object.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | String to query the column headers |
| data | <code>Array.&lt;string&gt;</code> | Array of string data representing a row |

<a name="utils.module_sheet..insertRow"></a>

### sheet~insertRow(sheet, rowData, [index])
Inserts a row
 Ref: https://stackoverflow.com/questions/28295056/google-apps-script-appendrow-to-the-top

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to insert row data into |
| rowData | <code>Array.&lt;string&gt;</code> | Array of string data to insert in the rows |
| [index] | <code>int</code> | Optional index to specify the insertion point |

<a name="utils.module_sheet..getColumnIndexFromString"></a>

### sheet~getColumnIndexFromString(sheet, searchTerm) ⇒ <code>int</code>
Returns first found matching column (searches first row of the sheet)

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>int</code> - The first found column index, -1 if not found  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |
| searchTerm | <code>string</code> | Search term |

<a name="utils.module_sheet..getHeaders"></a>

### sheet~getHeaders(sheet) ⇒ <code>array</code>
Gets the column headers of the specified sheet

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>array</code> - The headers of the first row.  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Google Sheet to query |

<a name="utils.module_sheet..getNamedRange"></a>

### sheet~getNamedRange(name, ss) ⇒ <code>Range</code>
Gets the named range of the given spreadsheet

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>Range</code> - The resulting range  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the named range to query |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to query |

<a name="utils.module_sheet..flashRange"></a>

### sheet~flashRange(range, flashColor, numFlashes, timeout)
Flashes a row of a sheet
 Note: the range will end overridden with the top left's background color.

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| range | <code>Range</code> | Range to flash across |
| flashColor | <code>string</code> | Valid Google SpreadSheet color to flash |
| numFlashes | <code>int</code> | Number of times to flash the range |
| timeout | <code>int</code> | The timeout (in ms) for the flashes |

<a name="utils.module_sheet..clearForm"></a>

### sheet~clearForm(form)
Clears all previous form items from a form

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | The Google Form to clear |

<a name="utils.module_sheet..getFormDestinationSheet"></a>

### sheet~getFormDestinationSheet(form) ⇒ <code>Sheet</code> \| <code>null</code>
Returns the matching sheet that the form is dumping into

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>Sheet</code> - The Google Sheet that is recording the responses<code>null</code> - If no matching sheet is linked.  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | A Google Form |

<a name="utils.module_sheet..clearFormDestinationSheet"></a>

### sheet~clearFormDestinationSheet(form, ss) ⇒ <code>null</code>
Deletes and returns the data from the previous form response sheet

**Kind**: inner method of [<code>sheet</code>](#utils.module_sheet)  
**Returns**: <code>null</code> - If no matching sheet is linked.  

| Param | Type | Description |
| --- | --- | --- |
| form | <code>Form</code> | A Google Form |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to relink to |

<a name="module_config"></a>

## config
Responsible for defining project-level reusable config + constants

<a name="module_errors"></a>

## errors
Custom error definitions


* [errors](#module_errors)
    * [~PassNinjaGASError](#module_errors..PassNinjaGASError)
    * [~ServiceError](#module_errors..ServiceError)
    * [~UtilsError](#module_errors..UtilsError)
    * [~ScriptError](#module_errors..ScriptError)
    * [~CredentialsError](#module_errors..CredentialsError)
    * [~BuildError](#module_errors..BuildError)

<a name="module_errors..PassNinjaGASError"></a>

### errors~PassNinjaGASError
Error Archetype, not to be thrown.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_errors..ServiceError"></a>

### errors~ServiceError
Custom Error type thrown when a Service encounters an error.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_errors..UtilsError"></a>

### errors~UtilsError
Custom Error type thrown when a Script encounters an error.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_errors..ScriptError"></a>

### errors~ScriptError
Custom Error type thrown when a Script encounters an error.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_errors..CredentialsError"></a>

### errors~CredentialsError
Custom Error type thrown when credentials have not been added to the script.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_errors..BuildError"></a>

### errors~BuildError
Custom Error type thrown when element build has failed.

**Kind**: inner class of [<code>errors</code>](#module_errors)  
<a name="module_virtualization"></a>

## virtualization
Implementation for cached/virtual spreadsheets to reduce slow sheet queries


* [virtualization](#module_virtualization)
    * [~VSpreadsheet](#module_virtualization..VSpreadsheet)
    * [~VSheet](#module_virtualization..VSheet)
    * [~VRange](#module_virtualization..VRange)

<a name="module_virtualization..VSpreadsheet"></a>

### virtualization~VSpreadsheet
Virtual SpreadSheet Class

**Kind**: inner class of [<code>virtualization</code>](#module_virtualization)  
<a name="module_virtualization..VSheet"></a>

### virtualization~VSheet
Virtual Sheet Class

**Kind**: inner class of [<code>virtualization</code>](#module_virtualization)  
<a name="module_virtualization..VRange"></a>

### virtualization~VRange
Virtual Range Class

**Kind**: inner class of [<code>virtualization</code>](#module_virtualization)  
