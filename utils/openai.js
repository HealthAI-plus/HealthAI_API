const OpenAI = require('openai')
const { OPENAI_API_KEY } = require('../config')

const config = {
    apiKey: OPENAI_API_KEY
}
module.exports = new OpenAI(config)