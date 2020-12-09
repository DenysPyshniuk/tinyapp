const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

console.log('---------------------------------------------------------------');

/** DATABASE Obj */
const urlDatabase = {
  b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "tester" },
  c2xVn3: { longURL: "http://www.google.com", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "tester" }
};

/** USERS Obj */
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
  tester: {
    id: "tester",
    email: "test@test",
    password: "test",
  },
};

/** Generate new random 6 digit string function short URL */
function generateRandomString() {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomURL = '';
  for (let i = 0; i < 5; i++) {
    randomURL += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return randomURL;
};

/** Filter Short URL's function for special userID's */
function urlsForUser(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\\\
////// //////////       GET      /////////  ////////

/** Home Page rout */
app.get("/", (req, res) => {
  res.redirect("/urls");
});

/** Register Page Rout */
app.get("/register", (req, res) => {
  res.render("registration_form")
});

/** Login Get rout */
app.get("/login", (req, res) => {
  res.render("login");
});

/** URLS Get page rout */
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let email;
  if(userID) {
    email = users[userID]['email'];
    // console.log('email: ', email);
  }
  const templateVars = {
    urls: urlsForUser(userID),
    email
  };
  // console.log('email: ', email);
  res.render("urls_index", templateVars);
});

/** Submit NEW URL page rout */
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  let email;
  if (userID) {
    email = users[userID]["email"];
  }
  else {
    res.redirect('/login')
  }
  const templateVars = {
    email
  }
  res.render("urls_new", templateVars);
});

/** Edit LongURL page rout */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"];
  // console.log(req.params);
  if(longURL['userID'] !== userID) {
    res.status(403).send(`You don't have access!`)
    // res.redirect('/login');
  } else {
  let email;
  if (userID) {
    email = users[userID]["email"];
  }
  const templateVars = {
    shortURL,
    longURL,
    email,
  };
  res.render("urls_show", templateVars);
  }
});

/** GET Route to long URL website after input short URL ID */
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    res.statusCode = 400;
    return res.send(
      "The page you have requested does not exist. Please check to make sure you've entered the correct TinyApp URL and try again :)"
    );
  }
  res.redirect(longURL);
});

/** GET JSON file */
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/** Hello Page */
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


///~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\\\

///////////////// POST  /////////////

// POST new Short URL
app.post("/urls", (req, res) => {
  res.statusCode = 200;
  const newShortURL = generateRandomString(urlDatabase);
  urlDatabase[newShortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id};
  res.redirect(`/urls/${newShortURL}`);
});

/** Edit Long URL and redirects to the urls_show page */
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

/** Delete Short URL from database */
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"];

  if (longURL["userID"] !== userID) {
    res.status(403).send(`You don't have access!`);
    return;
  } else {
    let email;
    if (userID) {
      email = users[userID]["email"];
    }
    // const templateVars = {
    //   shortURL,
    //   longURL,
    //   email,
    // };
    // res.render("urls_show", templateVars);
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  // let shortURL = req.params.shortURL;
  // delete urlDatabase[shortURL];
  // res.redirect("/urls");
});

/** Register Post rout */
app.post('/register', (req, res) => {
  let generatedID = generateRandomString();
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;

  if (!providedEmail || !providedPassword) {
    res.status(403).send("Fill the form!");
    return;

  }
  for(let user in users) {
    if (providedEmail === users[user]['email']) {
      res.render("error_400");
    }
  }

  const user = {
    id: generatedID,
    email: providedEmail,
    password: providedPassword
  };
  users[generatedID] = user;
  res.cookie('user_id', generatedID);
  // console.log('USERs: ', users);
  res.redirect(`/urls`)
});

/** Login Post rout */
app.post("/login", (req, res) => {
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;

  if(!providedEmail || (providedEmail === "")) {
    res.status(403).send("Fill the form!");
    return;
  }
  for(let i in users) {
    if(users[i].email === providedEmail) {
      if(users[i].password == providedPassword) {
        const user_id = i;
        res.cookie("user_id", user_id);
        res.redirect("/urls");
        return;
      }
    }
  }
  res.status(403).send("Login or password is incorrect!");
});

/** Logout Post rout */
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

/** Listen port */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
