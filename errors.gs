/** Error Archetype, not to be thrown.
 */
class PassNinjaGASError extends Error {
  constructor(code = 'GENERIC', ...params) {
    super(...params);
    log(log.ERROR, 'New ServiceError thrown from: ', params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PassNinjaGASError);
    }

    this.code = code;
  }
}

/** Custom Error type thrown when a Service encounters an error.
 */
class ServiceError extends PassNinjaGASError {
  constructor(code, status, ...params) {
    super((code = 'SERVICE'), ...params);
    this.status = status;
  }
}

/** Custom Error type thrown when a Script encounters an error.
 */
class ScriptError extends PassNinjaGASError {
  constructor(code, ...params) {
    super((code = 'SCRIPT'), ...params);
  }
}

/** Custom Error type thrown when credentials have not been added to the script.
 */
class CredentialsError extends PassNinjaGASError {
  constructor(code, ...params) {
    super((code = 'CREDS'), ...params);
  }
}
