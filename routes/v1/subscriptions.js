var express = require('express');
var router = express.Router();
const {validateUser} = require('./middlewares/users')
const {
  PAYSTACK_MONTHLY_PLAN_CODE, 
  PAYSTACK_YEARLY_PLAN_CODE, 
  PAYSTACK_KEY,
  CONSTANTS
} = require('../../config');

const logger = require('../../logger');

const UserModel = require('../../database/models/User');
const SubscriptionModel = require('../../database/models/Subscription');

const PaystackNode = require('paystack-node');

const paystack = new PaystackNode(PAYSTACK_KEY)
const PaystackCustomerModel = require('../../database/models/PaystackCustomer');

router.post('', validateUser, async (req, res) => {

  const {billing_cycle} = req.body

  if (['monthy', 'yearly'].findIndex(billing_cycle) === -1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid billing cycle passed.'
    })
  }

  try {
    const user = await UserModel.findById(req.userId).select(['email', 'full_name']);

    let paystack_customer = await PaystackCustomerModel.findOne({user: req.userId});

    try {
      const planDetails = billing_cycle === 'monthy' ? 
        await paystack.getPlan(PAYSTACK_MONTHLY_PLAN_CODE) 
        : await paystack.getPlan(PAYSTACK_YEARLY_PLAN_CODE);
    } catch (err) {
      throw new Error(`Could not fetch ${billing_cycle} plan details`, err)
    }

      
    if (!paystack_customer) {

      try {
        const new_paystack_customer = await paystack.createCustomer({
          email: user.email,
          first_name: user.full_name.split(' ')[0],
          last_name: user.full_name.split(' ')[1]
        });

        paystack_customer = await PaystackCustomerModel.create({
          user: userId,
          customer_code: new_paystack_customer.customer_code,
        })
      } catch(err) {
        throw new Error('Could not create a new customer:', err);
      }
        
    }

    const paystack_transaction = await paystack.initializeTransaction({
      email: user.email,
      plan: PAYSTACK_MONTHLY_PLAN_CODE
    });

    res.status(201)
    .json({
      success: true,
      message: 'Checkout link generated successfuly',
      data: {
        checkout_link: paystack_transaction.authorization_url
      } 
    });

    await SubscriptionModel.create({
      plan_name: 'premium',
      billing_cycle,
      price: planDetails.data.amount,
      plan_description: planDetails.data.description,
      status: 'pending',
      auto_renew: true,
      features: CONSTANTS.SUBSCRIPTIONS.PREMIUM.FEATURES,
      user: req.userId,
    })

  } catch (err) {
    logger.error(err);
    res.status(500)
    .json({
      success: false,
      message: 'Could not intialize a subscription.'
    })
  }
 
})

router.get(':subscription_id', validateUser, async (req, res) => {

})

module.exports = router