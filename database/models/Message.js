
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const messageSchema = new mongoose.Schema({
   tags: [String],
   type: {
      type: String,
      enum: [CONSTANTS.PROMPT.TYPES.TEXT, CONSTANTS.PROMPT.TYPES.SPEECH],
      default: CONSTANTS.PROMPT.TYPES.TEXT
   },
   generated_by: {
      type: String,
      enum: [CONSTANTS.PROMPT.MESSAGE.GENERATED_BY_USER, CONSTANTS.PROMPT.MESSAGE.GENERATED_BY_BOT]
   },
   content: String,
   thread: {type: mongoose.Types.ObjectId, ref: 'Thread', required: true},
   user: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true, autoIndex: false})

module.exports = mongoose.model('Message', messageSchema)