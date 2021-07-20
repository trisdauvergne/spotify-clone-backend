const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
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

app.post('/login', (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi(credentials);

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      console.log('data from authorizationCodeGrant', data.body);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err) => {
      console.log('error message in login', err.message);
      res.sendStatus(400);
    })
})

app.listen(3001);