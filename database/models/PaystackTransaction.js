
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const paystackTransactionSchema = new mongoose.Schema({
   reference: {
      type: String,
      unique: true
   },
   status: {
      type: String,
      required: true
   },
   user: {
      type: mongoose.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
   }
}, {
   timestamps: true, 
   autoIndex: false
});

module.exports = mongoose.model('paystackTransaction', paystackTransactionSchema)