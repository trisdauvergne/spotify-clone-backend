const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');
const app = express();
const cors = require('cors');
require('dotenv').config();

// const redirect = app.settings.env === 'development' ? 'http://localhost:3000' :'https://trisdauvergne-spotify-clone.netlify.app/';

const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'https://trisdauvergne-spotify-clone.netlify.app/',
}

console.log('in server.js line 14', app.settings.env);
console.log('*****', process.env.NODE_ENV);

console.log('In server.js', credentials);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// // use the express-static middlewares
// app.use(express.static('public'))

app.get('/lyrics', async (req, res) => {
  console.log('************* lyrics', req);
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
      console.log('in refresh', err.message)
      res.sendStatus(400);
    })
})

app.post('/login', (req, res) => {
  const code = req.body.code;
  console.log('*** in login', code);
  const spotifyApi = new SpotifyWebApi(credentials);
  console.log('*** credentials in login', credentials);

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log('*** error message in login', err.message);
      res.sendStatus(400);
    })
})

app.listen(process.env.PORT || 3001, () => console.log('Server is running...'));