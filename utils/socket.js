
const {Server } = require('socket.io')
const { CONSTANTS } = require('../config');
const openai = require('../config/openai');
const {validateSocketJwtToken} = require('./auth')
const logger = require('../logger')
const {S3} = require('../config/aws')
const ThreadModel = require('../database/models/Thread')

const io = new Server({
    maxHttpBufferSize: CONSTANTS.MAX_SOCKET_MEDIA_SIZE
})

const chat = io.of('/chat')

chat.use((socket, next) => {
    try {
        const {chatsessiontoken} = socket.handshake.headers

        validateSocketJwtToken(chatsessiontoken)
        .then(res => {
            socket.userId = res
            next()
        })
        .catch(err => {
            logger.error(err)
        })

    } catch (err) {
        logger.error(err)
    }
    
})
.on('connection', socket => {
    const {userId} = socket
    
    socket.on('prompt_text', async obj => {
        const {message, thread_id, language} = obj
        const findThreadMessages = await ThreadModel.findById(thread_id).select(['messages']);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
              {"role": "system", "content": `
              First evaluate the prompt for health issues
              Use ${JSON.stringify(findThreadMessages?.messages)} as your thread messages
              
              from the above, if there are some preliminary questions prompt the patient to help you better evaluate the situation.
              Make your answer concised and your ans?wer should be provided in ${language}
              Use the follow up questions to diagnosis like a medical practitioner
              `},
              {"role": "user", "content": message}
            ],
        });

        const botResponse = completion.choices[0].message.content

        await ThreadModel.findById(thread_id)
        .then((doc, err) => {
            if (err) return
            if (doc) {
                doc.messages.push(
                    {
                        generated_by: 'user',
                        content: message
                    },
                    {
                        generated_by: 'bot',
                        content: botResponse
                    }
                );
                doc.save()
            }

        })
        socket.emit('prompt_text_response', {
            message: botResponse
        })

    })

    socket.on('user_reply_to_bot', async (obj) => {
        const {thread_id, prompt_id, questions} = obj

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {"role": "system", "content": `
              act like a health care assistant, your job s to provide health diagnosis to patients with a precise response. Do not respond if you dont have 60% of the accurate answer. Parse this answers from the patient. The answers are a response to questions
              `},
              {"role": "user", "content": JSON.parse(questions)}
            ],
            stream: true,
        })

        for await (const chunk of completion) {
            console.log(chunk.choices[0].delta.content);
            socket.emit('chunk_response', {
                chunk: chunk.choices[0].delta.content,
            })
        }
    })
})

module.exports = io