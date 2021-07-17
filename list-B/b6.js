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
  console.log("Incoming token: %s", inToken)
  nosql.one(
    function (token) {
      if (token.access_token == inToken) {
        return token
      }
    },
    function (err, token) {
      if (token) {
        console.log("We found a matching token: %s", inToken)
      } else {
        console.log("No matching token was found.")
      }
      req.access_token = token
      next()
      return
    }
  )
}
