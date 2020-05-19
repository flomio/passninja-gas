## Modules

<dl>
<dt><a href="#module_core">core</a></dt>
<dd><p>Contains createSpreadsheet + all menu functions</p>
</dd>
<dt><a href="#module_build">build</a></dt>
<dd><p>Responsible for building all GAS sheets</p>
</dd>
</dl>

<a name="module_core"></a>

## core
Contains createSpreadsheet + all menu functions


* [core](#module_core)
    * [~createSpreadsheet()](#module_core..createSpreadsheet)
    * [~onOpen()](#module_core..onOpen)
    * [~forceUpdateFromConfig_()](#module_core..forceUpdateFromConfig_)
    * [~buildConfigSheet_()](#module_core..buildConfigSheet_)
    * [~storeTwilioDetails_()](#module_core..storeTwilioDetails_) ⇒ <code>ServiceError</code>
    * [~storePassNinjaDetails_()](#module_core..storePassNinjaDetails_)
    * [~updateFromConfig_(ss, values)](#module_core..updateFromConfig_)
    * [~onboardNewPassholderFromForm(e)](#module_core..onboardNewPassholderFromForm) ⇒ <code>string</code>
    * [~createPass_()](#module_core..createPass_) ⇒ <code>string</code>
    * [~sendText_()](#module_core..sendText_)

<a name="module_core..createSpreadsheet"></a>

### core~createSpreadsheet()
~*--*~ RUN ME FIRST ~*--*~
 Creates the necessary demo spreadsheet in the user's spreadsheets.
 Spreadsheet is linked via a trigger to the script.

**Kind**: inner method of [<code>core</code>](#module_core)  
<a name="module_core..onOpen"></a>

### core~onOpen()
Custom Trigger: adds the PassNinja script set as a menu item on load.

**Kind**: inner method of [<code>core</code>](#module_core)  
<a name="module_core..forceUpdateFromConfig_"></a>

### core~forceUpdateFromConfig\_()
Menu-item for updating the config even if nothing has changed

**Kind**: inner method of [<code>core</code>](#module_core)  
<a name="module_core..buildConfigSheet_"></a>

### core~buildConfigSheet\_()
Menu-item for building the config even if nothing has changed

**Kind**: inner method of [<code>core</code>](#module_core)  
<a name="module_core..storeTwilioDetails_"></a>

### core~storeTwilioDetails\_() ⇒ <code>ServiceError</code>
Menu command to stores the Twilio auth details into the Script Properties permanently..

**Kind**: inner method of [<code>core</code>](#module_core)  
**Returns**: <code>ServiceError</code> - If setup is cancelled.  
**Throws**:

- <code>ScriptError</code> If user cancels setup

<a name="module_core..storePassNinjaDetails_"></a>

### core~storePassNinjaDetails\_()
Responsible for storing user credentials for PassNinja API access

**Kind**: inner method of [<code>core</code>](#module_core)  
**Throws**:

- <code>ScriptError</code> If the user cancels the setup

<a name="module_core..updateFromConfig_"></a>

### core~updateFromConfig\_(ss, values)
Creates a Google Form that allows respondents to select which conference
sessions they would like to attend, grouped by date and start time.

**Kind**: inner method of [<code>core</code>](#module_core)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The spreadsheet that contains the conference data. |
| values | <code>Array.&lt;string&gt;</code> | Cell values for the spreadsheet range. |

<a name="module_core..onboardNewPassholderFromForm"></a>

### core~onboardNewPassholderFromForm(e) ⇒ <code>string</code>
Custom Trigger: inputs a new user's data from a form submit event and triggers a pass creation.

**Kind**: inner method of [<code>core</code>](#module_core)  
**Returns**: <code>string</code> - "Lock Timeout" if the contact sheet queries cause a timeout  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | The form event to read from |

<a name="module_core..createPass_"></a>

### core~createPass\_() ⇒ <code>string</code>
Menu command to create a PassNinja pass from the selected row.

**Kind**: inner method of [<code>core</code>](#module_core)  
**Returns**: <code>string</code> - The response from the PassNinja API.  
**Throws**:

- <code>ServiceError</code> If the response from PassNinjaService is non 2xx.

<a name="module_core..sendText_"></a>

### core~sendText\_()
Sends a text to the current row using the TwilioService and stored Script Properties.
 NOTE: only works if the header 'phoneNumber' is present

**Kind**: inner method of [<code>core</code>](#module_core)  
**Throws**:

- <code>ServiceError</code> If the response from TwilioService is non 2xx.
- <code>CredentialsError</code> If the credentials from TwilioService are not set up.
- <code>Error</code> If an unexpected error occurred Starting TwilioService.

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

