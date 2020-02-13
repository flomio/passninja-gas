var print = Logger.log;
var log = (eventType, msg, ...args) => print(eventType + ': ' + msg, ...args)
log.SUCCESS = 'SUCCESS'
log.WARNING = 'WARNING'
log.ERROR = 'ERROR'
log.STATUS = 'STATUS'

var COLORS = {
    FIELD_PASSNINJA: '#6aa84f',
    FIELD_PASS: '#3c78d8',
    GENERIC: '#666666',
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
    ok: {
        border: "#008000"
    },
    error: {
        border: "#000000",
        background: COLORS.ERROR
    }
};

var ENUMS = {
    CONTACTS: 'Contacts',
    EVENTS: 'Events',
    PASSURL: 'passUrl',
    PASSTYPE: 'passType',
    SERIAL: 'serialNumber'
}