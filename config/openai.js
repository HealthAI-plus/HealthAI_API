const OpenAI = require('openai')
const { CHAT_API_KEY } = require('./')

const config = {
    apiKey: process.env.CHAT_API_KEY
}
module.exports = new OpenAI(config)