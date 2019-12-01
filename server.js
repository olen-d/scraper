const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

// For the scraping
const axios = require("axios");
const cheerio = require("cheerio");

// For generating unique User Ids
const uuidv4 = require("uuid/v4");

// Cookies will be used to store the User Id so they can retrieve their articles and notes
const cookieParser = require("cookie-parser");

// Require all models
const db = require("./models");

// Initialize Express
const app = express();
const PORT =  process.env.PORT || 3090;

// Configure middleware
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the Cookie Parser
app.use(cookieParser());

// Set up Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static folder
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });

// Some useful functions
const getUserCookie = (req, res, articleId) => {
  const userCookie = req.cookies["user-id"];

  if (userCookie) {
    // TODO: Clean this mess up - testing for articleId twice is the spahgetti code
    if(articleId) {
      res.send(articleId);
    }
    return req.cookies["user-id"];
  } else { 
    if(articleId) {
      const newUserId = setUserCookie(res, articleId);
      return newUserId;
    } else {
      return 404;
    }
  }  
}

const setUserCookie = (res, articleId) => {
  const newUserId = uuidv4();
  res.cookie("user-id", newUserId).send(articleId);
  return newUserId;
}

// Routes
app.get("/", (req, res) => {
  const articleId = null;
  const userId = getUserCookie(req, res, articleId);
  const options = { headers: { Authorization: `Bearer ${userId}`}}; // Sending cookies with Axios is a pain, so we get the cookie and then pass it with the Authorization header
  axios.get(`http://127.0.0.1:${PORT}/articles`, options)
  .then(response => {
    let hbsObj = {
      articles : response.data 
    };
    res.render("index", hbsObj);
  })
  .catch(error => {
    console.log(error);
  });
});

// A GET route for scraping Artvoice
app.get("/scrape", (req, res)=>{
    // First, we grab the body of the html with axios
    axios.get("https://artvoice.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("h2").each(function(i, element) {
        // Save an empty result object
        let result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
        .children("a")
        .text();
        result.link = $(this)
        .children("a")
        .attr("href");
         // If this found element had both a title and a link
         if (result.title && result.link) {
            // Insert the data in the scrapedData db
            db.Article.update({
                title: result.title
            },
            {
              title: result.title,
              link: result.link
            },
            {
                upsert: true
            },
            (err, inserted) => {
              if (err) {
                res.json({scrapeStatus: "Scrape Failed"});
                // Log the error if one is encountered during the query
                // console.log(err);
              }
              else {
                // Otherwise, log the inserted data
                // console.log(inserted);
              }
            });
          }
    });

    // Reload the articles
    axios.get(`http://127.0.0.1:${PORT}/articles`)
    .then(response => {
      let hbsObj = {
        articles : response.data 
      };
      res.render("index", hbsObj);
    })
    .catch(error => {
      console.log(error);
    });
  });
});

// Route for clearing the articles from the db
app.get("/clear", (req, res) => {
  db.Article.collection.drop()
  .then(result => {
    // Refresh the page
    axios.get(`http://127.0.0.1:${PORT}/articles`)
    .then(response => {
      let hbsObj = {
        articles : response.data 
      };
      res.render("index", hbsObj);
    })
    .catch(error => {
      console.log(error);
    });    
  });
});

// Route for getting all Articles from the db
app.get("/articles", (req, res) => {
  // Grab every document in the Articles collection that aren't already saved by the current user
  // Sort in reverse order so that new scrapes are returned on top
  let token = req.headers.authorization;
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  db.Article.find({saved: {$ne: token}}).sort({createdAt: -1})
    .then(dbArticle => {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Put route for saving an article
app.put("/articles/save", (req, res) => {
  // Check to see if a cookie is assigned and if not, set one
  const articleId = req.body.articleId;
  const userId = getUserCookie(req, res, articleId);
  
  db.Article.findOne({_id: articleId})
    .then(result => {
      result.saved.push(userId);
      result.save();
    })
    .catch((err) => {
      console.log("Epic Fail\n", err)
    })

});

// Get route for returning saved articles
app.get("/saved", (req, res) => {
  // Get the user id
  const articleId = null;
  const userId = getUserCookie(req, res, articleId);

  if(userId != 404) {
    // Search the articles collection for any with the user id in saved
    db.Article.find({ saved: userId }).sort({createdAt:-1})
      .then(result =>{
        let hbsObj = {
          articles : result 
        };
        res.render("saved", hbsObj);        
      })
      .catch((err) => {
        console.log("server.js - /articles/saved\nDatabase Error: ", err);
      })
    // Return a useful error if no articles are saved
    // Return the saved articles
  } else {
    // No user found...
  }
});

// Delete route for removing the article
app.delete("/article/remove", (req, res) => {
  const articleId = req.body.articleId;
  const userId = getUserCookie(req, res, articleId);

  db.Article.findOne({_id: articleId})
  .then(result => {
    result.saved.pull(userId);
    result.save();
  })
  .catch((err) => {
    console.log("Epic Fail\n", err)
  })

});

// Post route for adding a note to the Article
app.post("/notes/add" , (req, res) => {
  const userId = getUserCookie(req, res, null);
  const data = req.body.data;
  const articleId = data.articleId;
  const content = data.noteContent;

  const newNote = new db.Note({
    userId,
    articleId,
    content
  });

  newNote.save(err => {
    if (err) return err;
    res.send(newNote);
  });
});

// Get route for reading the notes
app.get("/notes/article/:articleId", (req, res) => {
  const articleId = req.params.articleId;
  // res.send("TEST: " + articleId);

  db.Note.find({articleId: articleId}).sort({createdAt: -1})
  .then(dbNote => {
    // If we were able to successfully find Notes, send them back to the client
    res.json(dbNote);
  })
  .catch(err => {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Start the server
app.listen(PORT, () => {
  console.log("Mongo Scraper running on port " + PORT + "!");
});
