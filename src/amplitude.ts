import * as request from 'superagent'
import './interfaces'

type StringMap = { [key: string]: string }

class AmplitudeError extends Error {
  readonly statusCode: number;
  readonly body: string;

  constructor(res: request.Response) {
    super(res.text)
    this.statusCode = res.status
    this.body = res.body
    if (typeof this.body === 'object') {
      this.body = JSON.stringify(this.body, null, 2)
    }
  }
}

async function postBody (url: string, params: StringMap): Promise<AmplitudeResponseBody> {
  const encodedParams = Object.keys(params).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
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

const AMPLITUDE_TOKEN_ENDPOINT = 'https://api.amplitude.com'
const AMPLITUDE_DASHBOARD_ENDPOINT = 'https://amplitude.com/api/2'

const camelCaseToSnakeCasePropertyMap: StringMap = {
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

export default class Amplitude {
  private readonly token: string;
  private readonly secretKey?: string;
  private readonly userId?: string;
  private readonly deviceId?: string;
  private readonly sessionId?: string;

  constructor (token: string, options?: AmplitudeOptions) {
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

  private _generateRequestData (data: AmplitudeRequestData | Array<AmplitudeRequestData>): Array<AmplitudePostRequestData> {
    if (!Array.isArray(data)) {
      data = [data]
    }

    return data.map((item: AmplitudeRequestData) => {
      /* eslint-disable @typescript-eslint/camelcase */
      return Object.keys(item).reduce((obj: AmplitudeQueryParams, key: string) => {
        const transformedKey = camelCaseToSnakeCasePropertyMap[key] || key

        obj[transformedKey] = item[key]

        return obj
      }, {
        event_type: item.event_type || item.eventType,
        device_id: item.device_id || this.deviceId,
        session_id: item.session_id || this.sessionId,
        user_id: item.user_id || this.userId
      })

      /* eslint-enable @typescript-eslint/camelcase */
    }) as [AmplitudePostRequestData]
  }

  identify (data: AmplitudeRequestData | [AmplitudeRequestData]): Promise<AmplitudeResponseBody> {
    const transformedData = this._generateRequestData(data)
    const params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      api_key: this.token,
      identification: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/identify', params)
  }

  track (data: AmplitudeRequestData | Array<AmplitudeRequestData>): Promise<AmplitudeResponseBody> {
    const transformedData = this._generateRequestData(data)
    const params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      api_key: this.token,
      event: JSON.stringify(transformedData)
    }

    return postBody(AMPLITUDE_TOKEN_ENDPOINT + '/httpapi', params)
  }

  export (options: AmplitudeExportOptions): request.SuperAgentRequest {
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

  userSearch (userSearchId: string): Promise<AmplitudeResponseBody> {
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

  userActivity (amplitudeId: string | number, data?: AmplitudeUserActivityOptions): Promise<AmplitudeResponseBody> {
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

  eventSegmentation (data: AmplitudeSegmentationOptions): Promise<AmplitudeResponseBody> {
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
