var express = require('express');
var router = express.Router();
const {validateUser} = require('./middlewares/users')
const logger = require('../../logger')
const openai = require('../../config/openai');
const {CONSTANTS} = require('../../config');
const ThreadModel = require('../../database/models/Thread');
const MessageModel = require('../../database/models/Message');

router.delete('/:message_id/delete', validateUser,  async (req, res) => {
  const {userId} = req
  const {message_id} = req.params

  try {
    await MessageModel.findByIdAndDelete(message_id);
    return res.status(204)
    .json({
      success: true,
      message: 'Message deleted.'
    })
  } catch (err) {
    logger.error('Error while trying to delete message', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not delete thread'
    })
  }

})

router.post('/', validateUser,  async (req, res) => {
    const {user_message, thread_id, response_language, request_language} = req.body

    if (!thread_id || !await ThreadModel.findById(thread_id)) {
        return res.status(400)
        .json({
            success: false,
            message: 'Invalid thread id passed'
        })
    }

    const user_id = req.userId

    try {
        const allThreadMessages = await MessageModel.find({thread: thread_id}).select(['generated_by', 'content'])

        const newUserMessage = await MessageModel.create({
            type: CONSTANTS.PROMPT.TYPES.TEXT,
            generated_by: CONSTANTS.PROMPT.MESSAGE.GENERATED_BY_USER,
            content: user_message,
            thread: thread_id,
            user: user_id
        });
        await ThreadModel.findByIdAndUpdate(thread_id, {
            $push: {messages: newUserMessage.id}
        })

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
                {"role": "system", "content": `
                First evaluate the message content for health issues
                ${JSON.stringify(allThreadMessages)}
                
                from the above, if there are some preliminary questions prompt the patient
                keep the number of questions 2 and use the answer for evaluation of recommended drugs and medications 
                your answer should be provided in ${response_language}
                `},
                {"role": "user", "content": user_message}
            ],
        });
        const botMessage = completion.choices[0].message.content

        const newBotMessage = await MessageModel.create({
            type: CONSTANTS.PROMPT.TYPES.TEXT,
            generated_by: CONSTANTS.PROMPT.MESSAGE.GENERATED_BY_BOT,
            content: botMessage,
            thread: thread_id,
            user: user_id
        })
        await ThreadModel.findByIdAndUpdate(thread_id, {
            $push: {messages: newBotMessage.id}
        })

        return res.status(201)
        .json({
            success: true,
            message: "Message processed successfuly",
            data: {
                bot_message: {
                    type: newBotMessage.type,
                    generated_by: newBotMessage.generated_by,
                    content: newBotMessage.content,
                    thread: newBotMessage.thread,
                    _id: newBotMessage._id,
                    createdAt: newBotMessage.createdAt,
                    updatedAt: newBotMessage.updatedAt
                }
            }
        })

    } catch (err) {
        logger.error('Error occured while trying to process a message', err)
        return res.status(500)
        .json({
            success: false,
            message: 'Could not process message'

        })
    }
});

module.exports = router