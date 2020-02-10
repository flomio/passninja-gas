function doGet(e) {
  var serialNumber = e.parameter.serialNumber;
  clientData = findContactBySerial(serialNumber);
  return ContentService.createTextOutput(JSON.stringify(clientData)).setMimeType(ContentService.MimeType.JSON);;
}

function getColumnFromName(sheet, name) {
  var headers = sheet.getRange(1,1,1,sheet.getLastRow()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] == name) return i + 1;
  }
  return -1;
}

function findContactBySerial(serialNumber) {
   var spreadsheet = SpreadsheetApp.getActive();
   var ss = spreadsheet.getSheetByName('Contacts');
   var last=ss.getLastColumn();
   var data=ss.getRange(1,1,last,last).getValues();
   // data = Array.from(data, item => typeof item === 'undefined' ? 0 : item); //no es6 for now

   for( var i = 0; i < data.length; i++ ) {
      if( typeof(data[i])==="undefined" ) {
         data[i] = "";
      }
  }
  
  var serialNumberColumn = getColumnFromName(ss, 'serialNumber') -1 ; //its in a js array so -1
  Logger.log("serialNumberColumn: ", serialNumberColumn);
  for(nn=1;nn<data.length;++nn){
    Logger.log(nn);
    Logger.log(data[nn][serialNumberColumn])

    if (data[nn][serialNumberColumn]==serialNumber){break} ;// if a match in column[13] is found, break the loop
  }
  var data2 = [ data[0] , data[nn] ];
  Logger.log(data2);
  return getJsonArrayFromData(data2)
}


function getJsonArrayFromData(data)
{
  var obj = {};
  var headers = data[0];
  var cols = headers.length;
  var row = [];

  for (var i = 1, l = data.length; i < l; i++)
  {
    row = data[i];
    obj = {};
    for (var col = 0; col < cols; col++) 
    {
      obj[headers[col]] = row[col];    
    }
  }
  return obj;  
}