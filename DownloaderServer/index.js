
const puppeteer = require('puppeteer');
// const gm = require('gm');
// const fs = require('fs');

//load config
const config = require('./config');

//load and connect to mongodb db
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass +
'@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority');

//create schema for saving urls
var urlShema = mongoose.Schema({
 url: String,
 hash: String,
 suffix: Number,
 imgLink: String,
 downloaded: Boolean,
 assigned: Boolean,
 downloader: String,
 downloadStartTime: Number
});
var UrlModel = mongoose.model("UrlModel", urlShema);

//function to find and start downloads for new screenshots
async function findDownload(UrlModel, identifier){
  //boolean indicating if function needs to be restarted
  var restart = true;
  console.log('thread ' + identifier + ' looking for new download');
  //prevent stack overflow
  await Promise.resolve();

  //will find all websites that still need their screenshts downloaded
  UrlModel.find({downloaded: false, assigned: false},
    function(err, response){
      //deal with errors
      if(err){
        console.log(result);
        return console.error(err);
      }

      console.log(response.length + ' potential websites found');

      //return if there are no websites that need screenshots
      if (response.length !=0){

        //for now we will just use the top result but later we will build better
        //rankng system for which screnshots to download first
        var urlToDownload = response[0];
        console.log('starting download for ' + urlToDownload.url);

        //set us as the downloader for this url
        UrlModel.update({_id: urlToDownload._id},
          {
            assigned: true,
            downloader: config.serverName,
            downloadStartTime: new Date().getTime()
          }, async function(err, response){
              if(err){
                console.log(result);
                return console.error(err);
              }

              //download the screenshot
              await downloadScreenshot(urlToDownload.url,
                urlToDownload.imgLink);

              //update database to signify that download has finnished
              UrlModel.update({_id: urlToDownload._id}, {downloaded: true}, function(err, response){
                if(err){
                  console.log(resut);
                  return console.error(err);
                }
              });
          })
      }
    })

  //after finnished wait for min number of seconds and then search for next ss to be downloaded
  if (restart) setTimeout(function(){findDownload(UrlModel, identifier)}, 10000);
}


//downloads screenshot for specified url into image link
async function downloadScreenshot(url, imgLink){
  console.log('starting download of ' + imgLink);
  //start browser
  const browser = await puppeteer.launch({ executablePath: "./node_modules/puppeteer/.local-chromium/win64-686378/chrome-win/chrome.exe"});
  //make a new page
  const page = await browser.newPage();
  //make page bigger
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });
  //go to url
  await page.goto(url);
  //git the page 1 second to load before taking screenshot
  setTimeout(async function(){
    page.screenshot({path: imgLink, type: 'jpeg',
    quality: config.screenshotQuality}).then(() => {
      browser.close();
      console.log('finished download of ' + url);
    });
  }, 1000);
}


//start specified number of threads
for (var i = 0; i < config.threads; i++){
  console.log('starting thread ' + i);
  //offset the start of each thread so that they are less likely to download the same url
  setTimeout(() => {findDownload(UrlModel, i)}, 100 * i);
}
console.log('all threads started!');
