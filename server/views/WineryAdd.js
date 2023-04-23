const addWineryService = require("../services/WineryAdd");
const multer = require('multer');
const path = require('path');


// ***********************************************************
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/src/assets/winery-logo'));
  },
  filename: (req, file, cb) => {
    const wineryID = req.params.wineryID;
    cb(null, `winery-${wineryID}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });
function uploadWineryLogo(req, res) {
  res.sendStatus(200);
}

// ***********************************************************


async function addWinery(req, res) {
  const wineryData = req.body;

  try {
    const wineryID = await addWineryService.addWinery(wineryData);
    console.log(wineryData);
    res.status(200).json({ winery_ID: wineryID }); // send the winery_ID in the response
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding winery");
  }
}

module.exports = {
  addWinery,
  uploadWineryLogo,
  upload
};
