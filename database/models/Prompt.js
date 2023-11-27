
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const promptSchema = new mongoose.Schema({
   messages: [{type: mongoose.Types.ObjectId, ref: 'Message'}],
   tags: [String],
   thread: {type: mongoose.Types.ObjectId, ref: 'Thread', required: true},
   user: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true, autoIndex: false})

module.exports = mongoose.model('Prompt', promptSchema)