// This file imports the required modules
const express = require("express");
let books = require("./booksdb.js");
let { isValid, user } = require("./auth_users.js");
const public_users = express.Router();

// This route handles user registration
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({
        message: "Customer successfully registered. Now you can login",
      });
    } else {
      return res.status(404).json({ message: "Customer already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register customer." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  new Promise((resolve, reject) => {
    // Simulate an asynchronous operation, e.g., fetching data from a database
    setTimeout(() => {
      resolve(books);
    }, 1000); // 1 second delay for demonstration purposes
  })
    .then((books) => {
      res.send(books);
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params;

  // Create a Promise
  const findBookPromise = new Promise((resolve, reject) => {
    if (isbn < 1) {
      reject("Invalid book number!");
    } else if (isbn > 10) {
      reject("Book not found!");
    } else {
      resolve(books[isbn]);
    }
  });

  // Handling the Promise
  findBookPromise
    .then((book) => {
      res.send(book);
    })
    .catch((error) => {
      res.status(400).send(error); // Sending appropriate status code
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authorQuery = req.params.author.replace(/\s/g, "");
  const foundBooks = [];

  // Create a Promise
  const findBooksByAuthorPromise = new Promise((resolve, reject) => {
    for (const key in books) {
      const authorNameWithoutSpaces = books[key].author.replace(/\s/g, "");
      if (
        books.hasOwnProperty(key) &&
        authorNameWithoutSpaces.includes(authorQuery)
      ) {
        foundBooks.push(books[key]);
      }
    }

    if (foundBooks.length > 0) {
      resolve(foundBooks);
    } else {
      reject(`Books by authors containing "${req.params.author}" not found!`);
    }
  });

  // Handling the Promise
  findBooksByAuthorPromise
    .then((foundBooks) => {
      res.send(foundBooks);
    })
    .catch((error) => {
      res.send(error);
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const titleQuery = req.params.title.replace(/\s/g, "");
  const foundBooks = [];

  // Create a Promise
  const findBooksByTitlePromise = new Promise((resolve, reject) => {
    for (const key in books) {
      const titleNameWithoutSpaces = books[key].title.replace(/\s/g, "");
      if (
        books.hasOwnProperty(key) &&
        titleNameWithoutSpaces.includes(titleQuery)
      ) {
        foundBooks.push(books[key]);
      }
    }

    if (foundBooks.length === 1) {
      resolve(foundBooks);
    } else {
      reject(`Books with title containing "${req.params.title}" not found!`);
    }
  });

  // Handling the Promise
  findBooksByTitlePromise
    .then((foundBooks) => {
      res.send(foundBooks);
    })
    .catch((error) => {
      res.send(error);
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const reviewQuery = req.params.isbn;
  if (!books.hasOwnProperty(reviewQuery)) {
    res.send("Book review not found!");
  } else {
    res.send(books[reviewQuery].reviews);
  }
});

module.exports.general = public_users;
