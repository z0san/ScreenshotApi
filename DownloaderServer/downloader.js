const puppeteer = require('puppeteer');
//load config
const config = require('./config');
//connect uploader
var uploader = require('./uploader');


//load and connect to mongodb db
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass +
'@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });

//get url model
UrlModel = require('./models/urlShema');





//function to find and start downloads for new screenshots
async function findDownload(UrlModel, identifier){
  //await identifier;
  //console.log('thread ' + identifier + ' looking for new download');
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

      if (response.length == 0){
        //console.log('no potential websites found');
          //after finnished wait for min number of seconds and then search for next ss to be downloaded
        setTimeout(function(){findDownload(UrlModel, identifier);}, 500);
        return;
      }

      //return if there are no websites that need screenshots
      if (response.length !=0){
        console.log(response.length + ' potential websites found');
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
                urlToDownload.imgLink, urlToDownload.fileName,
                urlToDownload._id).then(() => {
                  //after finnished look for another website to download
                  findDownload(UrlModel, identifier);
                });

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


}


//downloads screenshot for specified url into image link
async function downloadScreenshot(url, imgLink, fileName, assignmentId){
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
  await setTimeout(async function(){
    page.screenshot({path: imgLink, type: 'jpeg',
    quality: config.screenshotQuality}).then(() => {
      //close browser
      //maybe later have better tracking of browsers so they don't need to be
      //started and stoped so frequently
      browser.close();
      console.log('finished download of ' + url );
      //now upload the image we just downloaded
      uploader.uploadImg(imgLink, fileName, url, assignmentId);

    });
  }, 1000);
}


module.exports = {
  findDownload
};
