var express = require('express');
var router = express.Router();
const {validateUser} = require('./middlewares/users')
const {
  PAYSTACK_MONTHLY_PLAN_CODE, 
  PAYSTACK_ANNUALLY_PLAN_CODE, 
  PAYSTACK_KEY,
  CONSTANTS
} = require('../../config');

const logger = require('../../logger');

const UserModel = require('../../database/models/User');
const SubscriptionModel = require('../../database/models/Subscription');
const PaystackTransactionModel = require('../../database/models/PaystackTransaction');

const paystack = require('paystack')(PAYSTACK_KEY);
const {v4: uuid} = require('uuid')


router.post('/verify_transaction', validateUser, async (req, res) => {
  const {transaction_reference, plan_code } = req.body
  const {userId} = req
  let verifyTransaction

  try {
    verifyTransaction = await paystack.transaction.verify(transaction_reference);

    if (!verifyTransaction.status) {
      return res.status(400)
      .json({
        status: false,
        message: 'Invalid transaction reference passed'
      })
    }

  } catch (err) {
    logger.error('Could not verify transaction', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not verify transaction'
    })
  }

  try {
    const planDetails = await paystack.plan.get(plan_code);

    if (!planDetails.status) {
       return res.status(400)
      .json({
        success: false,
        message: 'Invalid plan ID passed'
      })
    }

    if (verifyTransaction.data.status === 'success') {
      let next30Days = new Date().setDate(new Date().getDate() + 31);
      let nextAnnualDate = new Date().setDate(new Date().getDate() + 366);

      await SubscriptionModel.create({
        plan_name: planDetails.data.name,
        billing_cycle: planDetails.data.interval,
        price: planDetails.data.amount,
        plan_description: planDetails.data.description,
        status: 'active',
        auto_renew: true,
        features: CONSTANTS.SUBSCRIPTIONS.PREMIUM.FEATURES,
        transaction_reference,
        user: userId,
        start_date: verifyTransaction.data.paid_at,
        end_date: planDetails.data.interval === 'monthly' ? new Date(next30Days) : new Date(nextAnnualDate)
      });
    };

    await PaystackTransactionModel.findOneAndUpdate(
      {
        reference: transaction_reference,
      }, 
      {
        status: verifyTransaction.data.status
      }
    );

    switch (verifyTransaction.data.status) {
      case 'success':
        return res.status(201)
        .json({
          success: true,
          message: 'Subscription created successfuly'
        });

      default:
        return res.status(202)
        .json({
          success: false,
          message: 'Transaction is not yet complete'
        });
    }

      

  } catch (err) {
    logger.alert('Could not create a subscription for user', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not create a subscription'
    })
  }

})

router.post('/transaction', validateUser, async (req, res) => {
  const {billing_cycle} = req.body
  const {userId} = req
  const user = await UserModel.findById(userId).select(['email', 'full_name']);

  if (['monthly', 'annually'].findIndex(i => i === billing_cycle) === -1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid billing cycle passed.'
    })
  };

  try {
    if (billing_cycle === 'monthly') {
      planDetails = await paystack.plan.get(PAYSTACK_MONTHLY_PLAN_CODE) 
    } else {
      planDetails = await paystack.plan.get(PAYSTACK_ANNUALLY_PLAN_CODE)
    }

    let newPaystackTransaction = await PaystackTransactionModel.create({
      reference: uuid(),
      status: 'pending',
      user: userId
    })

    res.status(201)
    .json({
      success: true,
      message: 'Transaction created successfuly',
      data: {
        plan_code: planDetails.data.plan_code,
        plan_name: planDetails.data.name,
        plan_interval: planDetails.data.interval,
        transaction_reference: newPaystackTransaction.reference,
        email: user.email,
        first_name: user.full_name.split(' ')[0],
        last_name: user.full_name.split(' ')[1]
      }
    })

  } catch (err) {
    logger.error(`Could not create transaction`, err);
    res.status(500)
    .json({
      status: false,
      message: `Could not fetch plan`
    })
  }

})

router.get(':subscription_id', validateUser, async (req, res) => {

})

module.exports = router