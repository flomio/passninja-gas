/**
 *  Custom error definitions
 * @module errors
 */

/** Error Archetype, not to be thrown.
 */
class PassNinjaGASError extends Error {
  constructor(code = 'GENERIC', ...params) {
    super(...params.map(localizeString));
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
    this.constructor = ServiceError;
    this.__proto__ = ServiceError.prototype;
  }
}

/** Custom Error type thrown when a Script encounters an error.
 */
class UtilsError extends PassNinjaGASError {
  constructor(...params) {
    super('UTILS', ...params);
    this.constructor = UtilsError;
    this.__proto__ = UtilsError.prototype;
  }
}

/** Custom Error type thrown when a Script encounters an error.
 */
class ScriptError extends PassNinjaGASError {
  constructor(...params) {
    super('SCRIPT', ...params);
    this.constructor = ScriptError;
    this.__proto__ = ScriptError.prototype;
  }
}

/** Custom Error type thrown when credentials have not been added to the script.
 */
class CredentialsError extends PassNinjaGASError {
  constructor(...params) {
    super('CREDS', ...params);
    this.constructor = CredentialsError;
    this.__proto__ = CredentialsError.prototype;
  }
}

/** Custom Error type thrown when element build has failed.
 */
class BuildError extends PassNinjaGASError {
  constructor(...params) {
    super('BUILD', ...params);
    this.constructor = BuildError;
    this.__proto__ = BuildError.prototype;
  }
}
