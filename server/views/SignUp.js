const signUpService = require("../services/SignUp");

function signUp(req, res, next) {
  const { username, email, password, firstName, lastName } = req.body;

  signUpService.signUp(username, email, password, firstName, lastName)
    .then((user) => {
      res.send(`User ${user.username} signed up successfully`);
    })
    .catch((err) => {
      if (err.message === "כתובת המייל כבר נמצאת בשימוש" || err.message === "שם משתמש כבר נמצא בשימוש") {
        res.status(400).send(err.message);
      } else {
        next(err);
      }
    });
}

module.exports = {
  signUp,
};
