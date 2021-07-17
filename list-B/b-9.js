app.post("/token", function (req, res) {
  var auth = req.headers["authorization"]

  if (auth) {
    var clientCredentials = decodeClientCredentials(auth)
    var clientId = clientCredentials.id
    var clientSecret = clientCredentials.secret
  }

  if (req.body.client_id) {
    if (clientId) {
      console.log("Client attempted to authenticate with multiple methods")
      res.status(401).json({ error: "invalid_client" })
      return
    }

    var clientId = req.body.client_id
    var clientSecret = req.body.client_secret
  }

  var client = getClient(clientId)

  if (!client) {
    console.log("Unknown client %s", clientId)
    res.status(401).json({ error: "invalid_client" })
    return
  }

  if (client.client_secret != clientSecret) {
    console.log(
      "Mismatched client secret, expected %s got %s",
      client.client_secret,
      clientSecret
    )
    res.status(401).json({ error: "invalid_client" })
    return
  }

  if (req.body.grant_type == "authorization_code") {
    var code = codes[req.body.code]

    if (code) {
      delete codes[req.body.code] // burn our code, it's been used
      if (code.request.client_id == clientId) {
        var access_token = randomstring.generate()
        nosql.insert({
          access_token: access_token,
          client_id: clientId,
        })
        console.log("Issuing access token %s", access_token)
        var token_response = {
          access_token: access_token,
          token_type: "Bearer",
        }
        res.status(200).json(token_response)
        console.log("Issued tokens for code %s", req.body.code)
        return
      } else {
        console.log(
          "Client mismatch, expected %s got %s",
          code.request.client_id,
          clientId
        )
        res.status(400).json({ error: "invalid_grant" })
        return
      }
    } else {
      console.log("Unknown code, %s", req.body.code)
      res.status(400).json({ error: "invalid_grant" })
      return
    }
  } else {
    console.log("Unknown grant type %s", req.body.grant_type)
    res.status(400).json({ error: "unsupported_grant_type" })
  }
})
