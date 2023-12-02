const mongoose = require('mongoose')
const logger = require('../../logger')
const {DB_URL} = require('../../config')

module.exports = () => {
    try {
        mongoose.connect(DB_URL, {autoIndex: false})
        logger.info("DB Connected.")
    } catch(err) {
        logger.error('DB failed to connect')
    }
    
}