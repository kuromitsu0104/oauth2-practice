} else if (req.body.grant_type == "refresh_token") {
  nosql.one(
    function (token) {
      if (token.refresh_token == req.body.refresh_token) {
        return token
      }
    },
    function (err, token) {
      if (token) {
        console.log(
          "We found a matching refresh token: %s",
          req.body.refresh_token
        )
        if (token.client_id != clientId) {
          nosql.remove(
            function (found) {
              return found == token
            },
            function () {}
          )
          res.status(400).json({ error: "invalid_grant" })
          return
        }
        var access_token = randomstring.generate()
        nosql.insert({
          access_token: access_token,
          client_id: clientId,
        })
        var token_response = {
          access_token: access_token,
          token_type: "Bearer",
          refresh_token: token.refresh_token,
        }
        res.status(200).json(token_response)
        return
      } else {
        console.log("No matching token was found.")
        res.status(400).json({ error: "invalid_grant" })
        return
      }
    }
  )
}
