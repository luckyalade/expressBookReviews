const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  if (usersWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let user = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (user.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Extract review from request query
  const username = req.session.authorization.username;

  // Check if review content is provided
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already reviewed the book
  if (book.reviews.hasOwnProperty(username)) {
    // If the same user posts a different review, modify the existing review
    book.reviews[username] = review;
    return res.status(200).json({
      message:
        "The Review for the book with ISBN " + isbn + " has been added/updated",
    });
  } else {
    // If another user posts a review, add it as a new review
    book.reviews[username] = review;
    return res.status(200).json({
      message:
        "The Review for the book with ISBN " + isbn + " has been added/updated",
    });
  }
});

regd_users.get("/reviews", (req, res) => {
  // Initialize an empty array to store all reviews
  let allReviews = [];

  // Iterate over each book in the books object
  for (let isbn in books) {
    const book = books[isbn];

    // Iterate over each review in the book
    for (let username in book.reviews) {
      const review = {
        isbn: isbn,
        author: book.author,
        title: book.title,
        username: username,
        review: book.reviews[username],
      };

      // Push the review object to the allReviews array
      allReviews.push(review);
    }
  }

  // Return the collected reviews as a JSON response
  res.json(allReviews);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews.hasOwnProperty(username)) {
    return res.status(404).json({ message: "Review not found" });
  } else {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message:
        "Reviews for the ISBN " +
        isbn +
        " posted by the user, " +
        username +
        ", deleted",
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
