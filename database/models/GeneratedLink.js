const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const generatedLinkSchema = new mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User'},

    reason: {
        type: String,
        enum: [
            'email-verification',
            'reset-password',
            'share-thread'
        ],
        required: true
    },

    slug: {
        type: String,
        unique: true,
        required: true
    },

    metadata: Object

}, {timestamps: true})

module.exports = mongoose.model('GeneratedLink', generatedLinkSchema)