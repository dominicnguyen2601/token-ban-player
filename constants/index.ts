const HARPER_DB_USERNAME = "123123";
const HARPER_DB_PASSWORD = "123123";
export const AUTH = Buffer.from(
    `${HARPER_DB_USERNAME}:${HARPER_DB_PASSWORD}`
).toString("base64");
