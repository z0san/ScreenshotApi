var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
  imgUrl: String,
  url: String,
  fileName: String,
  assignmentId: mongoose.Types.ObjectId,
  img:
  {
      data: Buffer,
      contentType: String
  }
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);
