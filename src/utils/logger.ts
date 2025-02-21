import winston from "winston";

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
  ],
});

export default logger;
