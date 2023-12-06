var express = require('express');
var router = express.Router();

const logger = require('../../logger')
const UserModel = require('../../database/models/User')
const SubscriptionModel = require('../../database/models/Subscription')
const GeneratedLinkModel = require('../../database/models/GeneratedLink')
const {createJwtToken, generatePasswordHash, validatePassword} = require('../../utils/auth')
const {sendVerificationEmail, sendPasswordResetLink} = require('../../utils/sendEmail')
const {validateUserCredentials, changePassword, validateUser, validatePasswordStrength} = require('./middlewares/users')
const {NODE_ENV, CONSTANTS, API_DOMAIN_NAME, STRIPE_PUBLISHABLE_KEY} = require('../../config')
const crypto = require('crypto');

router.get('', validateUser, async (req, res) => {
  try {
    const findUser = await UserModel.findById(req.userId).select(['full_name',  'email', 'state', 'email_verified', 'nationality'])
    if (findUser) {
      res.status(200)
      .json({
        success: true,
        message: 'User found',
        data: {user: findUser}
      })
    } else {
      res.status(400)
      .json({
        success: true,
        message: 'User not found'
      })
    }
  } catch (err) {
    logger.error('Could not find user', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not find user'
    })
  }
    
})

router.post('/forgot_password', async (req, res) => {
  const {email} = req.body

  if (!email) {
    return res.status(400)
    .json({
      success: false,
      message: 'Invalid Email Address passed.'
    })
  }

  try {
    const user = await UserModel.findOne({email})
    if (user) {
      const linkSlug = crypto.randomBytes(20).toString('base64');
      const passwordResetLink = `${API_DOMAIN_NAME}/reset_password/${linkSlug}`

      const newLink = await GeneratedLinkModel.create({
        slug: linkSlug,
        user: user.id,
        reason: CONSTANTS.GENERATED_LINK_REASON.RESET_PASSWORD
      })

      sendPasswordResetLink(email, passwordResetLink)
      .then(async res => {
        await GeneratedLinkModel.findByIdAndUpdate(newLink.id, {
          metadata: {
            email_delivery_status: CONSTANTS.EMAIL_DELIVERY_STATUS.DELIVERED
          }
        })
      })
      .catch(async err => {
        await GeneratedLinkModel.findByIdAndUpdate(newLink.id, {
          metadata: {
            email_delivery_status: CONSTANTS.EMAIL_DELIVERY_STATUS.FAILED
          }
        })
      })

    }

    return res.status(200)
    .json({
      success: true,
      message: 'If the email address is registered, you will receive a password reset link shortly.'
    })
  } catch (err) {
    logger.error('Could not send password reset link', err);
    return res.status(500)
    .json({
      success: false,
      message: 'Could not send password reset link'
    })
  }
  
})

router.post('/reset_password/:slug', async (req, res, next) => {
  const {slug} = req.params

  try {
    const findSlug = await GeneratedLinkModel.findOne({
      slug
    })

    if (!findSlug) {
      return res.status(400)
      .json({
        success: false,
        message: 'Invalid Link'
      })
    };

    const findUser = await UserModel.findById(findSlug.user).select(['password'])
    req.existingHashedPassword = findUser.password
    req.userId = findUser.id

    next();

  } catch (err) {
    logger.error('Could not initiate a password reset', err);
    return res.status(500)
    .json({
      success: false,
      message: 'Could not initiate a password reset'
    })
  }

},
  validatePasswordStrength, 
  changePassword,
  async (req, res) => {
    const {slug} = req.params
    await GeneratedLinkModel.findOneAndDelete({slug})
    return res.status(200)
      .json({
        success: true,
        message: 'Password changed successfully'
    })
  }
);


router.post('/change_password', validateUser, async (req, res, next) => {
  const {current_password} = req.body

  const {userId} = req

  try {
    const findUser = await UserModel.findById(userId).select(['password']);

    const isValidPassword = await validatePassword(current_password, findUser.password);
    if (!isValidPassword) {
      return res.status(401)
      .json({
        success: false,
        message: 'Incorrect password'
      })
    };
    req.existingHashedPassword = findUser.password
    next();
    
  } catch (err) {
    logger.error('Password validation error', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Password change was not Successfull'
    })
  }
}, 
  validatePasswordStrength, 
  changePassword
);

router.post('/', async (req, res) => {
  const {full_name, email, password} = req.body
  if (!full_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please complete your form"
    })
  }

  try {
    const findUser = await UserModel.findOne({email})
    if (findUser) {
      return res.status(400).json({
        success: false,
        message: 'Email Already Exists'
      })
    }
  } catch (err) {
    logger.error(err)
    return res.status(400).json({
      success: false,
      message: 'Email address could not be validated.'
    })
  }

  try{
    const hashedPassword = await generatePasswordHash(password);
    const user = await UserModel.create({
      full_name,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      success: true,
      message: "User Registration Successfull. Kindly check your email for a email verification link."
    })

    try {
      const linkSlug = crypto.randomBytes(20).toString('base64');
      const encodedSlug =  encodeURIComponent(linkSlug);
      const verificationLink = `${API_DOMAIN_NAME}/verifyemail/${encodedSlug}`
      const newLink = await GeneratedLinkModel.create({
        slug: linkSlug,
        user: user.id,
        reason: CONSTANTS.GENERATED_LINK_REASON.EMAIL_VERIFICATION
      })

      sendVerificationEmail(email, verificationLink)
  
    } catch (err) {
      logger.error('Could not send email verification link.', err);
    }
    
  } catch (err) {
    logger.error(err)
    return res.status(500).json({
      success: false,
      message: "User registration failed"
    })
  }
})

router.post('/login', validateUserCredentials, async (req, res) => {
  const token = await createJwtToken(req.userId);
  res.set('Authorization', `Bearer ${token}`);
  res.cookie('token', token, {
    signed: true,
    path: '/',
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: NODE_ENV === 'production' ? true : false
  });
  res.status(200).json({
    success: true,
    message: 'Login Successful',
    data: {
      token
    }
  })
})
module.exports = router;
