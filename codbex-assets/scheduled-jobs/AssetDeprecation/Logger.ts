import { update } from "sdk/db";

export enum LogDataSeverity {
    INFO = 'Info',
    WARNING = 'Warning',
    ERROR = 'Error'
}

export interface LogData {
    readonly date: Date;
    readonly severity: LogDataSeverity;
    readonly message: string;
}

export class Logger {

    public static log(logData: LogData) {
        Logger.saveLogEvent(logData);

        const message = `---> [${logData.severity}] [${Logger.toDateString(logData.date)}]: ${logData.message} <---`;
        switch (logData.severity) {
            case LogDataSeverity.INFO:
                console.info(message);
                break;
            case LogDataSeverity.WARNING:
                console.warn(message);
                break;
            case LogDataSeverity.ERROR:
                console.error(message);
                break;
        }
    }

    private static saveLogEvent(logData: LogData) {
        const sql = `insert into LOG_EVENTS ("LOG_SEVERITY", "LOG_MESSAGE", "LOG_TIMESTAMP") values (?, ?, ?)`;
        const queryParameters = [logData.severity, logData.message, logData.date];

        update.execute(sql, queryParameters, null);
    }

    private static toDateString(date: Date): string {
        return `${date.toLocaleDateString()}; ${date.toLocaleTimeString()}`;
    }
}
