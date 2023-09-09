// Copyright 2023 Samuel Kopp. All rights reserved. Apache-2.0 license.
import type { IncomingRequestCfProperties } from 'worker'
import type { Context } from '../contexts/context.ts'

type CloudflareRequest = Request & {
  cf: IncomingRequestCfProperties
}

/**
 * Inspect the geolocation data of the incoming request.
 *
 * You must either deploy your app to [Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties) or use [Cloudflare as a proxy](https://developers.cloudflare.com/support/network/configuring-ip-geolocation/) to use the `LocationData` API.
 */
export class LocationData {
  #c: Context

  constructor(c: Context) {
    this.#c = c
  }

  /**
   * The city the request originated from.
   *
   * @example 'Austin'
   */
  get city() {
    const city = (this.#c.req.raw as CloudflareRequest).cf?.city

    if (!city && this.#c.__app.proxy === 'cloudflare') {
      return this.#c.req.headers['cf-ipcity']
    }

    return city
  }

  /**
   * If known, the ISO 3166-2 name for the first level region associated with the IP address of the incoming request.
   *
   * @example 'Texas'
   */
  get region() {
    return (this.#c.req.raw as CloudflareRequest).cf?.region
  }

  /**
   * The [ISO 3166-1 Alpha 2](https://www.iso.org/iso-3166-country-codes.html) country code the request originated from.
   *
   * If you're using CLoudflare Workers and your worker is [configured to accept TOR connections](https://support.cloudflare.com/hc/en-us/articles/203306930-Understanding-Cloudflare-Tor-support-and-Onion-Routing), this may also be `T1`, indicating a request that originated over TOR.
   *
   * If Cloudflare is unable to determine where the request originated this property is omitted.
   *
   * @example 'GB'
   */
  get country(): IncomingRequestCfProperties['country'] {
    const country = (this.#c.req.raw as CloudflareRequest).cf?.country

    if (!country && this.#c.__app.proxy === 'cloudflare') {
      return this.#c.req
        .headers['cf-ipcountry'] as IncomingRequestCfProperties['country']
    }

    return country
  }

  /**
   * A two-letter code indicating the continent the request originated from.
   *
   * @example 'NA'
   */
  get continent(): IncomingRequestCfProperties['continent'] {
    const continent = (this.#c.req.raw as CloudflareRequest).cf?.continent

    if (!continent && this.#c.__app.proxy === 'cloudflare') {
      return this.#c.req
        .headers['cf-ipcontinent'] as IncomingRequestCfProperties['continent']
    }

    return continent
  }

  /**
   * If known, the ISO 3166-2 code for the first-level region associated with the IP address of the incoming request.
   *
   * @example 'TX'
   */
  get regionCode(): IncomingRequestCfProperties['regionCode'] {
    return (this.#c.req.raw as CloudflareRequest).cf?.regionCode
  }

  /**
   * Latitude of the incoming request.
   *
   * @example '30.27130'
   */
  get latitude(): IncomingRequestCfProperties['latitude'] {
    const latitude = (this.#c.req.raw as CloudflareRequest).cf?.latitude

    if (!latitude && this.#c.__app.proxy === 'cloudflare') {
      return this.#c.req.headers['cf-iplatitude']
    }

    return latitude
  }

  /**
   * Longitude of the incoming request.
   *
   * @example '-97.74260'
   */
  get longitude(): IncomingRequestCfProperties['longitude'] {
    const longitude = (this.#c.req.raw as CloudflareRequest).cf?.longitude

    if (!longitude && this.#c.__app.proxy === 'cloudflare') {
      return this.#c.req.headers['cf-iplongitude']
    }

    return longitude
  }

  /**
   * Postal code of the incoming request.
   *
   * @example '78701'
   */
  get postalCode(): IncomingRequestCfProperties['postalCode'] {
    return (this.#c.req.raw as CloudflareRequest).cf?.postalCode
  }

  /**
   * Timezone of the incoming request.
   *
   * @example 'America/Chicago'
   */
  get timezone(): IncomingRequestCfProperties['timezone'] {
    return (this.#c.req.raw as CloudflareRequest).cf?.timezone
  }

  /**
   * The three-letter [IATA](https://en.wikipedia.org/wiki/IATA_airport_code) airport code of the data center that the request hit.
   *
   * @example 'DFW'
   */
  get datacenter(): IncomingRequestCfProperties['colo'] {
    return (this.#c.req.raw as CloudflareRequest).cf?.colo
  }
}
