/** Creates a default PassNinja formatted Google sheet on the given spreadsheet
 *
 * @param {string} name The name of the named range to query
 * @param {Spreadsheet} ss The Google spreadsheet to query
 * @returns {Sheet} The resulting Google sheet
 */
function initializeSheet(name, ss) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  const allCells = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  allCells.setBackground(COLORS.GENERIC);
  allCells.setFontColor(COLORS.TEXT);
  allCells.setFontFamily('Montserrat');
  allCells.setNumberFormat('@');

  return sheet;
}

/** Builds initial config sheet
 */
function buildConfigSheet(ss, force = false) {
  const sheet = initializeSheet(ENUMS.CONFIG, ss);
  const headerNames = [
    'Key              ',
    'Value                    ',
    null,
    'Name                  ',
    'In Template?',
    'Type      ',
    'Form Options (comma separated)'
  ];
  const headerRange = sheet.getRange(6, 1, 1, headerNames.length);

  headerRange.setValues([headerNames]);
  headerRange.setBackground(COLORS.FIELD_PASSNINJA);
  headerRange.setFontWeight('bold');

  sheet.getRange(1, 1, 5, 7).setBackground(COLORS.FIELD_PASSNINJA);
  sheet
    .getRange(6, 3, sheet.getMaxRows(), 1)
    .setBackground(COLORS.FIELD_PASSNINJA)
    .setFontWeight('bold')
    .setFontColor(COLORS.TEXT_ON);
  sheet.getRange(7, 1, 1, 1).setValue('passType');
  sheet.getRange(7, 2, 1, 1).setNote('You must specify a passType to create passes.');

  // TODO: Implement some kind of protection.  This causes a timeout.
  // sheet.getRange(2, 1, 1, 1).protect().setDescription('Sample protected range');

  ss.setNamedRange(ENUMS.CONFIG_CONSTANTS, sheet.getRange(7, 1, sheet.getMaxRows(), 2));
  ss.setNamedRange(ENUMS.CONFIG_FIELDS, sheet.getRange(7, 4, sheet.getMaxRows(), 4));

  const validationInPass = SpreadsheetApp.newDataValidation()
    .requireValueInList(['N', 'Y'], true)
    .setAllowInvalid(false)
    .build();

  const validationFormType = SpreadsheetApp.newDataValidation()
    .requireValueInList(['text', 'date', 'datetime', 'time', 'duration'], true)
    .setAllowInvalid(false)
    .build();

  const fieldInPassRange = sheet.getRange(7, headerNames.indexOf('In Template?') + 1, sheet.getMaxRows(), 1);
  fieldInPassRange.setDataValidation(validationInPass);
  fieldInPassRange.setHorizontalAlignment('center').setValue('N');

  const formTypeRange = sheet.getRange(7, headerNames.indexOf('Type      ') + 1, sheet.getMaxRows(), 1);
  formTypeRange.setDataValidation(validationFormType);
  formTypeRange.setHorizontalAlignment('center').setValue('text');

  deleteUnusedColumns(headerNames.length + 1, sheet.getMaxColumns(), sheet);
  autoResizeSheet(sheet);
  const titleRange = sheet.getRange(1, 1, 4, 4);

  titleRange.merge();
  titleRange.setValue('01 CONFIG');
  titleRange.setFontSize(36);
  titleRange.setVerticalAlignment('TOP');

  sheet.getRange(1, 5, 4, 1).setFontSize(8);
  sheet.getRange(1, 5).setValue('INSTRUCTIONS:');
  sheet.getRange(2, 5).setValue('1) Specify what passType this app will be using under General Setup.');
  sheet.getRange(3, 5).setValue('2) Enter all the custom field names you have in your template.');
  sheet.getRange(4, 5).setValue('3) then, PassNinja... Setup... Create/Update Sheets from Config');
  sheet.getRange(5, 1).setValue('General Setup');
  sheet.getRange(5, 4).setValue('Define fields for the form that will be used to create passes');

  sheet.getRange(5, 1, 2, 2).setBorder(true, true, true, true, false, false, COLORS.BORDER, null);
  sheet.getRange(5, 4, 2, 4).setBorder(true, true, true, true, false, false, COLORS.BORDER, null);
  sheet.getRange(1, 1, 6, 7).setFontColor(COLORS.TITLE_TEXT);
  sheet.setColumnWidth(3, 22);
  log(log.SUCCESS, 'Successfully built/updated Events sheet');
}

/** Builds a events sheet based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildEventsSheet(ss) {
  const sheet = initializeSheet(ENUMS.EVENTS, ss);

  const fieldsNames = ['eventDate', 'eventType', 'passType', 'serialNumber', 'eventData'];
  const fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length);
  fieldHeaders.setValues([fieldsNames]);
  fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA);
  fieldHeaders.setFontWeight('bold');
  fieldHeaders.setFontColor(COLORS.TITLE_TEXT);

  deleteUnusedColumns(fieldsNames.length + 1, sheet.getMaxColumns(), sheet);

  log(log.SUCCESS, 'Successfully built/updated Events sheet');
}

/** Builds a scanners sheet based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildScannersSheet(ss) {
  const sheet = initializeSheet(ENUMS.SCANNERS, ss);
  const fieldsNames = ['serialNumber', 'deviceAuthorized', 'activeHourStart', 'activeHourEnd', 'unitPrice', 'deviceNumber', 'deviceStatus','currentPassSerial'];
  const fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length);
  fieldHeaders.setValues([fieldsNames]);
  fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA);
  fieldHeaders.setFontWeight('bold');
  fieldHeaders.setFontColor(COLORS.TITLE_TEXT);

  deleteUnusedColumns(fieldsNames.length + 1, sheet.getMaxColumns(), sheet);

  log(log.SUCCESS, 'Successfully built/updated Scanners sheet');
}
/** Builds a contacts sheet based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 * @returns {Sheet} The resulting Contacts sheet that was created.
 */
function buildContactsSheet(ss, fieldsNames) {
  const sheet = initializeSheet(ENUMS.CONTACTS, ss);

  const fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length);
  fieldHeaders.setValues([fieldsNames]);
  fieldHeaders.setBackground(COLORS.FIELD_PASS);
  fieldHeaders.setFontWeight('bold');
  fieldHeaders.setFontColor(COLORS.TITLE_TEXT);

  const passNinjaFields = [ENUMS.PASSURL, ENUMS.PASSTYPE, ENUMS.SERIAL];
  const passNinjaHeaders = sheet.getRange(1, fieldsNames.length + 1, 1, passNinjaFields.length);
  passNinjaHeaders.setValues([passNinjaFields]);
  passNinjaHeaders.setBackground(COLORS.FIELD_PASSNINJA);
  passNinjaHeaders.setFontWeight('bold');
  passNinjaHeaders.setFontColor(COLORS.TITLE_TEXT);

  deleteUnusedColumns(passNinjaFields.length + fieldsNames.length + 1, sheet.getMaxColumns(), sheet);

  log(log.SUCCESS, 'Successfully built/updated Contacts sheet');
  return sheet;
}

/** Builds a form based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {Sheet} sheet The container sheet for the form
 * @param {string[]} fieldData The fields that the user has entered in the config
 */
function buildContactsForm(ss, sheet, fieldData) {
  let form;
  try {
    form = FormApp.openByUrl(ss.getFormUrl());
    clearFormDestinationSheet(form);
  } catch (e) {
    log(log.STATUS, 'No previous form detected, creating...');
    form = FormApp.create('Create New Contact');
  } finally {
    clearForm(form);
  }

  const triggers = ScriptApp.getProjectTriggers();
  if (
    !triggers.filter(
      t => t.getHandlerFunction() === 'onboardNewPassholderFromForm' && t.getTriggerSourceId() === ss.getId()
    ).length
  ) {
    ScriptApp.newTrigger('onboardNewPassholderFromForm')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    log(log.SUCCESS, 'Successfully created form trigger');
  }

  for (field of fieldData) {
    let [fieldName, includeInPass, fieldType, fieldOptions] = field;
    if (!fieldType) fieldType = 'text';
    form[FORM_LOOKUP[fieldType]]()
      .setTitle(fieldName)
      .setRequired(includeInPass === 'Y');
  }
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  getFormDestinationSheet(form).hideSheet();
  log(log.SUCCESS, 'Successfully built Contacts Form.');
}
