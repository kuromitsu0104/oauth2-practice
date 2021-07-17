var getAccessToken = function (req, res, next) {
  var auth = req.headers["authorization"]
  var inToken = null
  if (auth && auth.toLowerCase().indexOf("pop") == 0) {
    inToken = auth.slice("pop ".length)
  } else if (req.body && req.body.pop_access_token) {
    inToken = req.body.pop_access_token
  } else if (req.query && req.query.pop_access_token) {
    inToken = req.query.pop_access_token
  }
  console.log("Incoming PoP: %s", inToken)
  var tokenParts = inToken.split(".")
  var header = JSON.parse(base64url.decode(tokenParts[0]))
  var payload = JSON.parse(base64url.decode(tokenParts[1]))
  console.log("Payload", payload)
  var at = payload.at
  console.log("Incmoing access token: %s", at)
  var form_data = qs.stringify({ token: at })
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      encodeClientCredentials(
        protectedResource.resource_id,
        protectedResource.resource_secret
      ),
  }
  var tokRes = request("POST", authServer.introspectionEndpoint, {
    body: form_data,
    headers: headers,
  })
  if (tokRes.statusCode >= 200 && tokRes.statusCode < 300) {
    var body = JSON.parse(tokRes.getBody())
    console.log("Got introspection response", body)
    var active = body.active
    if (active) {
      var pubKey = jose.KEYUTIL.getKey(body.access_token_key)
      if (jose.jws.JWS.verify(inToken, pubKey, [header.alg])) {
        console.log("Signature is valid")
        if (!payload.m || payload.m == req.method) {
          if (!payload.u || payload.u == "localhost:9002") {
            if (!payload.p || payload.p == req.path) {
              console.log("All components matched")
              req.access_token = { access_token: at, scope: body.scope }
            }
          }
        }
      }
    }
  }
  next()
  return
}
