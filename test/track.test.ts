import { expect } from 'chai'
import nock, { DataMatcherMap } from 'nock'
import Amplitude, { AmplitudeRequestData, AmplitudeResponseBody } from '../src'

function generateMockedRequest (events: AmplitudeRequestData | Array<AmplitudeRequestData>, status: number): nock.Scope {
  if (!Array.isArray(events)) {
    events = [events]
  }

  const matcher: DataMatcherMap = {
    api_key: 'token',
    events
  }

  return nock('https://api.amplitude.com')
    .post('/2/httpapi', matcher)
    .reply(status, { some: 'data' })
}

describe('track', () => {
  let amplitude: Amplitude
  let data: AmplitudeRequestData
  let mockRequestData: AmplitudeRequestData

  beforeEach(() => {
    amplitude = new Amplitude('token', {
      user_id: 'unique_user_id',
      device_id: 'unique_device_id'
    })

    data = {
      event_type: 'event'
    }

    mockRequestData = {
      event_type: 'event',
      device_id: 'unique_device_id',
      user_id: 'unique_user_id'
    }
  })

  it('resolves when the request succeeds', () => {
    const mockedRequest = generateMockedRequest(mockRequestData, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    })
  })

  it('can pass data as camelcase and it will be autoformatted to snake case for the request', () => {
    mockRequestData = {
      event_type: 'event',
      user_id: 'different_user_id',
      device_id: 'different_device_id',
      event_properties: { foo: 'bar' },
      user_properties: { fiz: 'biz' },
      app_version: 'baz',
      os_name: 'biz',
      device_brand: 'buz',
      device_manufacturer: 'bees',
      device_model: 'bus',
      os_version: 'barz',
      location_lat: 89.445,
      location_lng: -104
    }
    data = {
      eventType: 'event',
      userId: 'different_user_id',
      deviceId: 'different_device_id',
      eventProperties: mockRequestData.event_properties,
      userProperties: mockRequestData.user_properties,
      appVersion: 'baz',
      osName: 'biz',
      osVersion: 'barz',
      deviceBrand: 'buz',
      deviceManufacturer: 'bees',
      deviceModel: 'bus',
      locationLat: mockRequestData.location_lat,
      locationLng: mockRequestData.location_lng
    }
    const mockedRequest = generateMockedRequest(mockRequestData, 200)

    return amplitude.track(data).then((res: AmplitudeResponseBody) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    })
  })

  it('can override the user id set on initialization', () => {
    mockRequestData = {
      event_type: 'event',
      device_id: 'unique_device_id',
      user_id: 'another_user_id'
    }
    data.user_id = 'another_user_id'

    const mockedRequest = generateMockedRequest(mockRequestData, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('can override the device id set on initialization', () => {
    mockRequestData = {
      event_type: 'event',
      device_id: 'another_device_id',
      user_id: 'unique_user_id'
    }
    data.device_id = 'another_device_id'
    const mockedRequest = generateMockedRequest(mockRequestData, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('rejects with an AmplitudeError when the request fails', async () => {
    const mockedRequest = generateMockedRequest(mockRequestData, 500)
    let err
    try {
      await amplitude.track(data)
    } catch (e) {
      err = e
    }

    expect(err.status).to.eq(500)
    // expect(err.message).to.eq('Internal Server Error')
    mockedRequest.done()
  })

  it('can accept an array of event objects', () => {
    const mockedRequest = generateMockedRequest([
      mockRequestData,
      mockRequestData
    ], 200)

    return amplitude.track([data, data]).then(res => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    })
  })
})
