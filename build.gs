var FORM_LOOKUP = {
    checkbox: 'addCheckboxItem',
    date: 'addDateItem',
    datetime: 'addDateTimeItem',
    time: 'addTimeItem',
    duration: 'addDurationItem',
    multiplechoice: 'addMultipleChoiceItem',
    text: 'addTextItem'
}

/** Creates a default PassNinja formatted Google sheet on the given spreadsheet 
 *
 * @param {string} name The name of the named range to query
 * @param {Spreadsheet} ss The Google spreadsheet to query
 * @returns {Sheet} The resulting Google sheet
 */
function initializeSheet(name, ss) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    var allCells = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    allCells.setBackground(COLORS.GENERIC);
    allCells.setFontColor(COLORS.TEXT);
    allCells.setFontFamily("Montserrat");
    allCells.setNumberFormat("@");

    return sheet;
}

/** Builds initial contacts sheet
 */
function buildConfigSheet(ss, force = false) {
    var sheet = initializeSheet(ENUMS.CONFIG, ss)


    
    var headerNames = ["Key              ", "Value             ", null, "Name                  ", "In Template?", "Type      ", "Form Options (comma separated)"]
    var headerRange = sheet.getRange(6, 1, 1, headerNames.length)

    headerRange.setValues([headerNames])
    headerRange.setBackground(COLORS.FIELD_PASSNINJA)
    headerRange.setFontWeight('bold')

    //sheet.getRange(1, 3, sheet.getMaxRows(), 1).setBackground(COLORS.GENERIC)
    sheet.getRange(1,1,5,7).setBackground(COLORS.FIELD_PASSNINJA)
    sheet.getRange(6, 3, sheet.getMaxRows(), 1).setBackground(COLORS.FIELD_PASSNINJA).setFontWeight('bold').setFontColor(COLORS.TEXT_ON)
    sheet.getRange(7, 1, 1, 1).setValue('passType')
    sheet.getRange(7, 2, 1, 1).setNote('You must specify a passType to create passes.')

    // TODO: Implement some kind of protection.  This causes a timeout.
    // sheet.getRange(2, 1, 1, 1).protect().setDescription('Sample protected range');

    ss.setNamedRange(ENUMS.CONFIG_CONSTANTS, sheet.getRange(7, 1, sheet.getMaxRows(), 2))
    ss.setNamedRange(ENUMS.CONFIG_FIELDS, sheet.getRange(7, 4, sheet.getMaxRows(), 4))

    var validationInPass = SpreadsheetApp.newDataValidation()
        .requireValueInList(['N', 'Y'], true)
        .setAllowInvalid(false)
        .build()

    var validationFormType = SpreadsheetApp.newDataValidation()
        .requireValueInList(['text', 'date', 'datetime', 'time', 'duration'], true)
        .setAllowInvalid(false)
        .build()

    var fieldInPassRange = sheet.getRange(7, headerNames.indexOf('In Template?') + 1, sheet.getMaxRows(), 1)
    fieldInPassRange.setDataValidation(validationInPass)
    fieldInPassRange.setHorizontalAlignment('center').setValue('N')

    var formTypeRange = sheet.getRange(7, headerNames.indexOf('Type      ') + 1, sheet.getMaxRows(), 1)
    formTypeRange.setDataValidation(validationFormType)
    formTypeRange.setHorizontalAlignment('center').setValue('text')

    deleteUnusedColumns(headerNames.length + 1, sheet.getMaxColumns(), sheet)
    autoResizeSheet(sheet)
        var titleRange = sheet.getRange(1,1,4,4)
    
    titleRange.merge()
    titleRange.setValue("01 CONFIG")
    titleRange.setFontSize(36)
    titleRange.setVerticalAlignment("TOP")
    
    sheet.getRange(1,5,4,1).setFontSize(8)
    sheet.getRange(1,5).setValue("INSTRUCTIONS:")
    sheet.getRange(2,5).setValue("1) Specify what passType this app will be using under General Setup.")
    sheet.getRange(3,5).setValue("2) Enter all the custom field names you have in your template.")
    sheet.getRange(4,5).setValue("3) then, PassNinja... Setup... Create/Update Sheets from Config")
    sheet.getRange(5,1).setValue("General Setup")
    sheet.getRange(5,4).setValue("Define fields for the form that will be used to create passes")
    
    sheet.getRange(5,1,2,2).setBorder(true, true, true, true, false, false, COLORS.BORDER, null)
    sheet.getRange(5,4,2,4).setBorder(true, true, true, true, false, false, COLORS.BORDER, null)
    sheet.getRange(1,1,6,7).setFontColor(COLORS.TITLE_TEXT)
    sheet.setColumnWidth(3,22)
    log(log.SUCCESS, 'Successfully built/updated Events sheet')
}

/** Builds a events sheet based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildEventsSheet(ss) {
    var sheet = initializeSheet(ENUMS.EVENTS, ss)

    var fieldsNames = ["eventDate", "eventType", "passType", "serialNumber", "eventData"]
    var fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length)
    fieldHeaders.setValues([fieldsNames])
    fieldHeaders.setBackground(COLORS.FIELD_PASSNINJA)
    fieldHeaders.setFontWeight('bold')
    fieldHeaders.setFontColor(COLORS.TITLE_TEXT)

    deleteUnusedColumns(fieldsNames.length + 1, sheet.getMaxColumns(), sheet)

    log(log.SUCCESS, 'Successfully built/updated Events sheet')
}

/** Builds a contacts sheet based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {string[]} fieldsNames The names of the fields that the user has entered in the config
 */
function buildContactsSheet(ss, fieldsNames) {
    var sheet = initializeSheet(ENUMS.CONTACTS, ss)

    var fieldHeaders = sheet.getRange(1, 1, 1, fieldsNames.length)
    fieldHeaders.setValues([fieldsNames])
    fieldHeaders.setBackground(COLORS.FIELD_PASS)
    fieldHeaders.setFontWeight('bold')
    fieldHeaders.setFontColor(COLORS.TITLE_TEXT)
    
    var passNinjaFields = [ENUMS.PASSURL, ENUMS.PASSTYPE, ENUMS.SERIAL]
    var passNinjaHeaders = sheet.getRange(1, fieldsNames.length + 1, 1, passNinjaFields.length)
    passNinjaHeaders.setValues([passNinjaFields])
    passNinjaHeaders.setBackground(COLORS.FIELD_PASSNINJA)
    passNinjaHeaders.setFontWeight('bold')

    deleteUnusedColumns(passNinjaFields.length + fieldsNames.length + 1, sheet.getMaxColumns(), sheet)

    log(log.SUCCESS, 'Successfully built/updated Contacts sheet')
    return sheet
}

/** Builds a form based on the user config sheet
 * 
 * @param {Spreadsheet} ss The container spreadsheet
 * @param {Sheet} sheet The container sheet for the form
 * @param {string[]} fieldData The fields that the user has entered in the config
 */
function buildContactsForm(ss, sheet, fieldData) {
    try {
        var form = FormApp.openByUrl(ss.getFormUrl())
        clearFormDestinationSheet(form)
    } catch (e) {
        log(log.STATUS, 'No previous form detected, creating...')
        form = FormApp.create('Create New Contact');
    } finally {
        clearForm(form)
    }
    var triggers = ScriptApp.getProjectTriggers();
    if (!triggers.filter(t => t.getHandlerFunction() === 'onboardNewPassholderFromForm' && t.getTriggerSourceId() === ss.getId()).length) {
        ScriptApp.newTrigger('onboardNewPassholderFromForm').forSpreadsheet(ss).onFormSubmit().create();
        log(log.SUCCESS, 'Succesfully created form trigger')
    }

    for (field of fieldData) {
        var [fieldName, includeInPass, fieldType, fieldOptions] = field
        if (!fieldType) fieldType = 'text';
        form[FORM_LOOKUP[fieldType]]().setTitle(fieldName).setRequired(includeInPass === "Y")
    }

    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    log(log.SUCCESS, 'Successfully built Contacts Form.')
}