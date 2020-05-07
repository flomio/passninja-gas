## Modules

<dl>
<dt><a href="#module_build">build</a></dt>
<dd><p>Responsible for building all GAS sheets</p>
</dd>
<dt><a href="#module_virtualization">virtualization</a></dt>
<dd><p>Implementation for cached/virtual spreadsheets to reduce slow sheet queries</p>
</dd>
</dl>

<a name="module_build"></a>

## build
Responsible for building all GAS sheets


* [build](#module_build)
    * [~initializeSheet(name, ss)](#module_build..initializeSheet) ⇒ <code>Sheet</code>
    * [~onPostSheetCreate(sheet)](#module_build..onPostSheetCreate)
    * [~buildConfigSheet()](#module_build..buildConfigSheet)
    * [~buildEventsSheet(ss, fieldsNames)](#module_build..buildEventsSheet)
    * [~buildScannersSheet(ss, fieldsNames)](#module_build..buildScannersSheet)
    * [~buildContactsSheet(ss, fieldsNames)](#module_build..buildContactsSheet) ⇒ <code>Sheet</code>
    * [~buildContactsForm(ss, sheet, fieldData)](#module_build..buildContactsForm)

<a name="module_build..initializeSheet"></a>

### build~initializeSheet(name, ss) ⇒ <code>Sheet</code>
Creates a default PassNinja formatted Google sheet on the given spreadsheet

**Kind**: inner method of [<code>build</code>](#module_build)  
**Returns**: <code>Sheet</code> - The resulting Google sheet  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the named range to query |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to query |

<a name="module_build..onPostSheetCreate"></a>

### build~onPostSheetCreate(sheet)
Cleanup function for removing unused columns/rows and resizing the sheet

**Kind**: inner method of [<code>build</code>](#module_build)  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | The Google sheet to modify |

<a name="module_build..buildConfigSheet"></a>

### build~buildConfigSheet()
Builds initial config sheet

**Kind**: inner method of [<code>build</code>](#module_build)  
<a name="module_build..buildEventsSheet"></a>

### build~buildEventsSheet(ss, fieldsNames)
Builds a events sheet based on the user config sheet

**Kind**: inner method of [<code>build</code>](#module_build)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| fieldsNames | <code>Array.&lt;string&gt;</code> | The names of the fields that the user has entered in the config |

<a name="module_build..buildScannersSheet"></a>

### build~buildScannersSheet(ss, fieldsNames)
Builds a scanners sheet based on the user config sheet with one default scanner

**Kind**: inner method of [<code>build</code>](#module_build)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| fieldsNames | <code>Array.&lt;string&gt;</code> | The names of the fields that the user has entered in the config |

<a name="module_build..buildContactsSheet"></a>

### build~buildContactsSheet(ss, fieldsNames) ⇒ <code>Sheet</code>
Builds a contacts sheet based on the user config sheet

**Kind**: inner method of [<code>build</code>](#module_build)  
**Returns**: <code>Sheet</code> - The resulting Contacts sheet that was created.  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| fieldsNames | <code>Array.&lt;string&gt;</code> | The names of the fields that the user has entered in the config |

<a name="module_build..buildContactsForm"></a>

### build~buildContactsForm(ss, sheet, fieldData)
Builds a form based on the user config sheet

**Kind**: inner method of [<code>build</code>](#module_build)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| sheet | <code>Sheet</code> | The container sheet for the form |
| fieldData | <code>Array.&lt;string&gt;</code> | The fields that the user has entered in the config |

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
