const functions = require('firebase-functions');

const FBAuth = require('./utils/fbAuth');

const app = require('express')();

const cors = require('cors');
app.use(cors());

const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getAllUserDetails,
    getUserDetails
  } = require('./handlers/users');

  app.post('/signup', signup);
  app.post('/login', login);
  app.post('/user/image', FBAuth, uploadImage);
  app.post('/user', FBAuth, addUserDetails);
  app.get('/user', FBAuth, getAuthenticatedUser);
  app.get('/users', getAllUserDetails);
  app.get('/user/:handle', getUserDetails);

  const {
    getDeposits,
    createDeposit,
    updateDeposit
  } =  require('./handlers/deposit');

  app.get('/deposits', FBAuth, getDeposits);
  app.post('/deposit/create', FBAuth, createDeposit);
  app.post('/deposit/:docid', FBAuth, updateDeposit);



exports.api = functions.region('us-central1').https.onRequest(app);