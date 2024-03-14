/**
 * Get a socket stream compatible with the current runtime environment.
 * @returns {Duplex}
 */
module.exports.getStream = function getStream(ssl) {
  if (isCloudflareRuntime) {
    const { CloudflareSocket } = require('pg-cloudflare')
    return new CloudflareSocket(ssl)
  } else {
    const net = require('net')
    return new net.Socket()
  }
}

/**
 * Get a TLS secured socket, compatible with the current environment,
 * using the socket and other settings given in `options`.
 * @returns {Duplex}
 */
module.exports.getSecureStream = function getSecureStream(options) {
  if (isCloudflareRuntime) {
    options.socket.startTls(options)
    return options.socket
  } else {
    var tls = require('tls')
    return tls.connect(options)
  }
}

/**
 * Are we running in a Cloudflare Worker?
 *
 * @returns true if the code is currently running inside a Cloudflare Worker.
 */
function isCloudflareRuntime() {
  // Since 2022-03-21 the `global_navigator` compatibility flag is on for Cloudflare Workers
  // which means that `navigator.userAgent` will be defined.
  if (typeof navigator === 'object' && navigator !== null && typeof navigator.userAgent === 'string') {
    return navigator.userAgent === 'Cloudflare Workers'
  }
  // In case `navigator` or `navigator.userAgent` is not defined then try a more sneaky approach
  if (typeof Response === 'function') {
    const resp = new Response(null, { cf: { thing: true } })
    if (typeof resp.cf === 'object' && resp.cf !== null && resp.cf.thing) {
      return true
    }
  }
  return false
}
