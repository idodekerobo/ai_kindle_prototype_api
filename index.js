const path = require('path');
const env = process.env.NODE_ENV || 'development';
const envPath = env === 'production' ? './.env' : './.env.development';
require('dotenv').config({ path: path.resolve(__dirname, envPath) });
const express = require('express');
const bodyParser = require('body-parser');
const API = require('./api/index');

const http = require('http')
const PORT = process.env.PORT || 3001;

const { AccessToken } = require("livekit-server-sdk")
const agentEntry = require('./agent')

const app = express();
const server = http.createServer(app)

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API routes
app.use('/api', API);

app.get('/getAccessToken', async (req, res) => {
   try {
      const roomName = "test-room-1" // TODO: randomly generate an id ? 
      const participantName = req.query.participantName || `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
      
      const accessToken = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
         identity: participantName
      })
      accessToken.addGrant({
         roomJoin: true,
         room: roomName
      }) 
      const token = await accessToken.toJwt()
      console.log("access token in jwt: ", token)

      const webSocketUrl = process.env.LIVEKIT_URL
      const data = {
         serverUrl: webSocketUrl,
         token,
         roomName,
         participantName
      }
      console.log(data);
      res.status(200).send(data);
   } catch (error) {
      console.log("Error")
      console.log(error);
      res.status(404).send({
         message: error.message
      })
      return
   }
})

// Start server
server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});