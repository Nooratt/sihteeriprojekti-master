/**
 * A String used in JWT's.
 * NOTE: In production quality build, this should be created as an environment variable on the server, so that it is inaccessible in files.
 * As it is, this file contains a security risk.
 * @type {string}
 */
let secret = "keyboard cat";

export { secret };