var express = require('express');
var router = express.Router();
const {validateUser} = require('./middlewares/users')
const {STRIPE_KEY} = require('../../config')
const stripe = require('stripe')(STRIPE_KEY);
const UserModel = require('../../database/models/User')
const StripeCustomerModel = require('../../database/models/StripeCustomer')
const logger = require('../../logger')

/**
	CREATING A NEW CUSTOMER, 
	1. CHECK FOR EXISTENCE OF CUSTOMER IN DB
	IF CUSTOMER EXISTS IN DB CREATE A NEW CARD SOURCE PASSING
	 THE CUSTOMER_CODE AND THE SOURCE_TOKEN RETURNED FROM STRIPE
 * 
 * **/
router.post('', validateUser, async (req, res) => {
	const user = await UserModel.findById(req.userId).select(['email', 'full_name']);
	let stripe_customer = await StripeCustomerModel.findOne({user: userId});
	const {source_token } = req.body

	try {
		if (!stripe_customer) {
			let new_stripe_customer = await stripe.customers.create({
			  description: `Customer created for ${user.full_name}`,
			  email: user.email,
			  metadata: {
			  	registered_email: user.email
			  }
			});
			stripe_customer = await StripeCustomerModel.create({
				customer_code: new_stripe_customer.id,
				user: req.userId
			})
		}

		const stripe_card = await stripe.customers.createSource(
			stripe_customer.customer_code, 
			{source: source_token}
		)

		res.status(201)
		.json({
			success: true,
			message: 'Card source created successfully'
		})

		
	} catch (err) {
		logger.error('Could not create card', err)
		res.status(500)
		.json({
			success: false,
			message: 'Could not create source from card'
		})
	}
});

router.get(':card_id', validateUser, async (req, res) => {

})

module.exports = router