var express = require('express');
var router = express.Router();
const {validateUser} = require('./middlewares/users')
const logger = require('../../logger')
const openai = require('../../config/openai');
const {CONSTANTS} = require('../../config');
const ThreadModel = require('../../database/models/Thread');
const MessageModel = require('../../database/models/Message');
const PromptModel = require('../../database/models/Prompt');

router.post('/', validateUser,  async (req, res) => {
    const {user_message, thread_id, response_language, message_language} = req.body

    if (!thread_id) {
        return res.status(400)
        .json({
            success: false,
            message: 'Invalid thread id passed'
        })
    }

    const user_id = req.userId

    try {
        const allThreadMessages = await MessageModel.find({thread: thread_id}).select(['generated_by', 'content'])
        let newPrompt = await PromptModel.create({
            thread: thread_id,
            user: user_id
        })
        let newUserMessage = await MessageModel.create({
            type: CONSTANTS.PROMPT.TYPES.TEXT,
            generated_by: CONSTANTS.PROMPT.MESSAGE.GENERATED_BY_USER,
            content: user_message,
            thread: thread_id,
            prompt: newPrompt.id,
            user: user_id
        });

        await PromptModel.findByIdAndUpdate( newPrompt.id, {
            $push: {
                messages: newUserMessage.id
            }
        })

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
            {"role": "system", "content": `
            First evaluate the prompt for health issues
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
            prompt: newPrompt.id,
            user: user_id
        })

        await PromptModel.findByIdAndUpdate( newPrompt.id, {
            $push: {
                messages: newBotMessage.id
            }
        })

        return res.status(201)
        .json({
            success: true,
            message: botMessage
        })

    } catch (err) {
        logger.error('Error occured while trying to process a prompt', err)
        return res.status(500)
        .json({
            success: false,
            message: 'Could not process prompt'

        })
    }
});

module.exports = router