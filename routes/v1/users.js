var express = require('express');
var router = express.Router();

const logger = require('../../logger')
const UserModel = require('../../database/models/User')
const {createJwtToken, generatePasswordHash} = require('../../utils/users')
const {validateUserCredentials} = require('./middlewares/users')
const {NODE_ENV} = require('../../config')

router.get('/', function(req, res, next) {
  
});

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
    const hashedPassword = await generatePasswordHash(password)
    await UserModel.create({
      full_name,
      email,
      password: hashedPassword
    })

    return res.status(201).json({
      success: true,
      message: "User Registration Successfull."
    })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({
      success: false,
      message: "User registration failed"
    })
  }
})

router.post('/login', validateUserCredentials, async (req, res) => {
  const token = await createJwtToken(req.userId)
  res.cookie('token', token, {
    signed: true,
    path: '/',
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: NODE_ENV === 'production' ? true : false
  });
  res.status(200).json({
    success: true,
    message: 'Login Successful'
  })
})
module.exports = router;
