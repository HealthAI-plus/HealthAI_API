var express = require('express');
var router = express.Router();
const openai = require('../utils/openai')

/* GET home page. */
router.get('/', async function(req, res, next) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
});

module.exports = router;
