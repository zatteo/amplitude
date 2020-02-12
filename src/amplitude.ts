/// <reference path="types/index.d.ts" />
import request = require('superagent')
const AMPLITUDE_TOKEN_ENDPOINT = 'https://api.amplitude.com'
const AMPLITUDE_DASHBOARD_ENDPOINT = 'https://amplitude.com/api/2'

const camelCaseToSnakeCasePropertyMap: AmplitudeQueryParams = {
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

function postBody (url: string, params: AmplitudeQueryParams) {
  const encodedParams = Object.keys(params).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
  }).join('&')

  return request.post(url)
    .send(encodedParams)
    .type('application/x-www-form-urlencoded')
    .set('Accept', 'application/json')
    .then(res => res.body)
}

class Amplitude {
  private readonly token: string;
  private readonly secretKey: string | undefined;
  private readonly userId: string;
  private readonly deviceId: string;
  private readonly sessionId: any;

  constructor (token: string, options: AmplitudeOptions) {
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

  private _generateRequestData (data: AmplitudeRequestData | [AmplitudeRequestData]) {
    const passedDataIsArray = Array.isArray(data)
    const arrayedData = passedDataIsArray ? data : [data]

    const transformedDataArray = arrayedData.map((item: AmplitudeRequestData) => {
      const transformedData = Object.keys(item).reduce((obj: AmplitudeRequestData, key: string) => {
        const transformedKey = camelCaseToSnakeCasePropertyMap[key] || key

        obj[transformedKey] = item[key]

        return obj
      }, {})

      transformedData.user_id = transformedData.user_id || this.userId
      transformedData.device_id = transformedData.device_id || this.deviceId
      transformedData.session_id = transformedData.session_id || this.sessionId

      return transformedData
    })

    return passedDataIsArray ? transformedDataArray : transformedDataArray[0]
  }

  identify (data: AmplitudeRequestData | [AmplitudeRequestData]) {
    const transformedData = this._generateRequestData(data)
    const params = {
      api_key: this.token,
      identification: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/identify', params)
  }

  track (data: AmplitudeRequestData | [AmplitudeRequestData]) {
    const transformedData = this._generateRequestData(data)
    const params = {
      api_key: this.token,
      event: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/httpapi', params)
  }

  export (options: AmplitudeExportOptions) {
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

  userSearch (userSearchId: string) {
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

  userActivity (amplitudeId: string | number, data?: AmplitudeUserActivityOptions) {
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

  eventSegmentation (data: AmplitudeSegmentationOptions) {
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

export = Amplitude
