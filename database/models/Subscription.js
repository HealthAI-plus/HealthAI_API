
const mongoose = require('mongoose')
const {CONSTANTS} = require('../../config')

const subscriptionSchema = new mongoose.Schema({
   plan_name: {
      type: String,
      required: true
   },
   plan_description: String,
   billing_cycle: {
      type: String,
      enum: ['annually', 'monthly'],
      default: 'annually',
      required: true
   },
   features: [{name: String, description: String}],
   price: {
      type: Number,
      required: true
   },
   start_date: Date,
   end_date: Date,
   auto_renew: Boolean,
   status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: 'pending',
      required: true
   },
   transaction_reference: {
      type: mongoose.Types.ObjectId, 
      ref: 'PaystackTransaction', 
      required: true
   },
   user: {
      type: mongoose.Types.ObjectId, 
      ref: 'User', 
      required: true
   }
}, {
   timestamps: true, 
   autoIndex: false
});

module.exports = mongoose.model('Subscription', subscriptionSchema)