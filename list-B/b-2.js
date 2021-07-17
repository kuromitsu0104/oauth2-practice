app.get("/callback", function (req, res) {
  if (req.query.error) {
    res.render("error", { error: req.query.error })
    return
  }

  if (req.query.state != state) {
    console.log(
      "State DOES NOT MATCH: expected %s got %s",
      state,
      req.query.state
    )
    res.render("error", { error: "State value did not match" })
    return
  }

  var code = req.query.code

  var form_data = qs.stringify({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: client.redirect_uris[0],
  })

  var headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      encodeClientCredentials(client.client_id, client.client_secret),
  }

  var tokRes = request("POST", authServer.tokenEndpoint, {
    body: form_data,
    headers: headers,
  })

  console.log("Requesting access token for code %s", code)

  if (tokRes.statusCode >= 200 && tokRes.statusCode < 300) {
    var body = JSON.parse(tokRes.getBody())
    access_token = body.access_token
    console.log("Got access token: %s", access_token)
    res.render("index", {
      access_token: access_token,
      scope: scope,
    })
  } else {
    res.render("error", {
      error:
        "Unable to fetch access token, serverresponse: " + tokRes.statusCode,
    })
  }
})
