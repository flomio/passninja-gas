/**
 *  Contains Service clases for all external service calls
 * @module services
 */

/** The generic function for running an external call
 *
 * @param {string} url The url used in the request
 * @param {object} options The options used for the request: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params
 * @param {string} serviceName The calling service for debugging purposes
 * @returns {HTTPResponse}
 */
const sendRequest = (url, options = {}, serviceName) => {
  log(
    log.FUNCTION,
    `Attempting to ${options.method.toUpperCase()} ${url} with payload: ${JSON.stringify(options.payload)}`
  );
  options.muteHttpExceptions = true;
  response = UrlFetchApp.fetch(url, { ...options });
  log(log.FUNCTION, 'Received response from fetch');
  if (response.getResponseCode() < 300 && response.getResponseCode() >= 200) {
    try {
      return JSON.parse(response.getContentText());
    } catch (err) {
      return response.getContentText();
    }
  } else {
    throw new ServiceError(`${serviceName || ''}:${response.getResponseCode()} RESPONSE: ${response.getContentText()}`);
  }
};

/** Class used to access the PassNinja API. */
class PassNinjaService {
  constructor() {
    this.serviceName = 'PassNinjaAPI';
    this.branch = 'master';
    try {
      this.accountId = getEnvVar(ENUMS.PASSNINJA_ACCOUNT_ID);
      this.apiKey = getEnvVar(ENUMS.PASSNINJA_API_KEY);
    } catch (err) {
      if (err instanceof ScriptError)
        throw new CredentialsError(`${this.serviceName}: PassNinja API credentials have not been set up.`);
    }
    this.baseUrl = `https://api.passninja.com/${this.branch === 'master' ? 'v1' : this.branch}`;
    this.passesPostRoute = `${this.baseUrl}/passes/`;
    this.passesUpdateRoute = `${this.baseUrl}/passes/`;
  }

  /** Creates a PN pass
   *
   * @param {Object} payload https://passninja.com/docs#passes-passes-with-passninja-templates-post
   * @returns {HTTPResponse}
   */
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

  /** Updates a PN pass
   *
   * @param {Object} payload https://passninja.com/docs#passes-passes-with-passninja-templates-post
   * @param {string} serial UUID for the pass to update
   * @returns {HTTPResponse}
   */
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

/** Class used to access the PassNinja Scanner API (placeholder) */
class PassNinjaScannerService {
  constructor() {
    this.serviceName = 'PassNinjaScannerAPI';
    this.baseUrl = 'https://passninja.ngrok.io/fancy/path/';
  }

  /** Notifies the scanner of the scan event and processed outcome
   *
   * @param {Object} payload To be determined
   * @returns {HTTPResponse} The scanner service response
   */
  notifyScanner(payload) {
    return { statusCode: 200 };
    // return sendRequest(
    //   this.baseUrl,
    //   {
    //     method: 'post',
    //     contentType: 'application/json',
    //     payload: JSON.stringify(payload)
    //   },
    //   this.serviceName
    // );
  }
}

/** Class used to access the Twilio API */
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
        throw new CredentialsError(`${this.serviceName}: Twilio API credentials have not been set up.`);
    }
    this.postRoute = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;
  }

  /** Formats number to rough E164 standard:
   * https://www.twilio.com/docs/glossary/what-e164
   *
   * @params {string} rawPhoneNumber The raw phone number string input
   * @returns {string} Phone number in E164 format
   * @returns {null} If phone number is not valid.
   */
  formatE164PhoneNumber(rawPhoneNumber) {
    if (this.formattedPhoneNumberRegex.test(rawPhoneNumber)) return rawPhoneNumber;
    const formattedPhoneNumber = `+${rawPhoneNumber}`
      .split('')
      .filter((c) => c.match(/[0-9x]/g))
      .join('');
    return this.formattedPhoneNumberRegex.test(formattedPhoneNumber) ? formattedPhoneNumber : null;
  }

  /** Sends a text using the Twilio API if credentials have been set up in the script.
   *
   * @param {string} to The phone number to send the text to
   * @param {string} body The body of the text to send
   */
  sendText(to, body) {
    if (body.length > 160) throw new ServiceError(`${this.serviceName}: The text should be limited to 160 characters`);
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
