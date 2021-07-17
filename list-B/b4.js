app.get("/fetch_resource", function (req, res) {
  console.log("Making request with access token %s", access_token)
  var headers = {
    Authorization: "Bearer " + access_token,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  var resource = request("POST", protectedResource, { headers: headers })
  if (resource.statusCode >= 200 && resource.statusCode < 300) {
    var body = JSON.parse(resource.getBody())
    res.render("data", { resource: body })
    return
  } else {
    access_token = null
    if (refresh_token) {
      refreshAccessToken(req, res)
      return
    } else {
      res.render("error", { error: resource.statusCode })
      return
    }
  }
})
var refreshAccessToken = function (req, res) {
  var form_data = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  })
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      encodeClientCredentials(client.client_id, client.client_secret),
  }
  console.log("Refreshing token %s", refresh_token)
  var tokRes = request("POST", authServer.tokenEndpoint, {
    body: form_data,
    headers: headers,
  })
  if (tokRes.statusCode >= 200 && tokRes.statusCode < 300) {
    var body = JSON.parse(tokRes.getBody())
    access_token = body.access_token
    console.log("Got access token: %s", access_token)
    if (body.refresh_token) {
      refresh_token = body.refresh_token
      console.log("Got refresh token: %s", refresh_token)
    }
    scope = body.scope
    console.log("Got scope: %s", scope)
    res.redirect("/fetch_resource")
    return
  } else {
    console.log("No refresh token, asking the user to get a new access token")
    refresh_token = null
    res.render("error", { error: "Unable to refresh token." })
    return
  }
}
