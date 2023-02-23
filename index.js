import { encryptText, decryptText } from './encrypt.js';
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
app.get('/', (request, response) => {
  const plainText = "simple text";
  const encryptedText = encryptText(plainText)
  console.log('encrypted text: ', encryptedText.toString('base64'))
  const decryptedText = decryptText(encryptedText)
  console.log('decrypted text:', decryptedText.toString())
  response.send(decryptedText.toString())
});

app.post("/login",(request, response) => {
  const encryptedText = encryptText(request.body.pass)
  console.log('encrypted text: ', encryptedText.toString('base64'))
  const decryptedText = decryptText(encryptedText)
  console.log('decrypted text:', decryptedText.toString())
  response.send(decryptedText.toString())
});


