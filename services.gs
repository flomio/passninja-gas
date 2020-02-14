var sendRequest = (url, options = {}) => {
    log(log.STATUS, `Attempting to ${options.method.toUpperCase()} ${url} with payload: ${JSON.stringify(options.payload)}`);
    response = UrlFetchApp.fetch(url, {...options });
    return JSON.parse(response.getContentText());
}

class PassNinjaService {
    constructor() {
        this.baseUrl = 'https://passninja.ngrok.io';
        this.serviceName = 'PassNinjaAPI';
        this.passesPostRoute = `${this.baseUrl}/passes`;
        this.passesUpdateRoute = `${this.baseUrl}/passes`;
    }

    createPass(payload) {
        return sendRequest(this.passesPostRoute, {
                method: 'post',
                contentType: "application/json",
                payload: JSON.stringify(payload)
            },
            this.serviceName);
    }

    updatePass(payload, serial) {
        return sendRequest(`${this.passesUpdateRoute}/${serial}`, {
            method: 'put',
            contentType: "application/json",
            payload: JSON.stringify(payload)
        }, this.serviceName);

    }
}

class TwilioService {
    constructor() {
        this.accountSid = getEnvVar(ENUMS.TWILIO_SID);
        this.authToken = getEnvVar(ENUMS.TWILIO_AUTH);
        this.phoneNumber = getEnvVar(ENUMS.TWILIO_NUMBER);
        this.baseUrl = 'https://api.twilio.com/2010-04-01';
        this.serviceName = 'TwilioAPI';
        this.phoneNumberRegex = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/gm;
        this.postRoute = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;
    }

    /* Formats number to rough E164 standard:
     * https://www.twilio.com/docs/glossary/what-e164
     * @params {string} rawPhoneNumber The raw phone number string input
     * @returns {string} Phone number in E164 format
     * @returns {null} If phone number is not valid.
     */
    formatE164PhoneNumber(rawPhoneNumber) {
        if (this.isValidPhoneNumber(rawPhoneNumber)) return rawPhoneNumber
        var formattedPhoneNumber = '+' + rawPhoneNumber.split('').filter(c => c.match(/[0-9x]/g)).join('');
        return isValidPhoneNumber(formattedPhoneNumber) ? formattedPhoneNumber : null;
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
        if (body.length > 160) throw ("The text should be limited to 160 characters")
        var options = {
            method: 'post',
            payload: {
                "To": to,
                "Body": body,
                "From": this.formatE164PhoneNumber(this.phoneNumber)
            },
            headers: {
                "Authorization": "Basic " + Utilities.base64Encode(`${this.accountSid}:${this.authToken}`)
            }
        };
        return sendRequest(this.postRoute, options, this.serviceName);
    }
}