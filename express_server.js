const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

function generateRandomString() {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomURL = '';
  for (let i = 0; i < 5; i++) {
    randomURL += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return randomURL;
}


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  res.statusCode = 200;
  const newShortURL = generateRandomString(urlDatabase);
  // console.log(newShortURL);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  // let longURL;
  if(!urlDatabase[req.params.shortURL]) {
    res.statusCode = 400;
    return res.send("The page you have requested does not exist. Please check to make sure you've entered the correct Tiny URL and try again :)");
  }
  res.redirect(longURL);
});

// app.get("/u/:shortURL", (req, res) => {
//   // const longURL = ...
//   res.redirect(longURL);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
