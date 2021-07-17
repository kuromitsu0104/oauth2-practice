app.get("/authorize", function (req, res) {
  var client = getClient(req.query.client_id)
  if (!client) {
    console.log("Unknown client %s", req.query.client_id)
    res.render("error", { error: "Unknown client" })
    return
  } else if (!__.contains(client.redirect_uris, req.query.redirect_uri)) {
    console.log(
      "Mismatched redirect URI, expected %s got %s",
      client.redirect_uris,
      req.query.redirect_uri
    )
    res.render("error", { error: "Invalid redirect URI" })
    return
  } else {
    var reqid = randomstring.generate(8)
    requests[reqid] = req.query
    res.render("approve", { client: client, reqid: reqid })
    return
  }
})
