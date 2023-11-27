
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        lowercase: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String, 
        required: true
    },
    nationality: {
        type: String, 
        default: ''
    },
    state: {
        type: String, 
        default: ''
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    threads: [{type: mongoose.Types.ObjectId, ref: 'Thread'}],
    messages: [{type: mongoose.Types.ObjectId, ref: 'Message'}],
    prompts: [{type: mongoose.Types.ObjectId, ref: 'Prompt'}]
}, {timestamps: true})


module.exports = mongoose.model('User', userSchema)