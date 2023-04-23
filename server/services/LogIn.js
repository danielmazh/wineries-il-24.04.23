const jwt = require('jsonwebtoken');
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./server/SQL/wineries.db");
const bcrypt = require('bcrypt');

function loginUser(email, password) {
  const query = `SELECT * FROM users WHERE email = '${email}'`;

  return new Promise((resolve, reject) => {
    db.get(query, async (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      if (!row) {
        console.log(`No user found with email ${email}`);
        resolve(null);
        return;
      }

      if (row.email_verified === 0) {
        console.log(`Email not verified for user ${row.id}`);
        resolve({ emailNotVerified: true });
        return;
      }
      
      
      const isPasswordMatch = await bcrypt.compare(password, row.password);

      if (!isPasswordMatch) {
        console.log(`Password does not match for user ${row.id}`);
        resolve(null);
        return;
      }

      console.log(`Logged in user ${row.id}. Email: ${row.email} Username: ${row.username}`);
      const user = {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
      };
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      resolve({ token, first_name: row.first_name, last_name: row.last_name, username: row.username });
    });
  });
}



module.exports = {
  loginUser,
};


