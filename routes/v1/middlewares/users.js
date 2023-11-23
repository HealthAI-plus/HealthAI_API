const UserModel = require('../../../database/models/User')
const logger = require('../../../logger')
const {USER_JWT_SECRET} = require('../../../config')
const jwt = require('jsonwebtoken')

const {
    validatePassword,
    validateUserJwtToken
} = require('../../../utils/auth')

async function validateUser(req, res, next) {
    const token = req.signedCookies.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
    }
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

module.exports = {
    validateUser,
    validateUserCredentials
}