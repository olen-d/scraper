const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  saved: {
    type: Array,
    required: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
},
{ 
  timestamps: true
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model("article", ArticleSchema);

// Export the Article model
module.exports = Article;