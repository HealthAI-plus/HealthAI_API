const UserModel = require('../../../database/models/User')
const GeneratedLinkModel = require('../../../database/models/GeneratedLink')
const MessageModel = require('../../../database/models/Message')
const logger = require('../../../logger')
const {CONSTANTS} = require('../../../config')
const { passwordStrength } = require('check-password-strength')

const {
    validatePassword,
    generatePasswordHash,
    validateUserJwtToken
} = require('../../../utils/auth')

async function validateUser(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
         return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }
    const token = authHeader.split(' ')[1];
    validateUserJwtToken(token)
    .then(userId => {
        req.userId = userId
        next()
    })
    .catch(err => {
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    })
}

async function decodeSharableThreadLink(req, res, next) {
    let {slug} = req.params
    slug = decodeURIComponent(slug)

    try {
        const findLink = await GeneratedLinkModel.findOne({slug}).populate({
            path: 'metadata',
            populate: {
                path: 'thread_snapshot',
                populate: {
                    path: 'thread_messages',
                    model: 'Message'
                }
            }
        })
        if (!findLink) {
            return res.status(400)
            .json({
                success: false,
                message: 'Invalid link'
            })
        }

        return res.status(200)
        .json({
            success: true,
            message: 'Thread messages found.',
            data: {
                thread: findLink.metadata.thread_snapshot
            }
        })

    } catch (err) {
        logger.error(err)
        return res.status(500)
        .json({
            success: false,
            message: 'Could not validate link'
        })   
    }

}


async function validatePasswordStrength(req, res, next) {
  const {new_password, confirm_password} = req.body
  const {existingHashedPassword} = req
  const MINIMUM_PASSWORD_LENGTH = 10

   if (new_password !== confirm_password) {
      return res.status(400)
      .json({
        success: false,
        message: 'New password must match confirmation password.'
      })
    }

    const hashedPassword = await generatePasswordHash(new_password)

    if (await validatePassword(new_password, existingHashedPassword)) {
      return res.status(400)
      .json({
        success: false,
        message: 'New password cannot be same with old password'
      })
    }

    if (new_password.length < MINIMUM_PASSWORD_LENGTH) {
      return res.status(400)
      .json({
        success: false,
        message: `Password should not be less than ${MINIMUM_PASSWORD_LENGTH} characters.`
      })
    }

    if (passwordStrength(new_password).value !== 'Strong') {
      return res.status(400)
      .json({
        success: false,
        message: 'Password is too weak. Use a combination of Uppercase letters, numbers and symbols.'
      })
    }

    req.newHashedPassword = hashedPassword
    next()
}

async function changePassword(req, res, next) {
    try {
        await UserModel.findByIdAndUpdate(req.userId, {
          password: req.newHashedPassword
        });
        next()
    } catch (err) {
        logger.error(err)
        return res.status(500)
        .json({
            success: false,
            message: 'Could not change user password'
        })
    }
}
 

async function validateUserCredentials(req, res, next) {
    let {email, password} = req.body
    try {
        let findUser = await UserModel.findOne({email})
        if (!findUser || !await validatePassword(password, findUser.password) ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }
        req.userId = findUser.id
        next()

    } catch (err) {
        logger.error(err)
        return res.status(401).json({
            success: false,
            message: 'Could not validate user credentials'
        })
    }
}

async function verifyEmail(req, res, next) {
    let {slug} = req.params
    slug = decodeURIComponent(slug)

    await GeneratedLinkModel.findOne({slug}).populate('user')
    .then(async (doc, err) => {
        if (err) {
            logger.error(err)
            return res.send('Email could not be verified')
        }
        if (doc) {
            await UserModel.findByIdAndUpdate(doc.user.id, {email_verified: true})
            doc.save()
            res.send('Email Verified')
        } else {
            res.send('Invalid Link')
        }
    })
}

module.exports = {
    validateUser,
    changePassword,
    verifyEmail,
    decodeSharableThreadLink,
    validateUserCredentials,
    validatePasswordStrength
}