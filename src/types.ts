type AmplitudeResponseBody = object

type AmplitudeQueryParams = {
  [key: string]: object | string | number | boolean | undefined;
}

type AmplitudeRequestData = {
  eventType?: string;
  event_type?: string;
  [key: string]: object | string | number | boolean | undefined;
}

type AmplitudeOptions = {
  secretKey?: string;
  userId?: string;
  deviceId?: string;
  sessionId?: string;
  user_id?: string;
  device_id?: string;
  session_id?: string;
}

type AmplitudeExportOptions = {
  start?: Date;
  end?: Date;
}

type AmplitudeSegmentationOptions = {
  start?: Date;
  end?: Date;
  e?: string | object;
}

type AmplitudeUserActivityOptions = {
  // Amplitude ID of the user
  user?: string | number;
  // Zero-indexed offset to start returning events from.
  offset?: number;
  // Limit on the number of events returned (up to 1000).
  limit?: number;
}
