const { initializeApp, cert } = require('firebase-admin/app');

// firebase
initializeApp({
   credential: cert({
      type: process.env.FB_CERT_CREDENTIAL_TYPE,
      project_id: process.env.GCP_PROJECT_ID,
      private_key_id: process.env.FB_CERT_PRIVATE_KEY_ID,
      private_key: process.env.FB_CERT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FB_CERT_CLIENT_EMAIL,
      client_id: process.env.FB_CERT_CLIENT_ID,
      auth_uri: process.env.FB_CERT_AUTH_URI,
      token_uri: process.env.FB_CERT_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FB_CERT_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FB_CERT_CLIENT_CERT_URL,
      universe_domain: process.env.FB_CERT_UNIVERSE_DOMAIN
   }),
   storageBucket: `${process.env.GCLOUD_STORAGE_BUCKET}`
});

const { getFirestore, FieldValue, /*Timestamp, Filter */ } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth')
const { getMessaging } = require("firebase-admin/messaging")
const { Storage } = require("@google-cloud/storage");

const firestoreDb = getFirestore();
const firebaseAuth = getAuth()
const firebaseCloudMessaging = getMessaging();

const gCloudStorage = new Storage({
   projectId: process.env.GCP_PROJECT_ID,
   credentials: {
      client_email: process.env.FB_CERT_CLIENT_EMAIL,
      private_key: process.env.FB_CERT_PRIVATE_KEY.replace(/\\n/g, '\n')
   }
});


const addDataToFirestore = async (collection, data) => {
   try {
      const docRef = firestoreDb.collection(collection).doc();
      // get doc ID
      const res = await docRef.set({
         id: docRef.id,
         ...data
      });
      return docRef.id;
   } catch (error) {
      console.log(error);
      throw error
   }
}
const getFirestoreDocument = async (collection, documentId) => {
   if (!documentId) {
      return
   }
   try {
      const docRef = firestoreDb.collection(collection).doc(documentId)
      const doc = await docRef.get();
      if (!doc.exists) {
         console.log('doc doesn\'t exist')
         return false
      } else {
         console.log('data')
         return doc.data()
      }
   } catch (error) {
      console.log('CAUGHT AN ERROR')
      console.log(error);
      throw error
   }
}
/*
collection - String of collection name in Firebase Firestore
documentId - String of id of Firebase Firestore document to update
data - key value pair of name of property to update and value to update it too. i.e., { email: newUserEmail@gmail.com}
*/
const updateFirestoreDocument = async (collection, documentId, data) => {
   try {
      const docRef = firestoreDb.collection(collection).doc(documentId)
      const response = await docRef.update(data)
      return response
   } catch (error) {
      console.log("CAUGHT AN ERROR UPDATING FIRESTORE DOCUMENT", error)
      throw error
   }
}
module.exports = {
   addDataToFirestore,
   getFirestoreDocument,
   updateFirestoreDocument,
   FieldValue
}