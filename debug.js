const winston = require('winston');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Check if logging is enabled
const isLoggingEnabled = process.env.LOG === 'true';

function LogString(string) {
    if (isLoggingEnabled) {
        const logger = winston.createLogger({
            level: 'info',
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
    }
};
exports.log = LogString;

function LogAndPrintString(string) {
    if (isLoggingEnabled) {
        const logger = winston.createLogger({
            level: 'info',
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
    } else {
        console.log('[\x1b[34mSERVER\x1b[0m] ' + string);
    }
};
exports.logAndPrint = LogAndPrintString;

function PrintString(string) {
    console.log('[\x1b[34mSERVER\x1b[0m] ' + string);
};
exports.print = PrintString;

function LogError(string) {
    if (isLoggingEnabled) {
        const logger = winston.createLogger({
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.File({ filename: 'error.log' }),
            ],
        });
        logger.log('error', string);
        logger.close();
    }
    console.log("[\x1b[31mERROR\x1b[0m] " + string);
};
exports.error = LogError;

function clearLog() {
    if (isLoggingEnabled) {
        logger.clear();
    }
};
exports.clear = clearLog;
