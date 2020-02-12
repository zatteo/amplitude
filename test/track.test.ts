import { expect } from 'chai'
import nock = require('nock')
import Amplitude = require('../src/amplitude')

function generateMockedRequest (event: AmplitudeQueryParams, status: number) {
  const body = `api_key=token&event=${encodeURIComponent(JSON.stringify(event))}`
  return nock('https://api.amplitude.com')
    .post('/httpapi', body)
    .reply(status, { some: 'data' })
}

describe('track', () => {
  let amplitude: Amplitude
  let data: AmplitudeRequestData
  let event: AmplitudeRequestData

  beforeEach(() => {
    amplitude = new Amplitude('token', {
      user_id: 'unique_user_id',
      device_id: 'unique_device_id'
    })

    data = {
      event_type: 'event'
    }

    event = {
      event_type: 'event',
      user_id: 'unique_user_id',
      device_id: 'unique_device_id'
    }
  })

  it('resolves when the request succeeds', () => {
    const mockedRequest = generateMockedRequest(event, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('can pass data as camelcase and it will be autoformatted to snake case for the request', () => {
    event = {
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
    const mockedRequest = generateMockedRequest(event, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('can override the user id set on initialization', () => {
    event = {
      event_type: 'event',
      user_id: 'another_user_id',
      device_id: 'unique_device_id'
    }
    data.user_id = 'another_user_id'
    const mockedRequest = generateMockedRequest(event, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('can override the device id set on initialization', () => {
    event = {
      event_type: 'event',
      device_id: 'another_device_id',
      user_id: 'unique_user_id'
    }
    data.device_id = 'another_device_id'
    const mockedRequest = generateMockedRequest(event, 200)

    return amplitude.track(data).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })

  it('rejects when the request fails', () => {
    const mockedRequest = generateMockedRequest(event, 500)

    return amplitude.track(data)
      .then((res) => {
        throw new Error('should not resolve')
      }).catch((err) => {
        expect(err.status).to.eql(500)
        expect(err.message).to.eql('Internal Server Error')
        mockedRequest.done()
      })
  })

  it('can accept an array of event objects', () => {
    const mockedRequest = generateMockedRequest([event], 200)

    return amplitude.track([data]).then((res) => {
      expect(res).to.eql({ some: 'data' })
      mockedRequest.done()
    }).catch((err) => {
      expect(err).to.equal(undefined)
    })
  })
})
