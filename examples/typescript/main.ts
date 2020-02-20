require('dotenv').config()
// @ts-ignore
import Amplitude, { AmplitudeResponseBody } from 'amplitude'
import processor from "./lib";

const apiKey = process.env.AMPLITUDE_API_KEY || '';

(async function (): Promise<void> {
  try {
    const amp: Amplitude = new Amplitude(apiKey, {
      secretKey: 'balh'
    });
    const res: AmplitudeResponseBody = await amp.track({
      user_id: 'test-user-id',
      event_type: 'Amplitude Example'
    })
    processor(res)
  } catch (e) {
    console.error(e)
  }
})()
