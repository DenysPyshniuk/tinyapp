const { assert } = require("chai");

const { getUserByEmail, urlsForUser, urlDatabase } = require("../helpers.js");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    }
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefined if an email does not exist in the database", () => {
    const user = getUserByEmail("s.s@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});

describe("urlsForUser", () => {
  it("should return urls for specific user id", () => {
    const userURLs = urlsForUser("tester", urlDatabase);
    const expectedOutput = {
      b2xVn2: { longURL: "https://www.lighthouselabs.ca", userID: "tester" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "tester" }
    };
    assert.deepEqual(userURLs, expectedOutput);
  });

  it("should return an empty object if no urls found for a specific user", () => {
    const userURLs = urlsForUser("user2RandomID", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(userURLs, expectedOutput);
  });
});