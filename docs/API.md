## Modules

<dl>
<dt><a href="#module_handleGet">handleGet</a></dt>
<dd><p>Built in definition for API deployment GET method</p>
</dd>
<dt><a href="#module_handlePost">handlePost</a></dt>
<dd><p>Built in definition for API deployment POST method</p>
</dd>
</dl>

<a name="module_handleGet"></a>

## handleGet
Built in definition for API deployment GET method

<a name="module_handleGet..doGet"></a>

### handleGet~doGet(e) ⇒ <code>object</code>
Returns the corresponding user entry in the Contacts sheet
 matching the serialNumber query parameter

**Kind**: inner method of [<code>handleGet</code>](#module_handleGet)  
**Returns**: <code>object</code> - Standard response with a JavaScript text body  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | Request event data |

<a name="module_handlePost"></a>

## handlePost
Built in definition for API deployment POST method


* [handlePost](#module_handlePost)
    * [~doPost(e)](#module_handlePost..doPost) ⇒ <code>object</code>
    * [~addEvent(sheet, eventJson)](#module_handlePost..addEvent) ⇒ <code>boolean</code>

<a name="module_handlePost..doPost"></a>

### handlePost~doPost(e) ⇒ <code>object</code>
Creates an event entry in the Events spreadsheet

**Kind**: inner method of [<code>handlePost</code>](#module_handlePost)  
**Returns**: <code>object</code> - Standard response with a JavaScript text body  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | Request event data |

<a name="module_handlePost..addEvent"></a>

### handlePost~addEvent(sheet, eventJson) ⇒ <code>boolean</code>
Adds a PassNinja event to a new row in the target spreadsheet

**Kind**: inner method of [<code>handlePost</code>](#module_handlePost)  
**Returns**: <code>boolean</code> - If the action completed successfully  

| Param | Type | Description |
| --- | --- | --- |
| sheet | <code>Sheet</code> | Sheet to insert the event into |
| eventJson | <code>object</code> | JSON representation of the PassNinja event |

