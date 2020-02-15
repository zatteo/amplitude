import request from 'superagent';

declare module 'amplitude' {
  export type AmplitudeOptions = {
    secretKey?: string;
    userId?: string;
    deviceId?: string;
    sessionId?: string;
    user_id?: string;
    device_id?: string;
    session_id?: string;
  }

  export type AmplitudeExportOptions = {
    start?: Date;
    end?: Date;
  }

  export type AmplitudeSegmentationOptions = {
    start?: Date;
    end?: Date;
    e?: string | object;
  }

  export type AmplitudeUserActivityOptions = {
    // Amplitude ID of the user
    user?: string | number;
    // Zero-indexed offset to start returning events from.
    offset?: number;
    // Limit on the number of events returned (up to 1000).
    limit?: number;
  }

  export type StringMap = { [key: string]: string }

  export type AnythingBasically =  object | string | number | boolean | undefined;

  export type AmplitudeQueryParams = {
    [key: string]: AnythingBasically;
  }

  export type AmplitudeRequestData = {
    eventType?: string;
    event_type?: string;
    [key: string]: AnythingBasically;
  }

  export interface AmplitudePostRequestData extends AmplitudeRequestData {
    user_id: string;
    device_id: string;
    sessions_id: string;
  }

  export default class Amplitude {
    private readonly token;
    private readonly secretKey;
    private readonly userId;
    private readonly deviceId;
    private readonly sessionId;
    constructor(token: string, options?: AmplitudeOptions);
    private _generateRequestData;
    identify(data: AmplitudeRequestData | [AmplitudeRequestData]): Promise<string | object>;
    track(data: AmplitudeRequestData | [AmplitudeRequestData]): Promise<string | object>;
    export(options: AmplitudeExportOptions): request.SuperAgentRequest;
    userSearch(userSearchId: string): Promise<any>;
    userActivity(amplitudeId: string | number, data?: AmplitudeUserActivityOptions): Promise<any>;
    eventSegmentation(data: AmplitudeSegmentationOptions): Promise<any>;
  }
}
