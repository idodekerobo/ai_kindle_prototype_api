const express = require("express")
const router = express.Router();
const multer = require("multer")
const activeConnections = require('../utils/activeConnections');
const { getFirestoreDocument } = require('../utils/firebase')
const { ASSISTANT_INSTRUCTIONS } = require('../prompts/instructions_v1');

router.get('/', (req, res) => {
   res.send({ message: "API is up and running." });
})

router.post('/connect', (req, res) => { })

router.get('/getUserContent', (req, res) => {
   try {
      const contentArr = content
      res.status(200).send(contentArr)
   } catch (error) {
      console.log('issue getting content')
      console.log(error);
      res.status(500).send({
         message: "Error getting content",
         error: error.message
      })
   }
})

router.get('/getContentDetails/:documentId', (req, res) => {
   try {
      const returnContent = content[0]
      console.log(returnContent.title)
      res.status(200).send( returnContent )
      return
   } catch (error) {
      console.log('issue sending content')
      console.log(error);
      res.status(500).send({
         message: "Error getting content",
         error: error.message
      })
   }
})

// TODO: save file to cloud storage
const uploadAudio = multer({
   storage: multer.memoryStorage(),
   limits: {
      fileSize: 15 * 1024 * 1024 // 15mb file limit,
   },
   fileFilter: (req, file, cb) => {
      // accept WAV files only
      if (file.mimetype.startsWith('audio/wav')) {
         cb(null, true);
      } else {
         cb(new Error("Invalid file type"), false);
      }
   }
})

router.get('/transcripts/:conversationId', async (req, res) => {
   // const conversationId = req.params.conversationId;
   const conversationId = "001"
   try {
      const conversationData = await getFirestoreDocument("conversations", conversationId);
      res.status(201).send(conversationData)
   } catch (error) {
      console.log("Error getting conversation data");
      console.log(error);
      res.status(503).send({
         message: error.message,
         error: error
      })
   }
})

router.post('/addContextToConversation', async (req, res) => {
   const { title, publisher, author, textContent } = req.body
   try {
      const socketId = req.headers["socket-id"]
      const ws = activeConnections.get(socketId);
      if (!ws) {
         console.log("No active web socket connection found for this socket id!", socketId);
         return res.status(404).send({ message: "No active connection found" });
      }
      const conversationItem = {
         type: "conversation.item.create",
         item: {
            type: "message",
            role: "user",
            content: [
               {
                  type: "input_text",
                  text: `
                  <title>${title}</title>
                  <author>${author}</author>
                  <textContent>${textContent}</textContent>
                  `
               }
            ],
         },
      };
      ws.send(JSON.stringify(conversationItem));
      res.status(200).send({
         message: "Successfully added conversation item."
      })

   } catch (error) {
      console.log("Error adding context to the conversation")
      console.log(error)
      res.status(500).send({
         message: error.message,
         error: error
      })
   }
})

module.exports = router