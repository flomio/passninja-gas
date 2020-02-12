## Functions

<dl>
<dt><a href="#doGet">doGet(e)</a> ⇒ <code>object</code></dt>
<dd><p>Returns the corresponding user entry in the Contacts sheet
 matching the serialNumber query parameter</p>
</dd>
<dt><a href="#findContactBySerial">findContactBySerial(sheet, serialNumber)</a> ⇒ <code>object</code></dt>
<dd><p>Creates a JSON object from the first found match of the given serial number.</p>
</dd>
<dt><a href="#doPost">doPost(e)</a> ⇒ <code>object</code></dt>
<dd><p>Creates an event entry in the Events spreadsheet</p>
</dd>
<dt><a href="#addEvent">addEvent(targetSheet, eventJson)</a> ⇒ <code>boolean</code></dt>
<dd><p>Adds a PassNinja event to a new row in the target spreadsheet</p>
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

