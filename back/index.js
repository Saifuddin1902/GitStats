
const express = require('express');

const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
const axiosConfig = GITHUB_TOKEN ? {
  headers: { Authorization: `token ${GITHUB_TOKEN}` }
} : {};

app.get('/user/:username/languages', async (req, res) => {
  const username = req.params.username;
  console.log(`Fetching languages for: ${username}`);

  try {
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, axiosConfig);
    const repos = reposResponse.data;

    const languageCounts = {};

    // Fetch all languages per repo in parallel
    const languagePromises = repos.map(repo => axios.get(repo.languages_url, axiosConfig));
    const languagesArray = await Promise.all(languagePromises);

    // Aggregate bytes per language
    languagesArray.forEach(langRes => {
      const languages = langRes.data;
      for (const [lang, bytes] of Object.entries(languages)) {
        languageCounts[lang] = (languageCounts[lang] || 0) + bytes;
      }
    });

    res.json(languageCounts);
  } catch (error) {
    console.error(error.message);
    res.status(404).json({ error: 'User not found or API error' });
  }
});

app.get('/user/:username', async (req, res) => {
  const username = req.params.username;
  console.log(`Fetching user info for: ${username}`);

  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, axiosConfig);
    res.json({
      name: response.data.name || username,
      avatar: response.data.avatar_url,
      repos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
      profile: response.data.html_url
    });
  } catch (error) {
    console.error(error.message);
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
