const express = require("express");
const router = express.Router();
const signinCtrl = require('../controller/signin');


// signin
router.post('/signin', signinCtrl.signin);
router.post('/verify-signin', signinCtrl.verifySignin);


module.exports = router;