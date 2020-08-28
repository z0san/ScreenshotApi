var mongoose = require('mongoose')

var fs = require('fs');
var path = require('path');

var ImgModel = require('./models/imageSchema');

//load config
const config = require('./config');

//load and connect to mongodb db
mongoose.connect('mongodb+srv://' + config.dbUser + ':' + config.dbPass +
'@cluster0.0czcr.mongodb.net/' + config.dbName + '?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });


function uploadImg(imgUrl, fileName, url, assignmentId){
  if(imgUrl && fileName && url && assignmentId){
    console.log('starting upload of ' + url);
    var obj = {
      imgUrl: imgUrl,
      url: url,
      fileName: fileName,
      assignmentId: assignmentId,
      img:
      {
          data: fs.readFileSync(path.join(imgUrl)),
          contentType: 'image/jpg'
      }
    }

    ImgModel.create(obj, (err, response) => {
      if (err) {
           console.log('error \n' + err);
       }
       else {
           // item.save();
           console.log(url + ' has been successfully uploaded');
       }
    })

  }else {
    console.log('incorrect parameters given');
    return null;
  }
}


module.exports = {
  uploadImg
};
