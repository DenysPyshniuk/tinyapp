const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



/** Function to generate new random 6 digit string short URL */
function generateRandomString() {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomURL = '';
  for (let i = 0; i < 5; i++) {
    randomURL += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return randomURL;
}

//////           APP.GET        ////////

/** Home Page rout */
app.get("/", (req, res) => {
  res.redirect("/urls");
});

/** Register Page Rout */
app.get("/register", (req, res) => {
  res.render("registration_form")
});


/** Login rout */
app.get("/login", (req, res) => {
  res.render("login");
});

/** URL page rout */
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let username = users[userID]['email'];
  const templateVars = {
    urls: urlDatabase,
    username
  };
  res.render("urls_index", templateVars);
});

/** Submit NEW URL page rout */
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]].email
  };
  res.render("urls_new", templateVars);
});

/** Update URL page rout */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    username: users[req.cookies["user_id"]].email
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    res.statusCode = 400;
    return res.send(
      "The page you have requested does not exist. Please check to make sure you've entered the correct Tiny URL and try again :)"
    );
  }
  res.redirect(longURL);
});


//////           APP.POST         ////////

app.post("/urls", (req, res) => {
  res.statusCode = 200;
  const newShortURL = generateRandomString(urlDatabase);
  // console.log('New Short URL : ', newShortURL);
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

/** Deletes the short URL from database */
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/** Edit a long URL and redirects to the urls_show page */
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls`);
});

/** Register Post rout */
app.post('/register', (req, res) => {
  let generatedID = generateRandomString();
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;
  res.cookie('user_id', generatedID);
  const user = {
    id: generatedID,
    email: providedEmail,
    password: providedPassword
  };
  users[generatedID] = user;
  console.log('USERs: ', users);
  res.redirect(`/urls`)
});

/** Login Post rout */
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect(`/urls`);
});

/** Logout Post rout */
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
