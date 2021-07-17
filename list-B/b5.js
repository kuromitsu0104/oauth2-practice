var getAccessToken = function (req, res, next) {
  var inToken = null
  var auth = req.headers["authorization"]
  if (auth && auth.toLowerCase().indexOf("bearer") == 0) {
    inToken = auth.slice("bearer ".length)
  } else if (req.body && req.body.access_token) {
    inToken = req.body.access_token
  } else if (req.query && req.query.access_token) {
    inToken = req.query.access_token
  }
}
