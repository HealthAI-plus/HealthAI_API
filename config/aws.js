const AWS = require('aws-sdk')
const {AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION} = require('./')

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});
module.exports = {
  S3: new AWS.S3()
}