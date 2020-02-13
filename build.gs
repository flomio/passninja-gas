var FORM_LOOKUP = {
    checkbox: 'addCheckboxItem',
    date: 'addDateItem',
    datetime: 'addDateTimeItem',
    time: 'addTimeItem',
    duration: 'addDurationItem',
    multiplechoice: 'addMultipleChoiceItem',
    text: 'addTextItem'
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
    if (!triggers.filter(t => t.getHandlerFunction() === 'onboardNewPassholderFromForm').length) {
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