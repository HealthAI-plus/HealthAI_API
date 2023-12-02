var express = require('express');
var router = express.Router();
const ThreadModel = require('../../database/models/Thread');
const {validateUser} = require('./middlewares/users')
const logger = require('../../logger')
const {CONSTANTS, API_DOMAIN_NAME} = require('../../config');
const crypto = require('crypto');
const GeneratedLinkModel = require('../../database/models/GeneratedLink');

router.delete('/:thread_id/delete', validateUser,  async (req, res) => {
  const {userId} = req
  const {thread_id} = req.params

  try {
    await ThreadModel.findByIdAndDelete(thread_id);
    return res.status(204)
    .json({
      success: true,
      message: 'Thread deleted.'
    })
  } catch (err) {
    logger.error('Error while trying to delete thread', err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not delete thread'
    })
  }

})

router.post('/:thread_id/share', validateUser,  async (req, res) => {
    const {userId} = req
    const {thread_id} = req.params

    let linkSlug,
      encodedSlug,
      sharableLink,
      findThread;

    if (!thread_id) {
      return res.status(400)
      .json({
        success: false,
        message: 'Invalid thread ID'
      })
    }

    try {
      findThread = await ThreadModel.findById(thread_id).select(['messages', 'title']);
      if (!findThread) {
        return res.status(404)
        .json({
          success: false,
          message: 'Thread could not be found.'
        })
      }

      if (findThread.messages.length === 0) {
        return res.status(403)
        .json({
          success: false,
          message: 'Cannot share an empty thread.'
        })
      }

    } catch (err) {
      logger.error('Error while trying to check for empty thread', err)
      return res.status(500)
      .json({
        success: false,
        message: 'Something went wrong'
      })
    }

    try {
        linkSlug = crypto.randomBytes(20).toString('base64');
        encodedSlug =  encodeURIComponent(linkSlug);
        sharableLink = `${API_DOMAIN_NAME}/invite/${encodedSlug}?ty=thread`;

        await GeneratedLinkModel.create({
            user: userId,
            reason: CONSTANTS.GENERATED_LINK_REASON.SHARE_THREAD,
            slug: linkSlug,
            metadata: {
              thread_snapshot: {
                thread_title: findThread.title,
                thread_messages: [...findThread.messages],
              }
            }
        });
        res.status(201)
        .json({
            success: true,
            message: 'Link generated successfuly',
            data: {
                link: sharableLink
            }
        })
    } catch(err) {
        logger.error(err)
        res.status(500)
        .json({
            success: false,
            message: 'Could not generate sharable link'
        })
    }

})

router.get('/:thread_id', validateUser, async (req, res) => {
  const {userId} = req
  const {thread_id} = req.params

  try {
    const thread = await ThreadModel.findOne({user: userId, _id: thread_id}).select(['messages', 'title', 'tags']).populate('messages')
    if (!thread) {
      return res.status(404)
      .json({
        success: false,
        message: 'Thread could not be found'
      })
    }
    return res.status(200)
    .json({
      success: true,
      message: 'Thread found',
      data: {
        thread
      }
    })
  } catch (err) {
    logger.error(err)
    return res.status(500)
    .json({
      success: false,
      message: 'Could not find thread',
      
    })
  }
})

// Get all threads title
router.get('/', validateUser, async (req, res) => {
  const {userId} = req
  const {attribute} = req.query

  switch (attribute) {
    case 'title':
      const allThreadTitle = await ThreadModel.find({user: userId}).select(['title', 'id']);

      return res.status(200).json({
        success: true,
        message: 'Threads found.',
        data: {
          threads: allThreadTitle
        }
      })

    default:
      return res.status(400).json({
        success: false,
        message: 'No thread attribute in request url'
      })
  }

})

router.post('/', validateUser, async (req, res) => {
  const {userId} = req
  try {
    const thread = await ThreadModel.create({
      user: userId
    })

    return res.status(201)
    .json({
      success: true,
      message: 'Thread created successfully',
      data: {
        thread_id: thread.id
      }
    })

  } catch (err) {
    logger.error(err);
    res.status(500)
    .json({
      success: false,
      messae: 'A new thread could not be created'
    })
  }
})


module.exports = router