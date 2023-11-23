const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {USER_JWT_SECRET } = require('../config')

async function generatePasswordHash(password) {
  const salt_round = 10
  return await bcrypt.hash(password, salt_round)
}

async function createJwtToken(id) {
  const maxAge = '1d'
  return await jwt.sign({userId: id}, USER_JWT_SECRET, {expiresIn: maxAge})
}

async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

async function convertToText() {
  
}

function validateUserJwtToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, USER_JWT_SECRET, (err, info) => {
      try {
          if (err) {
            reject('Invalid jwt token')
          } else {
            resolve(info.userId)
          }
      } catch (err) {
        reject('Could not validate jwt token.')
        logger.error(err)
      }
    
  })
  })
  
}

module.exports = {
  generatePasswordHash,
  createJwtToken,
  validatePassword,
  validateUserJwtToken
}