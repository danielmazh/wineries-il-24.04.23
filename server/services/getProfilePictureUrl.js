// const express = require('express');
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../config');
// const path = require('path');
// const fs = require('fs');

// const router = express.Router();

// router.get('/getProfilePictureUrl', (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).send('No authorization header provided');
//   }

//   const token = authHeader.split(' ')[1];
//   let decodedToken;

//   try {
//     decodedToken = jwt.verify(token, JWT_SECRET);
//   } catch (err) {
//     return res.status(401).send('Invalid token');
//   }

//   const userId = decodedToken.userId;

//   const profilePicturePath = path.join(__dirname, '../../client/src/assets/profile/userProfile');
//   const profilePictureFilename = `profilePicture-${userId}.png`; // Assuming the uploaded image is always a PNG file.
//   const profilePictureFilePath = path.join(profilePicturePath, profilePictureFilename);

//   // Check if the profile picture file exists
//   fs.access(profilePictureFilePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       // File does not exist
//       return res.json({ url: null });
//     } else {
//       // File exists
//       const profilePictureUrl = `/userProfile/${profilePictureFilename}`;
//       res.json({ url: profilePictureUrl });
//     }
//   });
// });

// module.exports = router;



const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/getProfilePictureUrl', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('No authorization header provided');
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).send('Invalid token');
  }

  const userId = decodedToken.userId;
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif']; // Add more extensions if needed
  const profilePicturePath = path.join(__dirname, '../../client/src/assets/profile/userProfile');

  // Find the first matching file with an allowed extension
  const findProfilePicture = (extensions) => {
    if (extensions.length === 0) {
      return res.json({ url: null });
    }

    const currentExtension = extensions[0];
    const profilePictureFilename = `profilePicture-${userId}${currentExtension}`;
    const profilePictureFilePath = path.join(profilePicturePath, profilePictureFilename);

    fs.access(profilePictureFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist, try the next extension
        findProfilePicture(extensions.slice(1));
      } else {
        // File exists
        const profilePictureUrl = `/userProfile/${profilePictureFilename}`;
        res.json({ url: profilePictureUrl });
      }
    });
  };

  findProfilePicture(allowedExtensions);
});

module.exports = router;

