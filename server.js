const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');
const app = express();
const cors = require('cors');
require('dotenv').config();

const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
}

console.log('In server.js', credentials);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/lyrics', async (req, res) => {
  const lyrics = await lyricsFinder(req.query.artist, req.query.track) || 'No lyrics found';
  res.json({ lyrics });
});

app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    ...credentials,
    refreshToken,
  });

  spotifyApi.refreshAccessToken()
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      })
    })
    .catch(err => {
      console.log(err.message)
      res.sendStatus(400);
    })
})

app.post('/login', (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi(credentials);

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log('error message in login', err.message);
      res.sendStatus(400);
    })
})

app.listen(3001);