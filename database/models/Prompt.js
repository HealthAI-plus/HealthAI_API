
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')
const promptSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [CONSTANTS.PROMPT_TYPES.SPEECH, CONSTANTS.PROMPT_TYPES.TEXT],
        default: CONSTANTS.PROMPT_TYPES.TEXT
    },
    response: {
        type: String,
        default: ''
    },
    read_status: {
        type: Boolean,
        default: false
    },
    media_present: {
        type: Boolean,
        default: false
    },
    media_link: String,
    media_type: String,
    questions: [{question: String, answer: String}],
    tags: [String],
    thread: {type: mongoose.Types.ObjectId, ref: 'Thread', required: true},
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true, autoIndex: false})

module.exports = mongoose.model('Prompt', promptSchema)