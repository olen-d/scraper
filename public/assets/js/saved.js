// Depends on JQuery
const removeClassName = document.getElementsByClassName("removeBtn");

$(".notesBtn").on("click", function() {
    $("#notesModalLabel").append("Notes For: " + $(this).attr("data-article-name"));
    $(".saveNoteBtn").attr("data-article-id", $(this).attr("data-article-id"));
    // Use Axios to retrieve the notes
    console.log($(this).attr("data-article-id"));
});

$("#notesModal").on("hidden.bs.modal", () => {
    $("#notesModalLabel").empty();
});

$(".saveNoteBtn").on("click", function() {
  // Save the note
  const articleId = $(this).attr("data-article-id");
  const noteContent = $("#note-content").val();
  console.log("NOTE CONTENT:\n", noteContent);
  const newNote = addNote(articleId, noteContent);
  $(".modal-body").append(newNote);
});

const removeArticle = function() {
  const articleId = this.getAttribute("data-article-id");

  axios.delete("/article/remove", {
    data: { articleId }
  })
  .then(response => {
    if (response.status === 200) {

      //Delete the box with the data id from the DOM
      let elem = document.getElementById(`js-${response.data}`);
      elem.parentNode.removeChild(elem);
    }
  })
  .catch(error => {
    console.log(error);
    alert(error);
  })
}

// Note related items

const addNote = (articleId, noteContent) => {
  // Put route to add the note /note/add/articleId
  console.log("addNote:\n", articleId, noteContent);
  axios.post(`note/add`, {
    articleId: articleId,
    noteContent: noteContent
  })
  .then(response => {
    if (response.status === 200) {
      console.log("saved.js RESPONSE:\n");
    }
  })
  //return newNote;
}

Array.from(removeClassName).forEach(e => {
  e.addEventListener("click", removeArticle);
});
