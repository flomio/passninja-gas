const print = Logger.log;
const log = (eventType, msg, ...args) => print(eventType + ': ' + msg, ...args);
log.SUCCESS = 'SUCCESS';
log.WARNING = 'WARNING';
log.ERROR = 'ERROR';
log.STATUS = 'STATUS';

const COLORS = {
    FIELD_PASSNINJA: '#325D79',
    FIELD_CONSTANT: '#F9AA33',
    FIELD_CONTACT: '#F9AA33',
    FIELD_CONFIG: '#BCA136',
    FIELD_PASS: '#829356',
    GENERIC: '#cfe2f3',
    TEXT: '#666666',
    TITLE_TEXT: '#EFEFEF',
    TEXT_ON: '#17262A',
    SUCCESS: '#ADFF2F',
    ERROR: '#FF4500',
    BORDER: '#D9D9D9'
};

const STATUS_LOOKUP = {
    success: {
        border: '#008000',
        color: '#000000',
        background: COLORS.SUCCESS,
        bold: true
    },
    loading: {
        background: COLORS.FIELD_CONSTANT,
        color: COLORS.TEXT_ON
    },
    ok: {
        border: '#008000'
    },
    error: {
        border: '#000000',
        background: COLORS.ERROR
    }
};

const ENUMS = {
    CONFIG: 'Config',
    CONTACTS: 'Contacts',
    EVENTS: 'Events',
    SCANNERS: 'Scanners',
    PASSURL: 'passUrl',
    PASSTYPE: 'passType',
    SERIAL: 'serialNumber',
    CONFIG_CONSTANTS: 'config_constants',
    CONFIG_FIELDS: 'config_fields',
    FIELDS_HASH: 'fieldsHash',
    TWILIO_SID: 'twilio_sid',
    TWILIO_AUTH: 'twilio_auth',
    TWILIO_NUMBER: 'twilio_number',
    PASSNINJA_ACCOUNT_ID: 'accountId',
    PASSNINJA_API_KEY: 'apiKey',
    CURRENT_SPREADSHEET_ID: 'current_spreadsheet_id',
    CURRENT_SPREADSHEET_URL: 'current_spreadsheet_url'
};

const FORM_LOOKUP = {
    checkbox: 'addCheckboxItem',
    date: 'addDateItem',
    datetime: 'addDateTimeItem',
    time: 'addTimeItem',
    duration: 'addDurationItem',
    multiplechoice: 'addMultipleChoiceItem',
    text: 'addTextItem'
};

const SCANNERS_FIELDS = [
    'serialNumber',
    'id',
    'status',
    'provisioned',
    'attachedPassSerial',
    'activeHourStart',
    'activeHourEnd',
    'unitPrice'
]