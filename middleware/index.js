var middleware = {};

middleware.isLoggedIn = function(req, res, next) {

  if (req.isAuthenticated()) {
    return next();
  }
  console.log("Error: you need to be logged in to do that.");
  res.redirect("/login");

}

module.exports = middleware;
