const winston = require('winston');

function LogString(string) {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.File({ filename: 'info.log' }),
        ],
    });
    logger.log('info', string);
    logger.close();
};
exports.log = LogString;

function LogAndPrintString(string) {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.File({ filename: 'info.log' }),
        ],
    });
    logger.log('info', string);
    logger.close();
    console.log('[\x1b[34mSERVER\x1b[0m] ' + string);
};
exports.logAndPrint = LogAndPrintString;

function PrintString(string) {
    console.log('[\x1b[34mSERVER\x1b[0m] ' + string);
};
exports.print = PrintString;

function LogError(string) {
    const logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.File({ filename: 'error.log'}),
        ],
    });
    logger.log('error', string);
    logger.close();
    console.log("[\x1b[31mERROR\x1b[0m] " + string);
};
exports.error = LogError;

function clearLog() {
    logger.clear();
};
exports.clear = clearLog;