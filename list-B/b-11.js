app.post("/introspect", function (req, res) {
  var auth = req.headers["authorization"]
  var resourceCredentials = decodeClientCredentials(auth)
  var resourceId = resourceCredentials.id
  var resourceSecret = resourceCredentials.secret
  var resource = getProtectedResource(resourceId)
  if (!resource) {
    console.log("Unknown resource %s", resourceId)
    res.status(401).end()
    return
  }
  if (resource.resource_secret != resourceSecret) {
    console.log(
      "Mismatched secret, expected %s got %s",
      resource.resource_secret,
      resourceSecret
    )
    res.status(401).end()
    return
  }
  var inToken = req.body.token
  console.log("Introspecting token %s", inToken)
  nosql.one(
    function (token) {
      if (token.access_token == inToken) {
        return token
      }
    },
    function (err, token) {
      if (token) {
        console.log("We found a matching token: %s", inToken)
        var introspectionResponse = {
          active: true,
          iss: "http://localhost:9001/",
          aud: "http://localhost:9002/",
          sub: token.user ? token.user.sub : undefined,
          username: token.user ? token.user.preferred_username : undefined,
          scope: token.scope ? token.scope.join(" ") : undefined,
          client_id: token.client_id,
        }
        res.status(200).json(introspectionResponse)
        return
      } else {
        console.log("No matching token was found.")
        var introspectionResponse = { active: false }
        res.status(200).json(introspectionResponse)
        return
      }
    }
  )
})
