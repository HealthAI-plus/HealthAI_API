const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const generatedLinkSchema = new mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'User'},

    reason: {
        type: String,
        enum: [CONSTANTS.GENERATED_LINK_REASON.EMAIL_VERIFICATION, CONSTANTS.GENERATED_LINK_REASON.FORGOT_PASSWORD],
        required: true
    },

    slug: {
        type: String,
        unique: true,
        required: true
    },
    
    delivery_status: {
        type: String,
        enum: [CONSTANTS.EMAIL_DELIVERY_STATUS.DELIVERED, CONSTANTS.EMAIL_DELIVERY_STATUS.PENDING, CONSTANTS.EMAIL_DELIVERY_STATUS.FAILED ],
        default: CONSTANTS.EMAIL_DELIVERY_STATUS.PENDING
    }
}, {timestamps: true})

module.exports = mongoose.model('GeneratedLink', generatedLinkSchema)