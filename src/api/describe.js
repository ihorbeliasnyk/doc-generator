const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const gitHubRepoLoader = require('./githubRepoLoader');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const router = express.Router();

const generatePromps = async controllers => {
  return controllers.map(controllerCode =>
    openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Generate description of nest.js controller in json array format with following structure: controllerName, controllerDescription which will be text description of controller purpose and array of endpoints with next props: method, uri, description, httpCode',
        },
        { role: 'user', content: controllerCode },
      ],
    }),
  );
};

const cache = {};

router.post('/', async (req, res) => {
  if (cache[req.body.url]) {
    await new Promise(resolve => setTimeout(resolve, 4000));
    return res.json(cache[req.body.url]);
  } else {
    const controllers = await gitHubRepoLoader(req.body.url);
    const promptPromises = await generatePromps(controllers);
    const results = await Promise.all(promptPromises);
    const result = results.map(r => JSON.parse(r.data.choices[0].message.content));
    cache[req.body.url] = result;
    res.json(result);
  }
});

module.exports = router;
