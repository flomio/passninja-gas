/** Error Archetype, not to be thrown.
 */
class PassNinjaGASError extends Error {
  constructor(code = 'GENERIC', ...params) {
    super(...params);
    this.code = code;
    log(log.ERROR, `New ${this.code} Error thrown from: `, params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PassNinjaGASError);
    }
  }
}

/** Custom Error type thrown when a Service encounters an error.
 */
class ServiceError extends PassNinjaGASError {
  constructor(...params) {
    super('SERVICE', ...params);
  }
}

/** Custom Error type thrown when a Script encounters an error.
 */
class UtilsError extends PassNinjaGASError {
  constructor(...params) {
    super('UTILS', ...params);
  }
}

/** Custom Error type thrown when a Script encounters an error.
 */
class ScriptError extends PassNinjaGASError {
  constructor(...params) {
    super('SCRIPT', ...params);
  }
}

/** Custom Error type thrown when credentials have not been added to the script.
 */
class CredentialsError extends PassNinjaGASError {
  constructor(...params) {
    super('CREDS', ...params);
  }
}

/** Custom Error type thrown when element build has failed.
 */
class BuildError extends PassNinjaGASError {
  constructor(...params) {
    super('BUILD', ...params);
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
    throw new BuildError(errorMsg, e);
  }
}
