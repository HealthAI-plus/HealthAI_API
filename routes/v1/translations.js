var express = require('express');
var router = express.Router();
const openai = require('../../config/openai');
const {validateUser} = require('./middlewares/users')
const logger = require('../../logger')

router.get('/', validateUser, async (req, res) => {
  const {userId} = req
  const {response_language, request_language, user_message} = req.body
  if (!request_language || !response_language || !user_message) {
    return res.status(400)
    .json({
      success: false,
      message: 'Invalid request body parameters'
    })
  }

  if (response_language === request_language) {
    return res.status(400)
    .json({
      success: false,
      message: 'Both response and request languages cannot be same'
    })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {"role": "system", "content": `
          Translate prompt to ${response_language}
        `},
        {"role": "user", "content": user_message}
      ],
    });
    const botMessage = completion.choices[0].message.content

    res.status(200)
    .json({
      success: true,
      message: 'Message translated successfuly',
      data: {
        message: user_message,
        translation: botMessage
      }
    })
  } catch (err) {
    logger.error(err);
    res.status(500)
    .json({
      success: false,
      messae: 'Translation process failed to complete'
    })
  }
})


module.exports = router