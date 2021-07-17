app.post("/register", function (req, res) {
  var reg = {}
  if (!req.body.token_endpoint_auth_method) {
    reg.token_endpoint_auth_method = "secret_basic"
  } else {
    reg.token_endpoint_auth_method = req.body.token_endpoint_auth_method
  }
  if (
    !__.contains(
      ["secret_basic", "secret_post", "none"],
      reg.token_endpoint_auth_method
    )
  ) {
    res.status(400).json({ error: "invalid_client_metadata" })
    return
  }
  if (!req.body.grant_types) {
    if (!req.body.response_types) {
      reg.grant_types = ["authorization_code"]
      reg.response_types = ["code"]
    } else {
      reg.response_types = req.body.response_types
      if (__.contains(req.body.response_types, "code")) {
        reg.grant_types = ["authorization_code"]
      } else {
        reg.grant_types = []
      }
    }
  } else {
    if (!req.body.response_types) {
      reg.grant_types = req.body.grant_types
      if (__.contains(req.body.grant_types, "authorization_code")) {
        reg.response_types = ["code"]
      } else {
        reg.response_types = []
      }
    } else {
      reg.grant_types = req.body.grant_types
      reg.reponse_types = req.body.response_types
      if (
        __.contains(req.body.grant_types, "authorization_code") &&
        !__.contains(req.body.response_types, "code")
      ) {
        reg.response_types.push("code")
      }
      if (
        !__.contains(req.body.grant_types, "authorization_code") &&
        __.contains(req.body.response_types, "code")
      ) {
        reg.grant_types.push("authorization_code")
      }
    }
  }
  if (
    !__.isEmpty(
      __.without(reg.grant_types, "authorization_code", "refresh_token")
    ) ||
    !__.isEmpty(__.without(reg.response_types, "code"))
  ) {
    res.status(400).json({ error: "invalid_client_metadata" })
    return
  }

  if (
    !req.body.redirect_uris ||
    !__.isArray(req.body.redirect_uris) ||
    __.isEmpty(req.body.redirect_uris)
  ) {
    res.status(400).json({ error: "invalid_redirect_uri" })
    return
  } else {
    reg.redirect_uris = req.body.redirect_uris
  }

  if (typeof req.body.client_name == "string") {
    reg.client_name = req.body.client_name
  }

  if (typeof req.body.client_uri == "string") {
    reg.client_uri = req.body.client_uri
  }

  if (typeof req.body.logo_uri == "string") {
    reg.logo_uri = req.body.logo_uri
  }

  if (typeof req.body.scope == "string") {
    reg.scope = req.body.scope
  }

  reg.client_id = randomstring.generate()

  if (
    (__.contains(["client_secret_basic", "client_secret_post"]),
    reg.token_endpoint_auth_method)
  ) {
    reg.client_secret = randomstring.generate()
  }

  reg.client_id_created_at = Math.floor(Date.now() / 1000)
  reg.client_secret_expires_at = 0

  clients.push(reg)

  res.status(201).json(reg)
  return
})
