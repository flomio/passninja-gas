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

/** Runs the function and catches then throws any error and logs it.
 *
 * @param {string} error Error to log
 * @param {string} msg The extra message to add
 */
function catchError(fn, errorMsg) {
  try {
    return fn();
  } catch (e) {
    log(log.ERROR, errorMsg, e);
    throw new ScriptError('BUILD', errorMsg, e);
  }
}