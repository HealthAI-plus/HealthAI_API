
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const stripeCustomerSchema = new mongoose.Schema({
   customer_code: {
      type: String,
      unique: true
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

module.exports = mongoose.model('stripeCustomer', stripeCustomerSchema)