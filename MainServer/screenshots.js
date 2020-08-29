var express = require('express');
// var fs = require('fs');
var router = express.Router();
var crypto = require('crypto');

//using md5 hash to make image files faster to find and shorter names also acts as a rudimentary hash set

//load config
const config = require('./config');

//load and connect to mongodb db
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass +
'@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority');

//load schemas
var UrlModel = require('./models/urlShema');
var ImgModel = require('./models/imageSchema');


//handels search for url screenshot
router.get('/', function(req, res){

  var url = req.param('url');

  console.log('download request for: ' + url);

  //allow this to come from any url
  res.header("Access-Control-Allow-Origin", "*");

  //find if already in db
  ImgModel.find({url: url},
   function(err, response){
     //deal with errors
     if(err){
       console.log(result);
       return console.error(err);
     }

     //test to see if there are any results for required url
     if(response.length == 0){
       //adds url to db
       if(!url){ //needs to make sure it's a valid url
           res.status(400); //set code to9 400 for bad request
           res.json({message: "invalid url"});
        } else {
          //if it is a valid url and we don't currently have an image for it we
          //need to first see if it is already assigned

          imageDownloading(url, function(err, response, isDownloading){

            if(isDownloading){ //if the image is currently being donwloaded
              res.status(204);
              res.json({message: "currently being downloaded"});
            } else { //if the image has not been scheduled for donwload yet

              //stores the hash of the url for faster file managment
              var hash = crypto.createHash('md5').update(url).digest("hex");

              //call save new url funciton to create a new entry for this url
              saveNewUrl(UrlModel, url, hash, function(err, response){
                res.status(204);
                res.json({message: "currently being downloaded"});
              });
            }
          })
        }
     }else{ //if there is already an entry in db for specified url send url
       res.status(200); //set status 200 for image successfully found
       //console.log(response[0]);
       var img = new Buffer(response[0].img.data).toString('base64');
       res.json({
         url: response[0].url,
         fileName: response[0].fileName,
         img: {
           base64: img,
           contentType: response[0].img.contentType
         }
       });
     }
  });

});


//Routes will go here
module.exports = router;


//function to save new url entry
function saveNewUrl(UrlModel, url, hash, callback){
  getSuffix(UrlModel, hash, function(err, response, suffix){
    var newUrl = new UrlModel({
       url: url,
       hash: hash,
       suffix: suffix,
       imgLink: "screenshots/" + hash + suffix.toString() + ".jpg",
       fileName: hash + suffix.toString() + ".jpg",
       downloaded: false,
       assigned: false,
       downloader: null,
       downloadStartTime: null
    });

    newUrl.save(function(err, Person){
       if(err)
          return ("Database error:  " + type);
       else
        callback(err, response);
    });
  })
}

//function to check for hash collisions and come up with suffix to fix this problem
function getSuffix(UrlModel, hash, callback){
  var suffix = 0;
  UrlModel.find({hash: hash}, function(err, response){
    suffix = response.length; //this will always return the next int for a suffix with common hash
    //console.log('response length: ' + suffix);
    callback(err, response, suffix);
  });
}


//function to return bool as to whether or not image is currenlty being downloaded
function imageDownloading(url, callback){
  //find if already in db
  ImgModel.find({url: url},
   function(err, response){
     //deal with errors
     if(err){
       console.log(result);
       return console.error(err);
     }

     //test to see if there are any results for required url
     if(response.length == 0){ //if no results call the callback with false
       callback(err, response, false);
     }else { //if there are results then call teh callback with true
       callback(err, response, true);
     }
   });
}
