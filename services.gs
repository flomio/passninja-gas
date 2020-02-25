var sendRequest = (url, options = {}, serviceName) => {
  log(
    log.STATUS,
    `Attempting to ${options.method.toUpperCase()} ${url} with payload: ${JSON.stringify(
      options.payload
    )}`
  );
  options.muteHttpExceptions = true;
  response = UrlFetchApp.fetch(url, { ...options });
  if (response.getResponseCode() < 300 && response.getResponseCode() >= 200) {
    return JSON.parse(response.getContentText());
  } else {
    throw new ServiceError(
      'NON200RESPONSE',
      response.getResponseCode(),
      `${serviceName || ''}: ${response.getContentText()}`
    );
  }
};

class PassNinjaService {
  constructor() {
    this.baseUrl = 'https://api.passninja.com/v1';
    this.serviceName = 'PassNinjaAPI';
    this.passesPostRoute = `${this.baseUrl}/passes/`;
    this.passesUpdateRoute = `${this.baseUrl}/passes/`;
  }

  createPass(payload) {
    return sendRequest(
      this.passesPostRoute,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      },
      this.serviceName
    );
  }

  updatePass(payload, serial) {
    return sendRequest(
      `${this.passesUpdateRoute}${serial}`,
      {
        method: 'put',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      },
      this.serviceName
    );
  }
}

class TwilioService {
  constructor() {
    this.serviceName = 'TwilioAPI';
    this.baseUrl = 'https://api.twilio.com/2010-04-01';
    this.postRoute = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;
    this.phoneNumberRegex = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/gm;
    try {
      this.accountSid = getEnvVar(ENUMS.TWILIO_SID);
      this.authToken = getEnvVar(ENUMS.TWILIO_AUTH);
      this.phoneNumber = getEnvVar(ENUMS.TWILIO_NUMBER);
    } catch (err) {
      if (err instanceof ScriptError)
        throw new CredentialsError(
          this.serviceName,
          `${this.serviceName}: Twilio API credentials have not been set up.`
        );
    }
  }

  /* Formats number to rough E164 standard:
   * https://www.twilio.com/docs/glossary/what-e164
   * @params {string} rawPhoneNumber The raw phone number string input
   * @returns {string} Phone number in E164 format
   * @returns {null} If phone number is not valid.
   */
  formatE164PhoneNumber(rawPhoneNumber) {
    if (this.isValidPhoneNumber(rawPhoneNumber)) return rawPhoneNumber;
    var formattedPhoneNumber =
      '+' +
      rawPhoneNumber
        .split('')
        .filter(c => c.match(/[0-9x]/g))
        .join('');
    return isValidPhoneNumber(formattedPhoneNumber)
      ? formattedPhoneNumber
      : null;
  }

  /* Validates number to rough E164 standard:
   * https://www.twilio.com/docs/glossary/what-e164
   * @params {string} formattedPhoneNumber The raw phone number string input
   * @returns {boolean} Whether or not the phone number in E164 format
   */
  isValidPhoneNumber(formattedPhoneNumber) {
    return !!formattedPhoneNumber.match(/^\+[1-9]\d{1,14}$/g);
  }

  sendText(to, body) {
    if (body.length > 160)
      throw new ServiceError(
        this.serviceName,
        `${this.serviceName}: The text should be limited to 160 characters`
      );
    var options = {
      method: 'post',
      payload: {
        To: to,
        Body: body,
        From: this.formatE164PhoneNumber(this.phoneNumber)
      },
      headers: {
        Authorization:
          'Basic ' +
          Utilities.base64Encode(`${this.accountSid}:${this.authToken}`)
      }
    };
    return sendRequest(this.postRoute, options, this.serviceName);
  }
}
