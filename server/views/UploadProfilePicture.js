const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // cb(null, path.join(__dirname, '../client/src/assets/profile/userProfile'));
      cb(null, path.join(__dirname, '../../client/src/assets/profile/userProfile'));

    },
    filename: (req, file, cb) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return cb(new Error('No authorization header provided'));
      }
  
      const token = authHeader.split(' ')[1];
      let decodedToken;
  
      try {
        decodedToken = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decodedToken); 
      } catch (err) {
        return cb(new Error('Invalid token'));
      }
  
      const userId = decodedToken.userId;
      cb(null, `profilePicture-${userId}${path.extname(file.originalname)}`);
    },
  });

const upload = multer({ storage });

function uploadProfilePicture(req, res, next) {
  const uploader = upload.single('profilePicture');

  uploader(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading file');
    }

    res.status(200).send('File uploaded successfully');
  });
}

module.exports = {
  uploadProfilePicture,
};