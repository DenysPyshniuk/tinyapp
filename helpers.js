const bcrypt = require("bcrypt");

/** URL Database Obj */
const urlDatabase = {
  b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "tester" },
  c2xVn3: { longURL: "http://www.google.com", userID: "test2" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "tester" },
};

/** Users Database Obj */
const users = {
  test2: {
    id: "test2",
    email: "test2@test",
    password: bcrypt.hashSync("1234", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("1234", 10),
  },
  tester: {
    id: "tester",
    email: "test@test",
    password: bcrypt.hashSync("1234", 10)
  },
};

////////////////////////** Functions **\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Generate new random 6 digit string function short URL */
function generateRandomString() {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomURL = "";
  for (const i = 0; i < 5; i++) {
    randomURL += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return randomURL;
}

/** Filter Short URL's function for special userID's */
function urlsForUser(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

/** Check if user exists */
function getUserByEmail(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return undefined;
}

///////////////////
module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  urlDatabase,
  users
};