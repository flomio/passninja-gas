function doGet(e) {
  var serialNumber = e.parameter.serialNumber;
  clientData = findContactBySerial(serialNumber);
  return ContentService.createTextOutput(JSON.stringify(clientData)).setMimeType(ContentService.MimeType.JSON);;
}

function findContactBySerial(serialNumber) {
    var spreadsheet = SpreadsheetApp.getActive();
    var ss = spreadsheet.getSheetByName('Contacts');
  var last=ss.getLastColumn();
  var data=ss.getRange(1,1,last,last).getValues();// create an array of data from columns A and B
// data = Array.from(data, item => typeof item === 'undefined' ? 0 : item);

for( var i = 0; i < data.length; i++ ) {
 if( typeof(data[i])==="undefined" ) {
  data[i] = "";
 }
}

  
  
  for(nn=1;nn<data.length;++nn){
    Logger.log(data[nn][13])
   // Logger.log(data);
    
    Logger.log(nn);
    if (data[nn][13]==serialNumber){break} ;// if a match in column B is found, break the loop
      }
  var data2 = [ data[0] , data[nn] ];
  Logger.log(data2);
return getJsonArrayFromData(data2)

}


function getJsonArrayFromData(data)
{

  var obj = {};
  var result = [];
  var headers = data[0];
  var cols = headers.length;
  var row = [];

  for (var i = 1, l = data.length; i < l; i++)
  {
    // get a row to fill the object
    row = data[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) 
    {
      // fill object with new values
      obj[headers[col]] = row[col];    
    }
    // add object in a final result
    result.push(obj);  
  }
  //tricked it to send an objct instead of array (result)
  return obj;  

}