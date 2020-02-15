require('dotenv').config()
import Amplitude from 'amplitude'
import processor from "./lib";

const apiKey = process.env.AMPLITUDE_API_KEY || '';

(async function (): Promise<void> {
  try {
    const amp = new Amplitude(apiKey, {});
    const res = await amp.track({
      user_id: 'blah',
      event_type: 'Amplitude Example'
    })
    processor(res)
  } catch (e) {
    console.error(e)
  }
})()
