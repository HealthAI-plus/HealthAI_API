
require('dotenv').config()

module.exports = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    USER_JWT_SECRET: process.env.USER_JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    COOKIE_PARSER_SECRET: process.env.COOKIE_PARSER_SECRET,
}