const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new NotesSchema object
// This is similar to a Sequelize model
const NoteSchema = new Schema({
  articleId: {
    type: String,
    required: true
  },
  authorId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
},
{ 
  timestamps: true
});

// This creates our model from the above schema, using mongoose's model method
const Note = mongoose.model("note", NoteSchema);

// Export the Notes model
module.exports = Note;
