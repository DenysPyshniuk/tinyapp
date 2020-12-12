const express = require("express");
const morgan = require('morgan');
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { generateRandomString, urlsForUser, getUserByEmail, urlDatabase, users} = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));
app.use(bodyParser.urlencoded({extended: true}));

console.log('------------------------------------');

///****************************************\\\
///****************************************\\\
///     ******     Get Routs     ******    \\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\

/** Home */
app.get("/", (req, res) => {
  const userID = req.session["userID"];
  let email;
  if (!userID) {
    res.redirect('/login')
    return;
  }
  res.redirect("/urls");
});

/** Register */
app.get("/register", (req, res) => {
  const userID = req.session["userID"];
  let email;
  if (userID) {
    res.redirect("/urls");
    return;
  }
  res.render("registration_form");
});

/** Login */
app.get("/login", (req, res) => {
  const userID = req.session["userID"];
  let email;
  if (userID) {
    res.redirect("/urls");
    return;
  }
  res.render("login");
});

/** My URLS */
app.get("/urls", (req, res) => {
  const userID = req.session["userID"];
  let email;
  if(!userID) {
    res.status(401).send('You are not loged in!')
    return;
  }
  if (userID) {
    email = users[userID]['email'];
  }
  const templateVars = {
    urls: urlsForUser(userID),
    email
  };
  res.render("urls_index", templateVars);
});

/** Submit New URL  */
app.get("/urls/new", (req, res) => {
  const userID = req.session["userID"];
  let email;
  if (userID) {
    email = users[userID]["email"];
  } else {
    res.redirect('/login');
  }
  const templateVars = {
    email
  };
  res.render("urls_new", templateVars);
});

/** Edit LongURL */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = req.session.userID;
  if (longURL.userID !== userID) {
    res.status(403).send(`You don't have access!`);
  } else {
    let email;
    if (userID) {
      email = users[userID].email;
    }
    const templateVars = {
      shortURL,
      longURL,
      email,
    };
    res.render("urls_show", templateVars);
  }
});

/** Redirect from Short URL to the Long URL */
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[shortURL]) {
    res.status(400).send(
      "The page you have requested does not exist. Please check to make sure you've entered the correct TinyApp URL and try again :)"
    );
  } else {
    res.redirect(longURL.longURL);
  }
});

/** JSON file */
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/** Hello Page */
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

///****************************************\\\
///****************************************\\\
///     ******     Post Routs     ******   \\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\

/** Register */
app.post('/register', (req, res) => {
  let generatedID = generateRandomString();
  const providedEmail = req.body.email;
  const providedPassword = bcrypt.hashSync(req.body.password, 10);

  if (providedEmail && providedPassword) {
    if (!getUserByEmail(providedEmail, users)) {
      users[generatedID] = {
        id: generatedID,
        email: providedEmail,
        password: providedPassword
      };
      req.session.userID = generatedID;
      res.redirect(`/urls`);
    } else {
      res.status(400).send("Something went wrong! Try to LOGIN instead or try diffrent @mail address!");
      return;
    }
  } else {
    res.status(400).send("Fill the form!");
    return;
  }
});

/** Login  */
app.post("/login", (req, res) => {
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;
  const foundUser = getUserByEmail(providedEmail, users);
  if (foundUser && bcrypt.compareSync(providedPassword, foundUser["password"])) {
    req.session.userID = foundUser["id"];
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Login or password is incorrect!");
  return;
});

/** New Short URL */
app.post("/urls", (req, res) => {
  res.statusCode = 200;
  const newShortURL = generateRandomString(urlDatabase);
  urlDatabase[newShortURL] = {longURL: req.body.longURL, userID: req.session.userID};
  res.redirect(`/urls/${newShortURL}`);
});

/** Edit Long URL  */
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

/** Delete Short URL */
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = req.session.userID;
  if (longURL["userID"] !== userID) {
    res.status(403).send(`You don't have access!`);
  } else {
    let email;
    if (userID) {
      email = users[userID]["email"];
    }
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

/** Logout  */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

/** Listen port */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});