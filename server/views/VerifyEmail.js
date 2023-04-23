const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./server/SQL/wineries.db");

function verifyEmail(req, res, next) {
  const token = req.params.token;

  db.get("SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > ?", [token, new Date().toISOString()], (err, row) => {
    if (err) {
      next(err);
    } else if (!row) {
      res.status(400).send("האימות נכשל, נסו שוב");
    } else {
      db.run("UPDATE users SET email_verified = 1 WHERE id = ?", [row.user_id], (err) => {
        if (err) {
          next(err);
        } else {
          // Delete the used token from the email_verification_tokens table
          db.run("DELETE FROM email_verification_tokens WHERE token = ?", [token], (err) => {
            if (err) {
              next(err);
            } else {
              res.send("המייל אומת בהצלחה, ניתן לסגור חלון זה");
            }
          });
        }
      });
    }
  });
}

module.exports = {
  verifyEmail,
};
