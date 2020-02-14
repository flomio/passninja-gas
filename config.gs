var print = Logger.log;
var log = (eventType, msg, ...args) => print(eventType + ': ' + msg, ...args)
log.SUCCESS = 'SUCCESS'
log.WARNING = 'WARNING'
log.ERROR = 'ERROR'
log.STATUS = 'STATUS'

var COLORS = {
    FIELD_PASSNINJA: '#4A6572',
    FIELD_CONSTANT: '#F9AA33',
    FIELD_CONTACT: '#F9AA33',
    FIELD_CONFIG: '#BCA136',
    FIELD_PASS: '#829356',
    GENERIC: '#232F34',
    TEXT: '#efefef',
    TEXT_ON: '#17262A',
    SUCCESS: '#ADFF2F',
    ERROR: '#FF4500'
}

var STATUS_LOOKUP = {
    success: {
        border: "#008000",
        color: "#000000",
        background: COLORS.SUCCESS,
        bold: true
    },
    loading: {
        background: COLORS.FIELD_CONSTANT,
        color: COLORS.TEXT_ON
    },
    ok: {
        border: "#008000"
    },
    error: {
        border: "#000000",
        background: COLORS.ERROR
    }
};

var ENUMS = {
    CONFIG: 'Config',
    CONTACTS: 'Contacts',
    EVENTS: 'Events',
    PASSURL: 'passUrl',
    PASSTYPE: 'passType',
    SERIAL: 'serialNumber',
    CONFIG_CONSTANTS: 'config_constants',
    CONFIG_FIELDS: 'config_fields',
    FIELDS_HASH: 'fieldsHash',
    TWILIO_SID: 'twilio_sid',
    TWILIO_AUTH: 'twilio_auth',
    TWILIO_NUMBER: 'twilio_number'
}