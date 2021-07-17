app.get("/fetch_resource", function (req, res) {
  if (!access_token) {
    res.render("error", { error: "Missing Access Token" })
  }

  console.log("Making request with access token %s", access_token)

  var headers = {
    Authorization: "Bearer " + access_token,
  }

  var resource = request("POST", protectedResource, {
    headers: headers,
  })

  if (resource.statusCode >= 200 && resource.statusCode < 300) {
    var body = JSON.parse(resource.getBody())
    res.render("data", { resource: body })
    return
  } else {
    access_token = null
    res.render("error", { error: resource.statusCode })
    return
  }
})
