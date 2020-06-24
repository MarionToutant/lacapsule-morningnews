var express = require('express');
var router = express.Router();

var uid2 = require('uid2')
var SHA256 = require('crypto-js/sha256')
var encBase64 = require('crypto-js/enc-base64')

var userModel = require('../models/users')
var articleModel = require('../models/articles')

var request = require('sync-request');

const dotenv = require('dotenv');
dotenv.config();


// SIGN-UP

router.post('/sign-up', async function(req,res,next){

  var error = []
  var result = false
  var saveUser = null
  var token = null

  const data = await userModel.findOne({
    email: req.body.emailFromFront
  })

  if(data != null){
    error.push('utilisateur déjà présent')
  }

  if(req.body.usernameFromFront == ''
  || req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }


  if(error.length == 0){

    var salt = uid2(32)
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: SHA256(req.body.passwordFromFront+salt).toString(encBase64),
      token: uid2(32),
      salt: salt,
    })
  
    saveUser = await newUser.save()
  
    
    if(saveUser){
      result = true
      token = saveUser.token
    }
  }
  

  res.json({result, saveUser, error, token})
})

// SIGN-IN

router.post('/sign-in', async function(req,res,next){

  var result = false
  var user = null
  var error = []
  var token = null
  
  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }

  if(error.length == 0){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
    })
  
    
    if(user){
      const passwordEncrypt = SHA256(req.body.passwordFromFront + user.salt).toString(encBase64)

      if(passwordEncrypt == user.password){
        result = true
        token = user.token
      } else {
        result = false
        error.push('mot de passe incorrect')
      }
      
    } else {
      error.push('email incorrect')
    }
  }
  

  res.json({result, user, error, token})


})

// FETCH NEWS SOURCE

router.post('/source', async function(req, res, next) {
  
  var langue = req.body.langueFromFront;
  var country = req.body.countryFromFront;

  var data = request("GET", `https://newsapi.org/v2/sources?language=${langue}&country=${country}&apiKey=${process.env.API_KEY}`);
  data = JSON.parse(data.getBody());
  var result = data.sources;
  
  res.json(result);
});


// FETCH NEWS ARTICLES

router.post('/articles', async function(req, res, next) {
  
  var sources = req.body.sourcesFromFront;
  
  var data = request("GET", `https://newsapi.org/v2/top-headlines?sources=${sources}&apiKey=${process.env.API_KEY}`);
  data = JSON.parse(data.getBody());
  var result = data.articles;
  
  res.json(result);
});


// ADD TO WISHLIST

router.post('/wishlist-article', async function(req, res, next) {

 
  var user = await userModel.findOne({token: req.body.token});

  if(user !=null ) {

    var newArticle = new articleModel ({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      img:req.body.img,
    });
    var articleSaved = await newArticle.save();
   
    // user.articles.push(articleSaved._id);
    // var userPopulate = await userModel.find({token: req.body.token}).populate('articles').exec();
  
    var result = false; 
    if(articleSaved.title){ 
      result = true;
    } 

  }
  res.json({result});
});

// SHOW WISHLIST

router.get('/wishlist-article', async function(req, res, next) {
  var wishlist = await articleModel.find();
  var result = false; 
  if(wishlist){ 
    result = true;
  } 
  res.json({result, wishlist});
});

// DELETE ARTICLE FROM WISHLIST

router.delete('/wishlist-article/:title', async function(req, res, next) {
  var returnDb = await articleModel.deleteOne({ title: req.params.title})
  var result = false
  if(returnDb.deletedCount == 1){
    result = true
  }
  res.json({result})
});


// SAVED LANG
router.post('/saved-langue', async function(req, res, next ){
  var newLangue = await UserModel.updateOne(
    { token: req.body.TokenFromFront},
    { country: req.body.CountryFromFront,
      langue: req.body.LangueFromFront }
 
 );

var langueSaved= await newLangue.save()
var result = false 
if(langueSaved){
  result = true;
}
res.json({result});
})

module.exports = router;
