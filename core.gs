/** ~*--*~ RUN ME FIRST ~*--*~
 *  Creates the necessary demo spreadsheet in the user's spreadsheets.
 *  Spreadsheet is linked via a trigger to the script.
 */
function createSpreadsheet() {
  const ss = SpreadsheetApp.create(`PassNinja Demo Spreadsheet - ${new Date().toISOString()}`);

  Utilities.sleep(2000);

  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(ss)
    .onOpen()
    .create();

  buildConfigSheet(ss);
  ss.deleteSheet(ss.getSheetByName('Sheet1'));

  setEnvVar(ENUMS.CURRENT_SPREADSHEET_ID, ss.getId());
  setEnvVar(ENUMS.CURRENT_SPREADSHEET_URL, ss.getUrl());

  // POST CREATION VERIFICATION SETTINGS/LOGS FOLLOW:
  const currentUserEmail = Session.getActiveUser().getEmail();
  const currentSheetOwnerEmail = ss.getOwner().getEmail();
  const spreadsheetUrl = ss.getUrl();

  log(
    log.STATUS,
    ss.getSheets().map(sheet => sheet.getName())
  );
  log(log.STATUS, `Current user is: ${currentUserEmail} and the new sheet is owned by: ${currentSheetOwnerEmail}`);

  setEnvVar('current_user', currentUserEmail);
  setEnvVar('spreadsheet_name', ss.getName());
  setEnvVar('spreadsheet_creator', currentSheetOwnerEmail);
  MailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    'Your PassNinja Spreadsheet',
    `Here is the link to your spreadsheet ${spreadsheetUrl}`
  );
  throw new Error(`Successfully created spreadsheet, click Details for URL -> ${spreadsheetUrl}`);
}

/** Custom Trigger: adds the PassNinja script set as a menu item on load.
 *
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PassNinja')
    .addSubMenu(
      ui
        .createMenu('Selected Row')
        .addItem('Create/Update Pass', 'createPass_')
        .addItem('Run Mock Scan', 'mockScan_')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('Config/Setup').addItem('Create/Update Sheets From Config', 'updateFromConfig_'))
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu('Add Credentials')
        .addItem('Set Twilio Credentials', 'storeTwilioDetails_')
        .addItem('Set PassNinja Credentials', 'storePassNinjaDetails_')
    )
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu('Overrides')
        .addItem('Force (Re)Build of Config Sheet', 'buildConfigSheet_')
        .addItem('Force Create/Update Sheets From Config', 'forceUpdateFromConfig_')
        .addItem('Force Text passUrl to phoneNumber', 'sendText_')
    )
    .addToUi();
}

function forceUpdateFromConfig_() {
  updateFromConfig_(true);
}

function buildConfigSheet_() {
  buildConfigSheet(getLinkedSpreadsheet());
}

/** Menu command to stores the Twilio auth details into the Script Properties permanently..
 * @returns {ServiceError} If setup is cancelled.
 */
function storeTwilioDetails_() {
  const ui = SpreadsheetApp.getUi();

  const questions = [
    ['Enter your Twilio SID:', ENUMS.TWILIO_SID],
    ['Enter your Twilio AUTH:', ENUMS.TWILIO_AUTH],
    ['Enter your Twilio NUMBER:', ENUMS.TWILIO_NUMBER]
  ];
  for ([question, envVar] of questions) {
    const response = ui.prompt(question);
    if (response.getSelectedButton() == ui.Button.OK) {
      setEnvVar(envVar, response.getResponseText());
    } else {
      throw new ScriptError('Cancelling Twilio setup.');
    }
  }
}

function storePassNinjaDetails_() {
  const ui = SpreadsheetApp.getUi();

  const questions = [
    ['Enter your PassNinja Account ID:', ENUMS.PASSNINJA_ACCOUNT_ID],
    ['Enter your PassNinja Api Key:', ENUMS.PASSNINJA_API_KEY]
  ];
  for ([question, envVar] of questions) {
    const response = ui.prompt(question);
    if (response.getSelectedButton() == ui.Button.OK) {
      setEnvVar(envVar, response.getResponseText());
    } else {
      throw new ScriptError('Cancelling PassNinja account setup.');
    }
  }
}

/**
 * Creates a Google Form that allows respondents to select which conference
 * sessions they would like to attend, grouped by date and start time.
 *
 * @param {Spreadsheet} ss The spreadsheet that contains the conference data.
 * @param {string[]} values Cell values for the spreadsheet range.
 */
function updateFromConfig_(force = false) {
  const ss = getLinkedSpreadsheet();
  const fields = getConfigFields();
  const fieldNames = fields.map(f => f[0]);
  const constants = getConfigConstants();
  //  const fieldsHash = getEnvVar(ENUMS.FIELDS_HASH, false);
  // const hash = MD5(JSON.stringify(fields), true) + MD5(JSON.stringify(constants));
  // log(log.STATUS, `Computed hash for fieldsData [new] <-> [old]: ${hash} <-> ${fieldsHash}`);

  //  if (!force && hash !== fieldsHash) {
  catchError(() => buildEventsSheet(ss), 'Error building Contacts Form - ');
  catchError(() => buildScannersSheet(ss), 'Error building Scanners Form - ');
  catchError(() => buildContactsSheet(ss, fieldNames), 'Error building Contacts Sheet - ');
  catchError(() => buildContactsForm(ss, getSheet(ENUMS.CONTACTS), fields), 'Error building Contacts Form - ');
  //   setEnvVar(ENUMS.FIELDS_HASH, hash);
  //  } else {
  //    Browser.msgBox('No Update', "The Config sheet's field data has not changed, not updating.", Browser.Buttons.OK);
  //  }
}

/** Custom Trigger: inputs a new user's data from a form submit event and triggers a pass creation.
 *
 * @param {object} e The form event to read from
 * @returns {string} "Lock Timeout" if the contact sheet queries cause a timeout
 */
function onboardNewPassholderFromForm(e) {
  const ss = getLinkedSpreadsheet();
  const sheet = getSheet(ENUMS.CONTACTS);
  const fieldsData = getNamedRange('config_fields', ss)
    .getValues()
    .filter(v => !!v[0]);
  const fieldsNames = fieldsData.map(f => f[0]);

  const lock = LockService.getPublicLock();
  if (lock.tryLock(10000)) {
    sheet.appendRow(fieldsNames.map(field => e.namedValues[field][0]));
    lock.releaseLock();
  } else {
    return 'Lock Timeout';
  }
  autoResizeSheet(sheet);
  sheet.setActiveRange(sheet.getRange(sheet.getLastRow(), 1));
  createPass_();
}

/** Menu command to create a PassNinja pass from the selected row.
 * @returns {string} The response from the PassNinja API.
 * @returns {ServiceError} If the response from PassNinjaService is non 2xx.
 */
function createPass_() {
  const ss = getLinkedSpreadsheet();
  const contactSheet = getSheet(ENUMS.CONTACTS);

  const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
  const serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
  const rowNumber = getValidSheetSelectedRow(contactSheet);

  const rowRange = contactSheet.getRange(rowNumber, 1, 1, passNinjaColumnStart - 1);
  const passNinjaContentRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 3);
  const passUrlRange = contactSheet.getRange(rowNumber, passNinjaColumnStart, 1, 1);
  const serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex, 1, 1);

  const payloadJSONString = getRowPassPayload(rowRange);
  const serial = serialNumberRange.getValue();

  const originalContent = passNinjaContentRange.getValues();
  highlightCells(passNinjaContentRange, 'loading');
  passNinjaContentRange.setValues([['Please wait...', 'pass creation', 'in progress']]);
  SpreadsheetApp.flush();

  let responseData;
  try {
    responseData = serial
      ? new PassNinjaService().putPass(payloadJSONString, serial)
      : new PassNinjaService().createPass(payloadJSONString);
  } catch (err) {
    passNinjaContentRange.setValues(
      rangeValuesExist(originalContent) ? originalContent : [[['Did you set your'], ['PassNinja Credentials?'], ['']]]
    );
    highlightCells(passNinjaContentRange, 'error');
    autoResizeSheet(contactSheet);
    throw err;
  }
  log(log.SUCCESS, JSON.stringify(responseData));
  passNinjaContentRange.setValues([
    [
      responseData.landingUrl,
      responseData.apple.passTypeIdentifier.replace('pass.com.passninja.', ''),
      responseData.apple.serialNumber
    ]
  ]);

  highlightCells(passNinjaContentRange, 'success');
  contactSheet.setActiveSelection(passUrlRange);
  autoResizeSheet(contactSheet);

  if (!serial) sendText_();

  return response.getContentText();
}

/** Sends a text to the current row using the TwilioService and stored Script Properties.
 *  NOTE: only works if the header 'phoneNumber' is present
 * @returns {ServiceError} If the response from TwilioService is non 2xx.
 * @returns {CredentialsError} If the credentials from TwilioService are not set up.
 * @returns {Error} If an unexpected error occurred running TwilioService.
 */
function sendText_() {
  let twilio;
  let phoneNumber;
  let passUrl;
  try {
    twilio = new TwilioService();
    const contactSheet = getSheet(ENUMS.CONTACTS);
    passUrl = contactSheet
      .getRange(getValidSheetSelectedRow(contactSheet), getColumnIndexFromString(contactSheet, ENUMS.PASSURL), 1, 1)
      .getValue();
    phoneNumber = contactSheet
      .getRange(getValidSheetSelectedRow(contactSheet), getColumnIndexFromString(contactSheet, 'phoneNumber'), 1, 1)
      .getValue();
  } catch (err) {
    if (err instanceof CredentialsError) {
      log(log.ERROR, 'Twilio auth was not set up...ignoring sendText attempt.');
      return;
    }
    throw new ScriptError(
      'MISSING_FIELD',
      'You must specify a phoneNumber field in order to use Twilio API capabilities.'
    );
  }

  try {
    twilio.sendText(phoneNumber + '', `Please click the link to install the requested PassNinja NFC pass: ${passUrl}`);
  } catch (err) {
    log(log.ERROR, 'Twilio ran into an unexpected error: ', err);
    throw err;
  }
}

function mockScan_() {
  let scannerSerialNumber;
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Please enter a scanner serial number or leave blank for default (RR464-0017564)');
  if (response.getSelectedButton() == ui.Button.OK) {
    scannerSerialNumber = response.getResponseText() || 'RR464-0017564';
  } else {
    throw new ScriptError('Cancelling mock scan.');
  }
  const contactSheet = getSheet(ENUMS.CONTACTS);
  const rowNumber = getValidSheetSelectedRow(contactSheet);
  const serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
  const serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex);

  const payload = {
    reader: {
      type: 'FloBlePlus',
      serial_number: scannerSerialNumber,
      firmware: 'ACR1255U-J1 SWV 3.00.05'
    },
    uuid: Utilities.getUuid(),
    type: 'apple-pay',
    passTypeIdentifier: 'pass.com.passninja.ripped.beta',
    data: {
      timeStamp: '2020-03-10T15:17:04.789Z',
      message: serialNumberRange.getValue()
    }
  };
  processScanEvent(payload);
}
