## Functions

<dl>
<dt><a href="#createSpreadsheet">createSpreadsheet()</a></dt>
<dd><p>Creates the necessary demo spreadsheet in the user&#39;s spreadsheets.
 Spreadsheet is linked via a trigger to the script.</p>
</dd>
<dt><a href="#onOpen">onOpen()</a></dt>
<dd><p>Adds the PassNinja script set as a menu item on load.</p>
</dd>
<dt><a href="#updateFromConfig_">updateFromConfig_(ss, values)</a></dt>
<dd><p>Creates a Google Form that allows respondents to select which conference
sessions they would like to attend, grouped by date and start time.</p>
</dd>
<dt><a href="#onboardNewPassholderFromForm">onboardNewPassholderFromForm(e)</a> ⇒ <code>string</code></dt>
<dd><p>Inputs a new user&#39;s data from a form submit event and triggers a pass creation.</p>
</dd>
<dt><a href="#createPass_">createPass_()</a> ⇒ <code>string</code></dt>
<dd><p>Creates a PassNinja pass from the selected row.</p>
</dd>
<dt><a href="#showEvents_">showEvents_()</a></dt>
<dd><p>Pops up a modal with the pass events of the current highlighted row
related to the pass via serial number</p>
</dd>
<dt><a href="#initializeSheet">initializeSheet(name, ss)</a> ⇒ <code>Sheet</code></dt>
<dd><p>Creates a default PassNinja formatted Google sheet on the given spreadsheet</p>
</dd>
<dt><a href="#buildConfigSheet">buildConfigSheet()</a></dt>
<dd><p>Builds initial contacts sheet</p>
</dd>
<dt><a href="#buildEventsSheet">buildEventsSheet(ss, fieldsNames)</a></dt>
<dd><p>Builds a events sheet based on the user config sheet</p>
</dd>
<dt><a href="#buildContactsSheet">buildContactsSheet(ss, fieldsNames)</a></dt>
<dd><p>Builds a contacts sheet based on the user config sheet</p>
</dd>
<dt><a href="#buildContactsForm">buildContactsForm(ss, sheet, fieldData)</a></dt>
<dd><p>Builds a form based on the user config sheet</p>
</dd>
</dl>

<a name="createSpreadsheet"></a>

## createSpreadsheet()
Creates the necessary demo spreadsheet in the user's spreadsheets. Spreadsheet is linked via a trigger to the script.

**Kind**: global function  
<a name="onOpen"></a>

## onOpen()
Adds the PassNinja script set as a menu item on load.

**Kind**: global function  
<a name="updateFromConfig_"></a>

## updateFromConfig\_(ss, values)
Creates a Google Form that allows respondents to select which conferencesessions they would like to attend, grouped by date and start time.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The spreadsheet that contains the conference data. |
| values | <code>Array.&lt;string&gt;</code> | Cell values for the spreadsheet range. |

<a name="onboardNewPassholderFromForm"></a>

## onboardNewPassholderFromForm(e) ⇒ <code>string</code>
Inputs a new user's data from a form submit event and triggers a pass creation.

**Kind**: global function  
**Returns**: <code>string</code> - "Lock Timeout" if the contact sheet queries cause a timeout  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | The form event to read from |

<a name="createPass_"></a>

## createPass\_() ⇒ <code>string</code>
Creates a PassNinja pass from the selected row.

**Kind**: global function  
**Returns**: <code>string</code> - The response from the PassNinja API.  
<a name="showEvents_"></a>

## showEvents\_()
Pops up a modal with the pass events of the current highlighted rowrelated to the pass via serial number

**Kind**: global function  
<a name="initializeSheet"></a>

## initializeSheet(name, ss) ⇒ <code>Sheet</code>
Creates a default PassNinja formatted Google sheet on the given spreadsheet

**Kind**: global function  
**Returns**: <code>Sheet</code> - The resulting Google sheet  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the named range to query |
| ss | <code>Spreadsheet</code> | The Google spreadsheet to query |

<a name="buildConfigSheet"></a>

## buildConfigSheet()
Builds initial contacts sheet

**Kind**: global function  
<a name="buildEventsSheet"></a>

## buildEventsSheet(ss, fieldsNames)
Builds a events sheet based on the user config sheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| fieldsNames | <code>Array.&lt;string&gt;</code> | The names of the fields that the user has entered in the config |

<a name="buildContactsSheet"></a>

## buildContactsSheet(ss, fieldsNames)
Builds a contacts sheet based on the user config sheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| fieldsNames | <code>Array.&lt;string&gt;</code> | The names of the fields that the user has entered in the config |

<a name="buildContactsForm"></a>

## buildContactsForm(ss, sheet, fieldData)
Builds a form based on the user config sheet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The container spreadsheet |
| sheet | <code>Sheet</code> | The container sheet for the form |
| fieldData | <code>Array.&lt;string&gt;</code> | The fields that the user has entered in the config |

