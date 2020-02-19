import { expect } from 'chai'
import nock from 'nock'
import Amplitude from '../dist'

function generateMockedRequest (event: AmplitudeQueryParams | Array<AmplitudeQueryParams>, status: number): nock.Scope {
  if (!Array.isArray(event)) {
    event = [event]
  }
  return nock('https://api.amplitude.com')
    .post('/httpapi', reqBody => {
      if (reqBody.api_key !== 'token') {
        return false
      }
      const evBody = JSON.parse(reqBody.event)
      try {
        expect(evBody).to.eql(event)
        return true
      } catch (e) {
        return false
      }
    })
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
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('can pass data as camelcase and it will be autoformatted to snake case for the request', () => {
    mockRequestData = {
      event_type: 'event',
      user_id: 'different_user_id',
      device_id: 'different_device_id',
      event_properties: 'foo',
      user_properties: 'bar',
      app_version: 'baz',
      os_name: 'biz',
      device_brand: 'buz',
      device_manufacturer: 'bees',
      device_model: 'bus',
      device_type: 'barz',
      location_lat: 'up',
      location_lng: 'down'
    }
    data = {
      eventType: 'event',
      userId: 'different_user_id',
      deviceId: 'different_device_id',
      eventProperties: 'foo',
      userProperties: 'bar',
      appVersion: 'baz',
      osName: 'biz',
      deviceBrand: 'buz',
      deviceManufacturer: 'bees',
      deviceModel: 'bus',
      deviceType: 'barz',
      locationLat: 'up',
      locationLng: 'down'
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

  it('rejects when the request fails', async () => {
    const mockedRequest = generateMockedRequest(mockRequestData, 500)
    let err
    try {
      await amplitude.track(data)
    } catch (e) {
      err = e
    }

    expect(err.statusCode).to.eq(500)
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
