## Functions

<dl>
<dt><a href="#createSpreadsheet">createSpreadsheet()</a></dt>
<dd><p><del><em>--</em></del> RUN ME FIRST <del><em>--</em></del>
 Creates the necessary demo spreadsheet in the user&#39;s spreadsheets.
 Spreadsheet is linked via a trigger to the script.</p>
</dd>
<dt><a href="#onOpen">onOpen()</a></dt>
<dd><p>Custom Trigger: adds the PassNinja script set as a menu item on load.</p>
</dd>
<dt><a href="#storeTwilioDetails_">storeTwilioDetails_()</a> ⇒ <code>ServiceError</code></dt>
<dd><p>Menu command to stores the Twilio auth details into the Script Properties permanently..</p>
</dd>
<dt><a href="#updateFromConfig_">updateFromConfig_(ss, values)</a></dt>
<dd><p>Creates a Google Form that allows respondents to select which conference
sessions they would like to attend, grouped by date and start time.</p>
</dd>
<dt><a href="#onboardNewPassholderFromForm">onboardNewPassholderFromForm(e)</a> ⇒ <code>string</code></dt>
<dd><p>Custom Trigger: inputs a new user&#39;s data from a form submit event and triggers a pass creation.</p>
</dd>
<dt><a href="#createPass_">createPass_()</a> ⇒ <code>string</code> | <code>ServiceError</code></dt>
<dd><p>Menu command to create a PassNinja pass from the selected row.</p>
</dd>
<dt><a href="#sendText_">sendText_()</a> ⇒ <code>ServiceError</code> | <code>CredentialsError</code> | <code>Error</code></dt>
<dd><p>Sends a text to the current row using the TwilioService and stored Script Properties.
 NOTE: only works if the header &#39;phoneNumber&#39; is present</p>
</dd>
<dt><a href="#showEvents_">showEvents_()</a></dt>
<dd><p>Menu command to pop up a modal with the pass events
 of the current highlighted row related to the pass via serial number
 NOT IMPLEMENTED YET</p>
</dd>
<dt><a href="#initializeSheet">initializeSheet(name, ss)</a> ⇒ <code>Sheet</code></dt>
<dd><p>Creates a default PassNinja formatted Google sheet on the given spreadsheet</p>
</dd>
<dt><a href="#buildConfigSheet">buildConfigSheet()</a></dt>
<dd><p>Builds initial config sheet</p>
</dd>
<dt><a href="#buildEventsSheet">buildEventsSheet(ss, fieldsNames)</a></dt>
<dd><p>Builds a events sheet based on the user config sheet</p>
</dd>
<dt><a href="#buildContactsSheet">buildContactsSheet(ss, fieldsNames)</a> ⇒ <code>Sheet</code></dt>
<dd><p>Builds a contacts sheet based on the user config sheet</p>
</dd>
<dt><a href="#buildContactsForm">buildContactsForm(ss, sheet, fieldData)</a></dt>
<dd><p>Builds a form based on the user config sheet</p>
</dd>
</dl>

<a name="createSpreadsheet"></a>

## createSpreadsheet()
~*--*~ RUN ME FIRST ~*--*~
 Creates the necessary demo spreadsheet in the user's spreadsheets.
 Spreadsheet is linked via a trigger to the script.

**Kind**: global function  
<a name="onOpen"></a>

## onOpen()
Custom Trigger: adds the PassNinja script set as a menu item on load.

**Kind**: global function  
<a name="storeTwilioDetails_"></a>

## storeTwilioDetails\_() ⇒ <code>ServiceError</code>
Menu command to stores the Twilio auth details into the Script Properties permanently..

**Kind**: global function  
**Returns**: <code>ServiceError</code> - If setup is cancelled.  
<a name="updateFromConfig_"></a>

## updateFromConfig\_(ss, values)
Creates a Google Form that allows respondents to select which conference
sessions they would like to attend, grouped by date and start time.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The spreadsheet that contains the conference data. |
| values | <code>Array.&lt;string&gt;</code> | Cell values for the spreadsheet range. |

<a name="onboardNewPassholderFromForm"></a>

## onboardNewPassholderFromForm(e) ⇒ <code>string</code>
Custom Trigger: inputs a new user's data from a form submit event and triggers a pass creation.

**Kind**: global function  
**Returns**: <code>string</code> - "Lock Timeout" if the contact sheet queries cause a timeout  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | The form event to read from |

<a name="createPass_"></a>

## createPass\_() ⇒ <code>string</code> \| <code>ServiceError</code>
Menu command to create a PassNinja pass from the selected row.

**Kind**: global function  
**Returns**: <code>string</code> - The response from the PassNinja API.<code>ServiceError</code> - If the response from PassNinjaService is non 2xx.  
<a name="sendText_"></a>

## sendText\_() ⇒ <code>ServiceError</code> \| <code>CredentialsError</code> \| <code>Error</code>
Sends a text to the current row using the TwilioService and stored Script Properties.
 NOTE: only works if the header 'phoneNumber' is present

**Kind**: global function  
**Returns**: <code>ServiceError</code> - If the response from TwilioService is non 2xx.<code>CredentialsError</code> - If the credentials from TwilioService are not set up.<code>Error</code> - If an unexpected error occurred running TwilioService.  
<a name="showEvents_"></a>

## showEvents\_()
Menu command to pop up a modal with the pass events
 of the current highlighted row related to the pass via serial number
 NOT IMPLEMENTED YET

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
Builds initial config sheet

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

## buildContactsSheet(ss, fieldsNames) ⇒ <code>Sheet</code>
Builds a contacts sheet based on the user config sheet

**Kind**: global function  
**Returns**: <code>Sheet</code> - The resulting Contacts sheet that was created.  

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

