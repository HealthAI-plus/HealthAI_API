const mongoose = require('mongoose')
const logger = require('../../logger')
const {DB_URL} = require('../../config')

module.exports = () => {
    try {
        mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        logger.info("DB Connected.")
    } catch(err) {
        logger.alert('DB failed to connect')
    }
    
}