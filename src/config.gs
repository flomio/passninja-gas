/**
 * Responsible for defining project-level reusable config + constants
 * @module config
 */

const print = Logger.log;
let LAST_LOG = new Date();
const log = (eventType, msg, ...args) => {
  const NEW_LOG = new Date();
  let ms = ((NEW_LOG - LAST_LOG) / 1000).toFixed(3);
  FILTER === '*' || FILTER.includes(eventType) ? print(localizeString(`${eventType} (+${ms}s): ${msg} ${args}`)) : null;
  LAST_LOG = NEW_LOG;
};

log.SUCCESS = 'SUCCESS';
log.WARNING = 'WARNING';
log.ERROR = 'ERROR';
log.STATUS = 'STATUS';
log.FUNCTION = 'FUNCTION';
log.VIRTUAL = 'VIRTUAL';
const FILTER = `${log.FUNCTION},${log.ERROR},${log.SUCCESS}`;

const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

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
  CONFIG: localizeString('Config'),
  CONTACTS: localizeString('Contacts'),
  EVENTS: localizeString('Events'),
  SCANNERS: localizeString('Scanners'),
  DISCONNECTED: localizeString('DISCONNECTED'),
  AVAILABLE: localizeString('AVAILABLE'),
  RESERVED: localizeString('RESERVED'),
  UNASSIGNED: localizeString('UNASSIGNED'),
  STATUS: localizeString('status'),
  TRUE: localizeString('TRUE'),
  FALSE: localizeString('FALSE'),
  YES: localizeString('YES'),
  NO: localizeString('NO'),
  STATUS_SUCCESS: 'success',
  STATUS_LOADING: 'loading',
  STATUS_OK: 'ok',
  STATUS_ERROR: 'error',
  PASSURL: 'passUrl',
  PASSTYPE: 'passType',
  SERIAL: 'serialNumber',
  CONFIG_CONSTANTS: 'config_constants',
  CONFIG_FIELDS: 'config_fields',
  FIELDS_HASH: 'fieldsHash',
  TWILIO_SID: 'twilio_sid',
  TWILIO_AUTH: 'twilio_auth',
  TWILIO_NUMBER: 'twilio_number',
  PASSNINJA_ACCOUNT_ID: 'passninja_account_id',
  PASSNINJA_API_KEY: 'passninja_api_key',
  CURRENT_SPREADSHEET_ID: 'current_spreadsheet_id',
  CURRENT_SPREADSHEET_URL: 'current_spreadsheet_url'
};
const PASSNINJA_FIELDS = [ENUMS.PASSURL, ENUMS.PASSTYPE, ENUMS.SERIAL];

const SHEET_DEFAULTS = {
  [ENUMS.SCANNERS]: {
    rows: 6,
    widths: [null, 50, 100, null, 280]
  },
  [ENUMS.CONFIG]: {
    rows: 14,
    widths: [84, 124, 22, 116, 380]
  },
  [ENUMS.EVENTS]: {
    widths: [190, 100, 100, 280, 1500]
  },
  [ENUMS.CONTACTS]: {}
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

const V_START_ROW_OFFSET = 2;

const SCANNERS_FIELDS = [
  'serialNumber',
  'id',
  'status',
  'provisioned',
  'attachedPassSerial',
  'activeHourStart',
  'activeHourEnd',
  'unitPrice'
];

const SCAN_PLATFORMS = ['apple-wallet', 'google-pay'];

const SCAN_TEMPLATE = {
  id: '', // #john@smith.com#dev.andres#<uuid>
  date: '', // timestamp
  callback: `https://script.google.com/macros/s/${Utilities.getUuid()}/exec`, // fake deployment url
  event: {
    serialNumber: '', // uuid
    date: '', // timestamp
    passType: '', // dev.andres
    type: 'PASS_SCAN',
    platform: '', // apple-wallet | google-pay
    reader: {
      type: 'FloBlePlus',
      serialNumber: '', // Arbitrary, default is RR464-0017564
      firmware: 'ACR1255U-J1 SWV 3.00.05'
    },
    uuid: '' // uuid
  }
};

const MENU_LABELS = {
  selected: {
    label: localizeString('Selected Row'),
    create: { label: localizeString('Create/Update Pass') },
    mock: { label: localizeString('Run Mock Scan') }
  },
  config: {
    label: localizeString('Config/Setup'),
    create: { label: localizeString('Create/Update Sheets From Config') }
  },
  credentials: {
    label: localizeString('Add Credentials'),
    twilio: { label: localizeString('Set Twilio Credentials') },
    pn: { label: localizeString('Set PassNinja Credentials') }
  },
  overrides: {
    label: localizeString('Overrides'),
    rebuildConfig: { label: localizeString('Force (Re)Build of Config Sheet') },
    rebuildSheets: { label: localizeString('Force Create/Update Sheets From Config') },
    sendText: { label: localizeString('Force Text passUrl to phoneNumber') }
  }
};

const CONFIG_LABELS = {
  title: localizeString('01 CONFIG'),
  headers: {
    key: localizeString('key'),
    value: localizeString('value'),
    name: localizeString('name'),
    template: localizeString('In Template?')
  },
  source: localizeString('Source Script'),
  instructions: [
    'INSTRUCTIONS:',
    '1) Specify what passType this app will be using under General Setup.',
    '2) Enter all the custom field names you have in your template.',
    '3) then, PassNinja... Setup... Create/Update Sheets from Config'
  ].map((line) => [localizeString(line)]),
  passType: {
    label: localizeString('Pass Type'),
    info: localizeString('You must specify a passType to create passes.')
  },
  confirm: { no: ENUMS.NO, yes: ENUMS.YES },
  general: {
    label: localizeString('General Setup'),
    info: localizeString('Define fields for the form that will be used to create passes')
  }
};

const EVENTS_LABELS = {
  date: localizeString('Event Date'),
  eventtype: localizeString('Event Type'),
  passType: localizeString('Pass Type'),
  serial: localizeString('Serial Number'),
  data: localizeString('Event Data')
};
