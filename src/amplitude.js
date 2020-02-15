const request = require('superagent')

const AMPLITUDE_TOKEN_ENDPOINT = 'https://api.amplitude.com'
const AMPLITUDE_DASHBOARD_ENDPOINT = 'https://amplitude.com/api/2'

const camelCaseToSnakeCasePropertyMap = {
  userId: 'user_id',
  deviceId: 'device_id',
  sessionId: 'session_id',
  eventType: 'event_type',
  eventProperties: 'event_properties',
  userProperties: 'user_properties',
  appVersion: 'app_version',
  osName: 'os_name',
  deviceBrand: 'device_brand',
  deviceManufacturer: 'device_manufacturer',
  deviceModel: 'device_model',
  deviceType: 'device_type',
  locationLat: 'location_lat',
  locationLng: 'location_lng'
}

class AmplitudeError extends Error {
  constructor(res) {
    super(res.text);
    this.statusCode = res.status
    this.body = res.body
    // if (typeof this.body === 'object') {
    //   this.body = JSON.stringify(this.body, null, 2)
    // }
  }
}

function safeEncodeURIComponent (val) {
  let stringVal
  if (typeof val === 'string') {
    stringVal = val
  } else if (typeof val === 'object') {
    stringVal = JSON.stringify(val)
  } else if (typeof val === 'undefined') {
    stringVal = ''
  } else {
    stringVal = String(val)
  }

  return encodeURIComponent(stringVal)
}

async function postBody (url, params) {
  const encodedParams = Object.keys(params).map(key => {
    return encodeURIComponent(key) + '=' + safeEncodeURIComponent(params[key])
  }).join('&')

  try {
    const res = await request.post(url)
      .send(encodedParams)
      .type('application/x-www-form-urlencoded')
      .set('Accept', 'application/json')

    return res.body
  } catch (e) {
    if (e.response) {
      throw new AmplitudeError(e.response)
    }

    throw e
  }
}

class Amplitude {
  constructor (token, options) {
    if (!token) {
      throw new Error('No token provided')
    }

    options = options || {}

    this.token = token
    this.secretKey = options.secretKey
    this.userId = options.userId || options.user_id
    this.deviceId = options.deviceId || options.device_id
    this.sessionId = options.sessionId || options.session_id
  }

  _generateRequestData(data) {
    let returnZero = false
    if (!Array.isArray(data)) {
      returnZero = true
      data = [data]
    }
    const transformedDataArray = data.map((item) => {
      const _item = Object.create(item)
      /* eslint-disable @typescript-eslint/camelcase */
      const transformedData = Object.keys(_item).reduce((obj, key) => {
        const transformedKey = camelCaseToSnakeCasePropertyMap[key] || key

        // @TODO: Not sure why I need to force it a string
        obj[String(transformedKey)] = _item[key]

        return obj
      }, {
        user_id: this.userId,
        device_id: this.deviceId,
        session_id: this.sessionId,
        event_type: item.event_type
      })

      /* eslint-enable @typescript-eslint/camelcase */

      return transformedData as AmplitudeRequestData
    })

    return returnZero ? transformedDataArray[0] : transformedDataArray
  }

  identify (data) {
    const transformedData = this._generateRequestData(data)
    const params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      api_key: this.token,
      identification: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/identify', params)
  }

  track (data) {
    const transformedData = this._generateRequestData(data)
    const params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      api_key: this.token,
      event: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/httpapi', params)
  }

  export (options) {
    if (!this.secretKey) {
      throw new Error('secretKey must be set to use the export method')
    }

    if (!options.start || !options.end) {
      throw new Error('`start` and `end` are required options')
    }

    return request.get(AMPLITUDE_DASHBOARD_ENDPOINT + '/export')
      .auth(this.token, this.secretKey)
      .query({
        start: options.start,
        end: options.end
      })
  }

  userSearch (userSearchId) {
    if (!this.secretKey) {
      throw new Error('secretKey must be set to use the userSearch method')
    }

    if (!userSearchId) {
      throw new Error('value to search for must be passed')
    }

    return request.get(AMPLITUDE_DASHBOARD_ENDPOINT + '/usersearch')
      .auth(this.token, this.secretKey)
      .query({
        user: userSearchId
      })
      .set('Accept', 'application/json')
      .then(res => res.body)
  }

  userActivity (amplitudeId, data) {
    if (!data) {
      data = {
        user: amplitudeId
      }
    } else {
      data.user = amplitudeId
    }

    if (!this.secretKey) {
      throw new Error('secretKey must be set to use the userActivity method')
    }

    if (!amplitudeId) {
      throw new Error('Amplitude ID must be passed')
    }

    return request.get(AMPLITUDE_DASHBOARD_ENDPOINT + '/useractivity')
      .auth(this.token, this.secretKey)
      .query(data)
      .set('Accept', 'application/json')
      .then(res => res.body)
  }

  eventSegmentation (data) {
    if (!this.secretKey) {
      throw new Error('secretKey must be set to use the eventSegmentation method')
    }

    if (!data || !data.e || !data.start || !data.end) {
      throw new Error('`e`, `start` and `end` are required data properties')
    }

    if (typeof data.e === 'object') {
      data.e = JSON.stringify(data.e)
    }

    return request.get(AMPLITUDE_DASHBOARD_ENDPOINT + '/events/segmentation')
      .auth(this.token, this.secretKey)
      .query(data)
      .set('Accept', 'application/json')
      .then(res => res.body)
  }
}

module.exports = Amplitude
module.exports.default = module.exports
