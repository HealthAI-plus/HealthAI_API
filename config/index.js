
require('dotenv').config()

module.exports = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV
}