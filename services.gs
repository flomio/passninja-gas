var sendRequest = (url, options = {}, serviceName) => {
  log(
    log.STATUS,
    `Attempting to ${options.method.toUpperCase()} ${url} with payload: ${JSON.stringify(options.payload)}`
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
    this.serviceName = 'PassNinjaAPI';
    try {
      this.accountId = getEnvVar(ENUMS.PASSNINJA_ACCOUNT_ID);
      this.apiKey = getEnvVar(ENUMS.PASSNINJA_API_KEY);
    } catch (err) {
      if (err instanceof ScriptError)
        throw new CredentialsError(
          this.serviceName,
          `${this.serviceName}: PassNinja API credentials have not been set up.`
        );
    }
    this.baseUrl = 'https://api.passninja.com/v1';
    this.passesPostRoute = `${this.baseUrl}/passes/`;
    this.passesUpdateRoute = `${this.baseUrl}/passes/`;
  }

  createPass(payload) {
    return sendRequest(
      this.passesPostRoute,
      {
        method: 'post',
        headers: {
          'x-account-id': this.accountId,
          'x-api-key': this.apiKey
        },
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      },
      this.serviceName
    );
  }

  putPass(payload, serial) {
    return sendRequest(
      `${this.passesUpdateRoute}${serial}`,
      {
        method: 'put',
        headers: {
          'x-account-id': this.accountId,
          'x-api-key': this.apiKey
        },
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      },
      this.serviceName
    );
  }
}

class PassNinjaScannerService {
  constructor() {
    this.serviceName = 'PassNinjaScannerAPI';
    this.baseUrl = 'nada';
    this.passesPostRoute = `${this.baseUrl}/passes/`;
  }

  notifyScanner(payload) {
    return {statusCode: 200}
    // return sendRequest(
    //   this.passesPostRoute,
    //   {
    //     method: 'post',
    //     contentType: 'application/json',
    //     payload: JSON.stringify(payload)
    //   },
    //   this.serviceName
    // );
  }
}

class TwilioService {
  constructor() {
    this.serviceName = 'TwilioAPI';
    this.baseUrl = 'https://api.twilio.com/2010-04-01';
    this.phoneNumberRegex = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/m;
    this.formattedPhoneNumberRegex = /^\+[1-9]\d{1,14}$/;
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
    this.postRoute = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;
  }

  /* Formats number to rough E164 standard:
   * https://www.twilio.com/docs/glossary/what-e164
   * @params {string} rawPhoneNumber The raw phone number string input
   * @returns {string} Phone number in E164 format
   * @returns {null} If phone number is not valid.
   */
  formatE164PhoneNumber(rawPhoneNumber) {
    if (this.formattedPhoneNumberRegex.test(rawPhoneNumber)) return rawPhoneNumber;
    const formattedPhoneNumber = `+${rawPhoneNumber}`
      .split('')
      .filter(c => c.match(/[0-9x]/g))
      .join('');
    return this.formattedPhoneNumberRegex.test(formattedPhoneNumber) ? formattedPhoneNumber : null;
  }

  sendText(to, body) {
    if (body.length > 160)
      throw new ServiceError(this.serviceName, `${this.serviceName}: The text should be limited to 160 characters`);
    const options = {
      method: 'post',
      payload: {
        To: to,
        Body: body,
        From: this.formatE164PhoneNumber(this.phoneNumber)
      },
      headers: {
        Authorization: 'Basic ' + Utilities.base64Encode(`${this.accountSid}:${this.authToken}`)
      }
    };
    return sendRequest(this.postRoute, options, this.serviceName);
  }
}
