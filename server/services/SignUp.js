const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./server/SQL/wineries.db");
const config = require('../config');
// require('dotenv').config();


const crypto = require('crypto');
const nodemailer = require('nodemailer');


function signUp(username, email, password, firstName, lastName) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        // Email already exists in database
        reject(new Error("כתובת המייל כבר נמצאת בשימוש"));
      } else {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            // Username already exists in database
            reject(new Error("שם משתמש כבר נמצא בשימוש"));
          } else {
            bcrypt.hash(password, 10, function (err, hash) {
              if (err) {
                reject(err);
              } else {
                db.run(
                  "INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
                  [username, email, hash, firstName, lastName],
                  function(err) { 
                    if (err) {
                      reject(err);
                    } else {
                      const userId = this.lastID;
                      const token = generateToken();
                      const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
                      const expiresAt = new Date(Date.now() + expiresIn);
                 
                      db.run(
                        "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
                        [userId, token, expiresAt.toISOString()],
                        (err) => {
                          if (err) {
                            reject(err);
                          } else {
                            // Send the email with the token
                            sendVerificationEmail(email, token)
                              .then(() => {
                                resolve({ username, email, firstName, lastName });
                              })
                              .catch((err) => {
                                reject(err);
                              });
                          }
                        }
                      );
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  });
}



function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}



async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'earful2357@gmail.com', 
      // pass: 'PE5GobbpNZKHpg', 
      pass: 'wppmlzlemkqfhmma'

    },
    tls: {
      rejectUnauthorized: false,
    },
    // e.g. Gmail: https://nodemailer.com/usage/using-gmail/
  });

  const verificationLink = `${config.siteUrl}/verify-email/${token}`;
  // http://localhost:3000/verify-email/${token}

  const mailOptions = {
    from: '"wineries-il" <earful2357@gmail.com>',
    to: email,
    subject: 'Wineries-IL - אימות כתובת דוא"ל',
    html: `<div style="text-align: center;">
            <a href="${verificationLink}" style="background-color: #CD5C5C; border: none; font-size: 28px; color: #FFFFFF; padding: 10px; width: 200px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">אימות משתמש</a>
          </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  signUp,
};

