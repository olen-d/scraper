const express = require("express");
const exphbs = require("express-handlebars");

// Database tools
const mongojs = require("mongojs");
const mongoose = require("mongoose");

const app = express();
const port =  process.env.PORT || 3000;

// Set up the database
// Database configuration
const dbUrl = "scraper";
const collections = ["scrapedData"];

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scraper";

mongoose.connect(MONGODB_URI);

// Hook mongojs configuration to the db variable
// const db = mongojs(dbUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Set up the Express app to handle data parsing

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const scrapeRoutes = require("./controllers/scrapeController")(app, db);
const articleRoutes = require("./controllers/articlesController")(app, mongoose);
// const commentRoutes = require("./controllers/commentsController")(app);

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.articles.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.listen(port, () => console.log(`Example app listening on port ${port}!`));