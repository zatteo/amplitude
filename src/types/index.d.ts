interface AmplitudeOptions {
    secretKey?: string;
    userId?: string;
    deviceId?: string;
    sessionId?: string;
    user_id?: string;
    device_id?: string;
    session_id?: string;
}

interface AmplitudeExportOptions {
    start?: Date;
    end?: Date;
}

interface AmplitudeSegmentationOptions {
    start?: Date;
    end?: Date;
    e?: string | object
}

interface AmplitudeUserActivityOptions {
    // Amplitude ID of the user
    user?: string | number;
    // Zero-indexed offset to start returning events from.
    offset?: number;
    // Limit on the number of events returned (up to 1000).
    limit?: number
}

interface AmplitudeQueryParams {
    [key: string]: any;
}

interface AmplitudeRequestData extends AmplitudeQueryParams {
    user_id?: string;
    device_id?: string;
    sessions_id?: string;
}
