import { encryptText, decryptText, getPublicKey } from './encrypt.js';
import express, { json, urlencoded } from 'express';
const app = express();
const port = 8080;

app.use(json())
app.use(urlencoded({ extended: true }))
app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})

app.get("/login",(request, response) => {
  response.send(getPublicKey());
});


app.post("/login",(request, response) => {
  const decryptedText = decryptText(request.body.data)
  var loginData = JSON.parse(decryptedText);
  //TODO: data checking here
  var ticket = {
    "token": "123",
    "username": loginData.username,
    "time": Date.now(),
  }
  console.log(ticket);
  var encryptedTextRes = encryptText(JSON.stringify(ticket),request.body.publickey);
  response.send(encryptedTextRes.toString());
});


