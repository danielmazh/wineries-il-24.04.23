const dotenv = require('dotenv');
dotenv.config();

module.exports = {
   JWT_SECRET: process.env.JWT_SECRET,
   siteUrl: "http://localhost:3000",

};
