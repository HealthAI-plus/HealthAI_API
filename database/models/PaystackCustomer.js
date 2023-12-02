
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const paystackCustomerSchema = new mongoose.Schema({
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

module.exports = mongoose.model('paystackCustomer', paystackCustomerSchema)