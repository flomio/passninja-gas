/**
 *  Contains createSpreadsheet + all menu functions
 * @module core
 */

/** ~*--*~ RUN ME FIRST ~*--*~
 *  Creates the necessary demo spreadsheet in the user's spreadsheets.
 *  Spreadsheet is linked via a trigger to the script.
 */
function createSpreadsheet() {
  log(log.FUNCTION, 'Starting CREATESPREADSHEET');
  try {
    log(log.STATUS, 'Checking for existing sheet first.');
    const ss = getLinkedSpreadsheet();
    ss.rename(`${ss.getName()}_${ENUMS.DISCONNECTED}`);
  } catch (err) {
    log(log.STATUS, 'No sheet found, continuing...');
  }
  setEnvVar(ENUMS.FIELDS_HASH, '');
  const ss = SpreadsheetApp.create(`PassNinja ${localizeString('Demo Spreadsheet')} - ${now()}`);

  ScriptApp.getProjectTriggers().forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('onOpen').forSpreadsheet(ss).onOpen().create();

  buildConfigSheet(ss);
  ss.deleteSheet(ss.getSheets()[0]);
  setEnvVar(ENUMS.CURRENT_SPREADSHEET_ID, ss.getId());
  setEnvVar(ENUMS.CURRENT_SPREADSHEET_URL, ss.getUrl());

  // POST CREATION VERIFICATION SETTINGS/LOGS FOLLOW:
  const currentUserEmail = Session.getActiveUser().getEmail();
  const currentSheetOwnerEmail = ss.getOwner().getEmail();
  const spreadsheetUrl = ss.getUrl();

  log(
    log.STATUS,
    ss.getSheets().map((sheet) => sheet.getName())
  );
  log(log.STATUS, `Current user is: ${currentUserEmail} and the new sheet is owned by: ${currentSheetOwnerEmail}`);

  setEnvVar(ENUMS.CURRENT_USER, currentUserEmail);
  setEnvVar(ENUMS.SPREADSHEET_NAME, ss.getName());
  setEnvVar(ENUMS.SPREADSHEET_CREATOR, currentSheetOwnerEmail);
  MailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    localizeString('Your PassNinja Spreadsheet'),
    localizeString(`Here is the link to your spreadsheet ${spreadsheetUrl}`)
  );
  log(log.FUNCTION, 'Finished CREATESPREADSHEET');
  throw new Error(`${localizeString('Successfully created spreadsheet, click Details for URL')} -> ${spreadsheetUrl}`);
}

/** Custom Trigger: adds the PassNinja script set as a menu item on load. */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('PassNinja')
    .addSubMenu(
      ui
        .createMenu(MENU_LABELS.selected.label)
        .addItem(MENU_LABELS.selected.create.label, 'createPass_')
        .addItem(MENU_LABELS.selected.mock.label, 'mockScan_')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(MENU_LABELS.config.label).addItem(MENU_LABELS.config.create.label, 'updateFromConfig_'))
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu(MENU_LABELS.credentials.label)
        .addItem(MENU_LABELS.credentials.twilio.label, 'storeTwilioDetails_')
        .addItem(MENU_LABELS.credentials.pn.label, 'storePassNinjaDetails_')
    )
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu(MENU_LABELS.overrides.label)
        .addItem(MENU_LABELS.overrides.rebuildConfig.label, 'buildConfigSheet_')
        .addItem(MENU_LABELS.overrides.rebuildSheets.label, 'forceUpdateFromConfig_')
        .addItem(MENU_LABELS.overrides.sendText.label, 'sendText_')
    )
    .addToUi();
}

/** Menu-item for updating the config even if nothing has changed */
function forceUpdateFromConfig_() {
  updateFromConfig_(true);
}

/** Menu-item for building the config even if nothing has changed */
function buildConfigSheet_() {
  buildConfigSheet(getLinkedSpreadsheet());
}

/** Menu command to stores the Twilio auth details into the Script Properties permanently..
 * @returns {ServiceError} If setup is cancelled.
 * @throws {ScriptError} If user cancels setup
 */
function storeTwilioDetails_() {
  const questions = [
    ['Enter your Twilio SID:', ENUMS.TWILIO_SID],
    ['Enter your Twilio AUTH:', ENUMS.TWILIO_AUTH],
    ['Enter your Twilio NUMBER:', ENUMS.TWILIO_NUMBER]
  ];
  storeSetupFromQuestions(questions, 'Twilio');
}

/** Responsible for storing user credentials for PassNinja API access
 * @throws {ScriptError} If the user cancels the setup
 */
function storePassNinjaDetails_() {
  const questions = [
    ['Enter your PassNinja Account ID:', ENUMS.PASSNINJA_ACCOUNT_ID],
    ['Enter your PassNinja Api Key:', ENUMS.PASSNINJA_API_KEY]
  ];
  storeSetupFromQuestions(questions, 'PassNinja');
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
  const fields = getConfigFields(ss);
  const fieldNames = fields.map((f) => f[0]);
  const constants = getConfigConstants(ss);
  const fieldsHash = getEnvVar(ENUMS.FIELDS_HASH, false);
  const hash = MD5(JSON.stringify(fields), true) + MD5(JSON.stringify(constants));
  log(log.STATUS, `Computed hash for fields data [new] <-> [old]: ${hash} <-> ${fieldsHash}`);

  if (force || hash !== fieldsHash) {
    buildEventsSheet(ss);
    buildScannersSheet(ss);
    buildContactsSheet(ss, fieldNames);
    buildContactsForm(ss, fields);
    setEnvVar(ENUMS.FIELDS_HASH, hash);
  } else {
    Browser.msgBox(
      localizeString('No Update'),
      localizeString("The Config sheet's field data has not changed, not updating."),
      Browser.Buttons.OK
    );
  }
}

/** Custom Trigger: inputs a new user's data from a form submit event and triggers a pass creation.
 *
 * @param {Object} e The form event to read from
 * @returns {string} "Lock Timeout" if the contact sheet queries cause a timeout
 */
function onboardNewPassholderFromForm(e) {
  log(log.FUNCTION, 'Starting onboardNewPassholderFromForm');
  const ss = new VSpreadsheet();
  const sheet = getSheet(ENUMS.CONTACTS, ss);
  const fieldsData = getNamedRange(ENUMS.CONFIG_FIELDS, ss)
    .getValues()
    .filter((v) => !!v[0]);
  const fieldsNames = fieldsData.map((f) => f[0]);

  const lock = LockService.getPublicLock();
  if (lock.tryLock(10000)) {
    sheet._internal.appendRow(fieldsNames.map((field) => e.namedValues[field][0]));
    lock.releaseLock();
  } else {
    return 'Lock Timeout';
  }
  sheet._internal.setActiveRange(sheet._internal.getRange(sheet._internal.getLastRow(), 1));
  log(log.FUNCTION, 'Finished onboardNewPassholderFromForm');
  createPass_();
}

/** Menu command to create a PassNinja pass from the selected row.
 * @returns {string} The response from the PassNinja API.
 * @throws {ServiceError} If the response from PassNinjaService is non 2xx.
 */
function createPass_() {
  log(log.FUNCTION, 'Starting createPass_');
  const ss = new VSpreadsheet();
  const contactSheet = getSheet(ENUMS.CONTACTS, ss);

  const passNinjaColumnStart = getColumnIndexFromString(contactSheet, ENUMS.PASSURL);
  const serialNumberColumnIndex = getColumnIndexFromString(contactSheet, ENUMS.SERIAL);
  const rowNumber = getValidSheetSelectedRow(contactSheet);

  const rowRange = contactSheet.getRange(rowNumber, 1, 1, passNinjaColumnStart - 1);
  const passNinjaContentRange = contactSheet._internal.getRange(rowNumber, passNinjaColumnStart, 1, 3);
  const passUrlRange = contactSheet._internal.getRange(rowNumber, passNinjaColumnStart, 1, 1);
  const serialNumberRange = contactSheet.getRange(rowNumber, serialNumberColumnIndex, 1, 1);

  const payloadJSONString = getRowPassPayload(rowRange, ss);
  const serial = serialNumberRange.getValue();

  const originalContent = passNinjaContentRange.getValues();
  highlightRange(passNinjaContentRange, ENUMS.STATUS_LOADING);
  passNinjaContentRange.setValues([['Please wait...', 'pass creation', 'in progress'].map((s) => localizeString(s))]);
  SpreadsheetApp.flush();

  let responseData;
  try {
    responseData = serial
      ? new PassNinjaService().putPass(payloadJSONString, serial)
      : new PassNinjaService().createPass(payloadJSONString);
  } catch (err) {
    let message = ['', '', ''];
    if (err instanceof CredentialsError) {
      message = ['Did you set your', 'PassNinja Credentials?', ''];
    } else {
      message = ['Error: Check', 'Events Sheet for details', ''];
    }
    passNinjaContentRange.setValues(
      rangeValuesExist(originalContent) ? originalContent : [message.map((s) => localizeString(s))]
    );
    highlightRange(passNinjaContentRange, ENUMS.STATUS_ERROR);
    autoResizeSheet(contactSheet._internal);

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

  highlightRange(passNinjaContentRange, ENUMS.STATUS_SUCCESS);
  contactSheet.setActiveSelection(passUrlRange);
  autoResizeSheet(contactSheet._internal);

  if (!serial) sendText_();

  log(log.FUNCTION, 'Finished createPass_');
  return response.getContentText();
}

/** Sends a text to the current row using the TwilioService and stored Script Properties.
 *  NOTE: only works if the header 'phoneNumber' is present
 * @throws {ServiceError} If the response from TwilioService is non 2xx.
 * @throws {CredentialsError} If the credentials from TwilioService are not set up.
 * @throws {Error} If an unexpected error occurred Starting TwilioService.
 */
function sendText_() {
  log(log.FUNCTION, 'Starting sendText_');
  let twilio;
  let phoneNumber;
  let passUrl;
  try {
    twilio = new TwilioService();
    const ss = new VSpreadsheet();
    const contactSheet = getSheet(ENUMS.CONTACTS, ss);
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
    throw new ScriptError('You must specify a phoneNumber field in order to use Twilio API capabilities.');
  }

  try {
    twilio.sendText(
      phoneNumber + '',
      `${localizeString('Please click the link to install the requested PassNinja NFC pass')}: ${passUrl}`
    );
  } catch (err) {
    log(log.ERROR, 'Twilio ran into an unexpected error: ', err);
    throw err;
  }
  log(log.FUNCTION, 'Finished sendText_');
}

function mockScan_() {
  let scannerSerialNumber;
  const ss = new VSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    `${localizeString('Please enter a scanner serial number or leave blank for default')} (RR464-0017564)`
  );
  if (response.getSelectedButton() == ui.Button.OK) {
    scannerSerialNumber = response.getResponseText() || 'RR464-0017564';
  } else {
    throw new ScriptError('Cancelling mock scan.');
  }
  log(log.FUNCTION, 'Starting mockScan_');
  const { passType, serialNumber } = getSelectedContactData(ss);
  addEvent(ss, JSON.stringify(createMockScanPayload(passType, serialNumber, scannerSerialNumber)));
  ss.flush();
  log(log.FUNCTION, 'Finished mockScan_');
}
