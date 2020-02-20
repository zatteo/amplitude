import { AxiosError } from 'axios'
import { AmplitudeResponseBody } from './public'

export class AmplitudeErrorResponse extends Error {
  readonly status: number;

  constructor(err: AxiosError) {
    super(err.message)
    this.status = err.response.status
  }
}

export const axiosErrorCatcher = async (reqPromise: Promise<AmplitudeResponseBody>): Promise<AmplitudeResponseBody> => {
  try {
    const res = await reqPromise
    return res
  } catch (err) {
    if (err.response) {
      throw new AmplitudeErrorResponse(err)
    }
    throw err
  }
}
