if (body.id_token) {
  userInfo = null
  id_token = null
  console.log("Got ID token: %s", body.id_token)
  var pubKey = jose.KEYUTIL.getKey(rsaKey)
  var tokenParts = body.id_token.split(".")
  var payload = JSON.parse(base64url.decode(tokenParts[1]))
  console.log("Payload", payload)
  if (jose.jws.JWS.verify(body.id_token, pubKey, [rsaKey.alg])) {
    console.log("Signature validated.")
    if (payload.iss == "http://localhost:9001/") {
      console.log("issuer OK")
      if (
        (Array.isArray(payload.aud) &&
          __.contains(payload.aud, client.client_id)) ||
        payload.aud == client.client_id
      ) {
        console.log("Audience OK")
        var now = Math.floor(Date.now() / 1000)
        if (payload.iat <= now) {
          console.log("issued-at OK")
          if (payload.exp >= now) {
            console.log("expiration OK")
            console.log("Token valid!")
            id_token = payload
          }
        }
      }
    }
  }
  res.render("userinfo", { userInfo: userInfo, id_token: id_token })
  return
}
