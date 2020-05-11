/**
 * Responsible for building all GAS sheets
 * @module build
 */

/** Creates a default PassNinja formatted Google sheet on the given spreadsheet
 *
 * @param {string} name The name of the named range to query
 * @param {Spreadsheet} ss The Google spreadsheet to query
 * @returns {Sheet} The resulting Google sheet
 */
function initializeSheet(name, ss) {
  log(log.FUNCTION, 'Starting initializeSheet');
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  const allCells = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  allCells.setBackground(COLORS.GENERIC);
  allCells.setFontColor(COLORS.TEXT);
  allCells.setFontFamily('Montserrat');
  allCells.setNumberFormat('@');

  log(log.FUNCTION, 'Finished initializeSheet');
  return sheet;
}

/** Cleanup function for removing unused columns/rows and resizing the sheet
 *
 * @param {Sheet} sheet The Google sheet to modify
 */
function onPostSheetCreate(sheet) {
  log(log.FUNCTION, 'Starting onPostSheetCreate');
  const sheetConfig = SHEET_DEFAULTS[sheet.getName()];
  if (sheetConfig && sheetConfig.rows) {
    shrinkSheetRows(sheet, sheetConfig.rows);
  }
  if (sheetConfig && sheetConfig.widths) {
    sheetConfig.widths.map((width, columnIndex) => {
      if (width) sheet.setColumnWidth(columnIndex + 1, width);
      else sheet.autoResizeColumn(columnIndex + 1);
    });
  } else {
    autoResizeSheet(sheet);
  }

  autoDeleteUnusedColumns(sheet);
  log(log.FUNCTION, 'Finished onPostSheetCreate');
}

/** Builds initial config sheet
 */
function buildConfigSheet(ss) {
  log(log.FUNCTION, 'Starting buildConfigSheet');
  const CONTENT_START = 7;
  const HEADER_START = 6;
  const sheet = initializeSheet(ENUMS.CONFIG, ss);
  const headerNames = [
    CONFIG_LABELS.headers.key,
    CONFIG_LABELS.headers.value,
    '',
    CONFIG_LABELS.headers.name,
    CONFIG_LABELS.headers.template
  ];
  const sourceScriptUrl = `=HYPERLINK("${getScriptUrl()}", ${CONFIG_LABELS.source})`;

  const headerRange = sheet.getRange(HEADER_START, 1, 1, headerNames.length);
  headerRange.setValues([headerNames]);
  headerRange.setBackground(COLORS.FIELD_PASSNINJA);
  headerRange.setFontWeight('bold');

  sheet.getRange(1, 1, 5, CONTENT_START).setBackground(COLORS.FIELD_PASSNINJA);
  sheet
    .getRange(HEADER_START, 3, sheet.getMaxRows(), 1)
    .setBackground(COLORS.FIELD_PASSNINJA)
    .setFontWeight('bold')
    .setFontColor(COLORS.TEXT_ON);
  sheet.getRange(CONTENT_START, 1, 1, 1).setValue(CONFIG_LABELS.passType.lable);
  sheet.getRange(CONTENT_START, 2, 1, 1).setNote(CONFIG_LABELS.passType.info);
  sheet.getRange(CONTENT_START + 1, 1, sheet.getMaxRows(), 2).setBackground(COLORS.FIELD_PASSNINJA);

  // TODO: Implement some kind of protection.  This causes a timeout.
  // sheet.getRange(2, 1, 1, 1).protect().setDescription('Sample protected range');

  ss.setNamedRange(ENUMS.CONFIG_CONSTANTS, sheet.getRange(CONTENT_START, 1, sheet.getMaxRows(), 2));
  ss.setNamedRange(ENUMS.CONFIG_FIELDS, sheet.getRange(CONTENT_START, 4, sheet.getMaxRows(), 4));

  const validationInPass = SpreadsheetApp.newDataValidation()
    .requireValueInList([CONFIG_LABELS.confirm.no, CONFIG_LABELS.confirm.yes], true)
    .setAllowInvalid(false)
    .build();

  const fieldInPassRange = sheet.getRange(
    CONTENT_START,
    headerNames.indexOf(CONFIG_LABELS.headers.template) + 1,
    sheet.getMaxRows()
  );
  fieldInPassRange
    .setDataValidation(validationInPass)
    .setHorizontalAlignment('center')
    .setValue(CONFIG_LABELS.confirm.yes);

  sheet.getRange(1, 1, 4, 2).merge().setValue(CONFIG_LABELS.title).setFontSize(24).setVerticalAlignment('middle');
  sheet.getRange(1, 3, 4, 2).merge().setValue(sourceScriptUrl).setVerticalAlignment('middle');
  sheet.getRange(1, 5, CONFIG_LABELS.instructions.length).setFontSize(8).setValues(CONFIG_LABELS.instructions);
  sheet.getRange(5, 1, 1, 2).merge().setValue(CONFIG_LABELS.general.label);
  sheet.getRange(5, 4, 1, 3).merge().setValue(CONFIG_LABELS.general.info);

  sheet.getRange(5, 1, 2, 2).setBorder(true, true, true, true, false, false, COLORS.BORDER, null);
  sheet.getRange(5, 4, 2, 4).setBorder(true, true, true, true, false, false, COLORS.BORDER, null);
  sheet.getRange(1, 1, 6, headerNames.length).setFontColor(COLORS.TITLE_TEXT);

  onPostSheetCreate(sheet);
  log(log.SUCCESS, 'Successfully built/updated Events sheet');
  log(log.FUNCTION, 'Finished buildConfigSheet');
}

/** Builds a events sheet based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildEventsSheet(ss) {
  log(log.FUNCTION, 'Starting buildEventsSheet');
  const sheet = initializeSheet(ENUMS.EVENTS, ss);

  const fieldsNames = [
    EVENTS_LABELS.date,
    EVENTS_LABELS.eventType,
    EVENTS_LABELS.passType,
    EVENTS_LABELS.serial,
    EVENTS_LABELS.data
  ];
  const fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length);
  fieldHeaders.setValues([fieldsNames]);
  fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA);
  fieldHeaders.setFontWeight('bold');
  fieldHeaders.setFontColor(COLORS.TITLE_TEXT);

  onPostSheetCreate(sheet);
  log(log.SUCCESS, 'Successfully built/updated Events sheet');
  log(log.FUNCTION, 'Finished buildEventsSheet');
}

/** Builds a scanners sheet based on the user config sheet with one default scanner
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildScannersSheet(ss) {
  log(log.FUNCTION, 'Starting buildScannersSheet');
  const sheet = initializeSheet(ENUMS.SCANNERS, ss);

  const fieldHeaders = sheet.getRange(1, 1, 1, SCANNERS_FIELDS.length);
  fieldHeaders.setValues([SCANNERS_FIELDS]);
  fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA);
  fieldHeaders.setFontWeight('bold');
  fieldHeaders.setFontColor(COLORS.TITLE_TEXT);
  const firstRow = sheet.getRange(2, 1, 1, SCANNERS_FIELDS.length);
  if (firstRow.getValues()[0][0] !== 'RR464-0017564') {
    firstRow.setValues([['RR464-0017564', '1', ENUMS.AVAILABLE, ENUMS.TRUE, '', '03:00', '23:45', '$0.00']]);
  }
  onPostSheetCreate(sheet);
  log(log.SUCCESS, 'Successfully built/updated Scanners sheet');
  log(log.FUNCTION, 'Finished buildScannersSheet');
}

/** Builds a contacts sheet based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 * @returns {Sheet} The resulting Contacts sheet that was created.
 */
function buildContactsSheet(ss, fieldsNames) {
  log(log.FUNCTION, 'Starting buildContactsSheet');
  const sheet = initializeSheet(ENUMS.CONTACTS, ss);

  sheet
    .getRange(1, 1, 1, fieldsNames.length)
    .setValues([fieldsNames])
    .setBackground(COLORS.FIELD_PASS)
    .setFontWeight('bold')
    .setFontColor(COLORS.TITLE_TEXT);

  sheet
    .getRange(1, fieldsNames.length + 1, 1, PASSNINJA_FIELDS.length)
    .setValues([PASSNINJA_FIELDS])
    .setBackground(COLORS.FIELD_PASSNINJA)
    .setFontWeight('bold')
    .setFontColor(COLORS.TITLE_TEXT);

  const columnWidths = Array.from({ length: fieldsNames.length }).fill(150);
  columnWidths.push(...[400, 100, 300]);
  SHEET_DEFAULTS[ENUMS.CONTACTS].widths = columnWidths;

  onPostSheetCreate(sheet);
  log(log.SUCCESS, 'Successfully built/updated Contacts sheet');
  log(log.FUNCTION, 'Finished buildContactsSheet');
  return sheet;
}

/** Builds a form based on the user config sheet
 *
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {Sheet} sheet The container sheet for the form
 * @param {string[]} fieldData The fields that the user has entered in the config
 */
function buildContactsForm(ss, fieldData) {
  log(log.FUNCTION, 'Starting buildContactsForm');
  let form;
  try {
    form = FormApp.openByUrl(ss.getFormUrl());
    clearFormDestinationSheet(form);
  } catch (e) {
    log(log.STATUS, 'No previous form detected, creating...');
    form = FormApp.create(localizeString('Create New Contact'));
  } finally {
    clearForm(form);
  }

  const triggers = ScriptApp.getProjectTriggers();
  if (
    !triggers.filter(
      (t) => t.getHandlerFunction() === 'onboardNewPassholderFromForm' && t.getTriggerSourceId() === ss.getId()
    ).length
  ) {
    ScriptApp.newTrigger('onboardNewPassholderFromForm').forSpreadsheet(ss).onFormSubmit().create();
    log(log.SUCCESS, 'Successfully created form trigger');
  }

  for (field of fieldData) {
    let [fieldName, includeInPass, fieldType] = field;
    if (!fieldType) fieldType = 'text';
    form[FORM_LOOKUP[fieldType]]()
      .setTitle(fieldName)
      .setRequired(includeInPass === ENUMS.YES);
  }
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  getFormDestinationSheet(form).hideSheet();
  log(log.SUCCESS, 'Successfully built Contacts Form.');
  log(log.FUNCTION, 'Finished buildContactsForm');
}
