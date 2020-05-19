## Modules

<dl>
<dt><a href="#module_scan">scan</a></dt>
<dd><p>All functions relating to scanning feature</p>
</dd>
<dt><a href="#module_services">services</a></dt>
<dd><p>Contains Service clases for all external service calls</p>
</dd>
</dl>

<a name="module_scan"></a>

## scan
All functions relating to scanning feature


* [scan](#module_scan)
    * [~createMockScanPayload(passType, serialNumber, scannerSerialNumber)](#module_scan..createMockScanPayload) ⇒ <code>Object</code>
    * [~getScanner(scannerSheet, serialNumber)](#module_scan..getScanner) ⇒ <code>ScannerMatch</code>
    * [~validateScan(status, eventPassSerial, currentPassSerial, date, start, end, provisioned)](#module_scan..validateScan)
    * [~getScannerEventTimes(eventDate, scannerStart, scannerEnd)](#module_scan..getScannerEventTimes) ⇒ <code>Object</code>
    * [~updateScannerSheetAndPass(ss, contactSheet, scannersSheet, status, id, serialNumberCellRange, serialNumber, scannerMatchIndex, contactMatchIndex)](#module_scan..updateScannerSheetAndPass)
    * [~getRowSerialMatchIndex(contactSheet, serialNumber)](#module_scan..getRowSerialMatchIndex) ⇒ <code>number</code>
    * [~processScanEvent(ss, eventJson)](#module_scan..processScanEvent) ⇒ <code>Object</code>
    * [~ScannerMatch](#module_scan..ScannerMatch) : <code>Object</code>

<a name="module_scan..createMockScanPayload"></a>

### scan~createMockScanPayload(passType, serialNumber, scannerSerialNumber) ⇒ <code>Object</code>
Generates a mock payload for a scan event that matches the format of a PN scan event

**Kind**: inner method of [<code>scan</code>](#module_scan)  
**Returns**: <code>Object</code> - Mock scan event payload with current time and relevant details  

| Param | Type | Description |
| --- | --- | --- |
| passType | <code>string</code> | The passninja passtype |
| serialNumber | <code>string</code> | a UUID that matches a serial number in the Contacts sheet |
| scannerSerialNumber | <code>string</code> | a UUID that matches a scanner serial Number in the Scanners sheet |

<a name="module_scan..getScanner"></a>

### scan~getScanner(scannerSheet, serialNumber) ⇒ <code>ScannerMatch</code>
Finds a matching scanner from the scanner sheet or returns {-1, number}

**Kind**: inner method of [<code>scan</code>](#module_scan)  

| Param | Type | Description |
| --- | --- | --- |
| scannerSheet | <code>Sheet</code> | The sheet object for the Scanner sheet |
| serialNumber | <code>string</code> | a UUID for the scanner we are looking for |

<a name="module_scan..validateScan"></a>

### scan~validateScan(status, eventPassSerial, currentPassSerial, date, start, end, provisioned)
Overall validation for business permission logic of scan event

**Kind**: inner method of [<code>scan</code>](#module_scan)  
**Throws**:

- <code>ScriptError</code> If one of the validations is not passed it will throw a related error


| Param | Type | Description |
| --- | --- | --- |
| status | <code>string</code> | The scanner status, either: "RESERVED" | "AVAILABLE" |
| eventPassSerial | <code>string</code> | UUID of the scanned pass |
| currentPassSerial | <code>string</code> | UUID of the currently used pass, "" | UUID |
| date | <code>string</code> | The date of the scan event |
| start | <code>string</code> | The available start time for the scanner in format "HH:mm" |
| end | <code>string</code> | The available end time for the scanner in format "HH:mm" |
| provisioned | <code>string</code> | Whether we can use this scanner or not, TRUE | "" |

<a name="module_scan..getScannerEventTimes"></a>

### scan~getScannerEventTimes(eventDate, scannerStart, scannerEnd) ⇒ <code>Object</code>
Returns all times in a normalized format of total minutes

**Kind**: inner method of [<code>scan</code>](#module_scan)  
**Returns**: <code>Object</code> - The formatted times in total minute format for { eventTime, startTime, endTime }  
**Throws**:

- <code>ScriptError</code> If the scanner fields are incorrectly formatted


| Param | Type | Description |
| --- | --- | --- |
| eventDate | <code>string</code> | The date of the scan event |
| scannerStart | <code>string</code> | The available start time for the scanner in format "HH:mm" |
| scannerEnd | <code>string</code> | The available end time for the scanner in format "HH:mm" |

<a name="module_scan..updateScannerSheetAndPass"></a>

### scan~updateScannerSheetAndPass(ss, contactSheet, scannersSheet, status, id, serialNumberCellRange, serialNumber, scannerMatchIndex, contactMatchIndex)
Responsible for updating the scanner sheet from a scan event and PUT updating the scanned pass

**Kind**: inner method of [<code>scan</code>](#module_scan)  

| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> |  |
| contactSheet | <code>Sheet</code> |  |
| scannersSheet | <code>Sheet</code> |  |
| status | <code>string</code> | The status of the scanner being used: "AVAILABLE" | "RESERVED" |
| id | <code>string</code> | The ID of the scanner to be added to the pass |
| serialNumberCellRange | <code>Range</code> | The range for the attachedPassSerialNumber entry in the Scanners sheet |
| serialNumber | <code>string</code> | The serial number of the scanned pass |
| scannerMatchIndex | <code>number</code> | Row index in the Scanners sheet for the matching scanner |
| contactMatchIndex | <code>number</code> | Row index in the Contacts sheet for the matching pass |

<a name="module_scan..getRowSerialMatchIndex"></a>

### scan~getRowSerialMatchIndex(contactSheet, serialNumber) ⇒ <code>number</code>
Finds a mtaching row number for the serial in question in the Contacts sheet

**Kind**: inner method of [<code>scan</code>](#module_scan)  
**Returns**: <code>number</code> - Row index if found, -1 if not  

| Param | Type | Description |
| --- | --- | --- |
| contactSheet | <code>Sheet</code> | The object for Contacts sheet |
| serialNumber | <code>string</code> | The serial number to match |

<a name="module_scan..processScanEvent"></a>

### scan~processScanEvent(ss, eventJson) ⇒ <code>Object</code>
Overall function responsible for processing an inbound scan event

**Kind**: inner method of [<code>scan</code>](#module_scan)  
**Returns**: <code>Object</code> - The response from our sheet updating with any modifications  
**Throws**:

- <code>ScriptError</code> If we cannot find a matching scanner or matching pass will throw an error


| Param | Type | Description |
| --- | --- | --- |
| ss | <code>Spreadsheet</code> | The spreadsheet we are using to process the event |
| eventJson | <code>Object</code> | The incoming event json to be parsed |

<a name="module_scan..ScannerMatch"></a>

### scan~ScannerMatch : <code>Object</code>
**Kind**: inner typedef of [<code>scan</code>](#module_scan)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| scannerMatchIndex | <code>number</code> | The matching index for the scanner row (-1 if not found) |
| passSerialNumberColumnIndex | <code>number</code> | The attached serial number column |

<a name="module_services"></a>

## services
Contains Service clases for all external service calls


* [services](#module_services)
    * [~PassNinjaService](#module_services..PassNinjaService)
        * [.createPass(payload)](#module_services..PassNinjaService+createPass) ⇒ <code>HTTPResponse</code>
        * [.putPass(payload, serial)](#module_services..PassNinjaService+putPass) ⇒ <code>HTTPResponse</code>
    * [~PassNinjaScannerService](#module_services..PassNinjaScannerService)
        * [.notifyScanner(payload)](#module_services..PassNinjaScannerService+notifyScanner) ⇒ <code>HTTPResponse</code>
    * [~TwilioService](#module_services..TwilioService)
        * [.formatE164PhoneNumber()](#module_services..TwilioService+formatE164PhoneNumber) ⇒ <code>string</code> \| <code>null</code>
        * [.sendText(to, body)](#module_services..TwilioService+sendText)
    * [~sendRequest(url, options, serviceName)](#module_services..sendRequest) ⇒ <code>HTTPResponse</code>

<a name="module_services..PassNinjaService"></a>

### services~PassNinjaService
Class used to access the PassNinja API.

**Kind**: inner class of [<code>services</code>](#module_services)  

* [~PassNinjaService](#module_services..PassNinjaService)
    * [.createPass(payload)](#module_services..PassNinjaService+createPass) ⇒ <code>HTTPResponse</code>
    * [.putPass(payload, serial)](#module_services..PassNinjaService+putPass) ⇒ <code>HTTPResponse</code>

<a name="module_services..PassNinjaService+createPass"></a>

#### passNinjaService.createPass(payload) ⇒ <code>HTTPResponse</code>
Creates a PN pass

**Kind**: instance method of [<code>PassNinjaService</code>](#module_services..PassNinjaService)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Object</code> | https://passninja.com/docs#passes-passes-with-passninja-templates-post |

<a name="module_services..PassNinjaService+putPass"></a>

#### passNinjaService.putPass(payload, serial) ⇒ <code>HTTPResponse</code>
Updates a PN pass

**Kind**: instance method of [<code>PassNinjaService</code>](#module_services..PassNinjaService)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Object</code> | https://passninja.com/docs#passes-passes-with-passninja-templates-post |
| serial | <code>string</code> | UUID for the pass to update |

<a name="module_services..PassNinjaScannerService"></a>

### services~PassNinjaScannerService
Class used to access the PassNinja Scanner API (placeholder)

**Kind**: inner class of [<code>services</code>](#module_services)  
<a name="module_services..PassNinjaScannerService+notifyScanner"></a>

#### passNinjaScannerService.notifyScanner(payload) ⇒ <code>HTTPResponse</code>
Notifies the scanner of the scan event and processed outcome

**Kind**: instance method of [<code>PassNinjaScannerService</code>](#module_services..PassNinjaScannerService)  
**Returns**: <code>HTTPResponse</code> - The scanner service response  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Object</code> | To be determined |

<a name="module_services..TwilioService"></a>

### services~TwilioService
Class used to access the Twilio API

**Kind**: inner class of [<code>services</code>](#module_services)  

* [~TwilioService](#module_services..TwilioService)
    * [.formatE164PhoneNumber()](#module_services..TwilioService+formatE164PhoneNumber) ⇒ <code>string</code> \| <code>null</code>
    * [.sendText(to, body)](#module_services..TwilioService+sendText)

<a name="module_services..TwilioService+formatE164PhoneNumber"></a>

#### twilioService.formatE164PhoneNumber() ⇒ <code>string</code> \| <code>null</code>
Formats number to rough E164 standard:
https://www.twilio.com/docs/glossary/what-e164

**Kind**: instance method of [<code>TwilioService</code>](#module_services..TwilioService)  
**Returns**: <code>string</code> - Phone number in E164 format<code>null</code> - If phone number is not valid.  
**Params**: <code>string</code> rawPhoneNumber The raw phone number string input  
<a name="module_services..TwilioService+sendText"></a>

#### twilioService.sendText(to, body)
Sends a text using the Twilio API if credentials have been set up in the script.

**Kind**: instance method of [<code>TwilioService</code>](#module_services..TwilioService)  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>string</code> | The phone number to send the text to |
| body | <code>string</code> | The body of the text to send |

<a name="module_services..sendRequest"></a>

### services~sendRequest(url, options, serviceName) ⇒ <code>HTTPResponse</code>
The generic function for Starting an external call

**Kind**: inner method of [<code>services</code>](#module_services)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The url used in the request |
| options | <code>object</code> | The options used for the request: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params |
| serviceName | <code>string</code> | The calling service for debugging purposes |

