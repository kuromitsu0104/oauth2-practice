app.post("/approve", function (req, res) {
  var reqid = req.body.reqid
  var query = requests[reqid]
  delete requests[reqid]
  if (!query) {
    res.render("error", { error: "No matching authorization request" })
    return
  }
  if (req.body.approve) {
    if (query.response_type == "code") {
      var code = randomstring.generate(8)
      codes[code] = { request: query }
      var urlParsed = buildUrl(query.redirect_uri, {
        code: code,
        state: query.state,
      })
      res.redirect(urlParsed)
      return
    } else {
      var urlParsed = buildUrl(query.redirect_uri, {
        error: "unsupported_response_type",
      })
      res.redirect(urlParsed)
      return
    }
  } else {
    var urlParsed = buildUrl(query.redirect_uri, {
      error: "access_denied",
    })
    res.redirect(urlParsed)
    return
  }
})
