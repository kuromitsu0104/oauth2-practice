app.get("/authorize", function (req, res) {
  access_token = null
  state = randomstring.generate()

  var authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
    response_type: "code",
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    state: state,
  })

  console.log("redirect", authorizeUrl)
  res.redirect(authorizeUrl)
})
