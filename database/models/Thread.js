const mongoose = require('mongoose')

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        lowercase: true,
        default: ''
    },
    external_ref: String,
    messages: [{
        generated_by: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        content: String,
        timestamp: {
            type: Date,
            default: Date.now()
        } ,
    }],
    tags: [String],
    prompts: [{type: mongoose.Types.ObjectId, ref: 'Prompt'}],
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true})

module.exports = new mongoose.model('Thread', threadSchema)