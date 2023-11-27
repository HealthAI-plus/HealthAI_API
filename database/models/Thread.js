const mongoose = require('mongoose')

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        lowercase: true,
        default: ''
    },
    tags: [String],
    messages: [{type: mongoose.Types.ObjectId, ref: 'Message'}],
    user: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true})

module.exports = mongoose.model('Thread', threadSchema)