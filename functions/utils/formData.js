const { admin, db } = require('./admin');

const config = require('./config');

// Upload a profile image for user
exports.getFormData = (req, callback ) => {

    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
  
    const busboy = new BusBoy({ headers: req.headers });

    let formData = {};
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

      let imageS3FileName;

      console.log(fieldname, file, filename, encoding, mimetype);
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return callback({ error: 'Wrong file type submitted' });
      }
      // my.image.png => ['my', 'image', 'png']
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      // 32756238461724837.png
      imageS3FileName = `${Math.round(
        Math.random() * 1000000000000
      ).toString()}.${imageExtension}`;

      const filepath = path.join(os.tmpdir(), imageS3FileName);
      file.pipe(fs.createWriteStream(filepath));

      const fileInfo = { filepath, mimetype, filename, imageS3FileName };

      formData[fieldname] = fileInfo;
      
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log(fieldname  + ' : ' + val);
      formData[fieldname] = val;
    });

    busboy.on('finish', () => {

      console.log(formData);
      return callback(formData);
      
    });
    busboy.end(req.rawBody);
  };
  
  exports.uploadImage = (imageToBeUploaded ) => {

   return admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
            config.storageBucket
          }/o/${imageToBeUploaded.imageS3FileName}?alt=media`;

          imageToBeUploaded.imageUrl = imageUrl;
          return imageToBeUploaded;
        })
        .catch((err) => {
          console.error(err);
          imageToBeUploaded.error = 'something went wrong';
          return imageToBeUploaded;
        });

  };