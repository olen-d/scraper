// Depends on JQuery
const removeClassName = document.getElementsByClassName("btn-remove");

$(".btn-notes").on("click", function() {
    const articleId = $(this).attr("data-article-id");
    $("#notes-modal-label").append("Notes For: " + $(this).attr("data-article-name"));
    $(".btn-save-note").attr("data-article-id", articleId);
    // Use Axios to retrieve the notes

    readNotes(articleId)
    .then(notes => {
      $(".modal-body").append(notes);
      const removeNoteClassName = document.getElementsByClassName("btn-remove-note");
      Array.from(removeNoteClassName).forEach(e => {
        e.addEventListener("click", removeNote);
      });
    })
    .catch(error => {
      console.log("saved.js - readNotes FAILED: ", error);
    });
});

$("#notes-modal").on("hidden.bs.modal", () => {
    $("#notes-modal-label").empty();
    $(".modal-body").empty();
    $("#note-input").val("");
});

$(".btn-save-note").on("click", function() {
  // Save the note
  const articleId = $(this).attr("data-article-id");
  const noteContent = $("#note-input").val();
  addNote(articleId, noteContent);
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
  })
}

// Note related items

const addNote = (articleId, noteContent) => {
  // Put route to add the note /note/add/articleId
  axios.post("/notes/add", {
    data: { 
      articleId,
      noteContent
    }
  })
  .then(response => {
    if (response.status === 200) {
      const noteId = response.data._id;
      const noteContent = response.data.content;
      const noteUserId = response.data.userId;
      const newNote = `<div class="note-content py-3 clearfix" id="js-${noteId}"><p class="note-text float-left" style="width:85%;">${noteContent}</p><button class="btn btn-danger btn-remove-note float-right" id="${noteId}" data-user-id="${noteUserId}" data-note-id="${noteId}"><i class="fas fa-minus-square"></i></button></div>`;
      $(".modal-body").prepend(newNote);
      if($("#no-notes-found-msg").length) {
        $("#no-notes-found-msg").remove();
      }
      $(`#${noteId}`).on("click", removeNote);
      $("#note-input").val("");
    }
  })
}

const readNotes = articleId => {
  return new Promise((resolve, reject) => {
    try {
      axios.get(`/notes/article/${articleId}`)
      .then(response => {
        let notes = ""
        if (response.data.length > 0) {
          response.data.forEach(note => {
            notes += `<div class="note-content py-3 clearfix" id="js-${note._id}"><p class="note-text float-left" style="width:85%;">${note.content}</p><button class="btn btn-danger btn-remove-note float-right" data-user-id="${note.userId}" data-note-id="${note._id}"><i class="fas fa-minus-square"></i></button></div>`;
          });
        } else {
          notes = "<div class=\"note-content py-3\" id=\"no-notes-found-msg\"><p class=\"note-text\">No notes were found for this article.</p></div>";
        }
        resolve(notes);
      });
    } catch (error) {
      reject(`Failed to retrieve notes for ${articleId}. Error: ${error}`); 
    }
  });
}

const removeNote = function() {
  const noteId = this.getAttribute("data-note-id");
  const userId = this.getAttribute("data-user-id");

  axios.delete("/note/remove", {
    data: { 
      noteId,
      userId
    }
  })
  .then(response => {
    if (response.status === 200 && response.data.deletedCount === 1) {
      //Delete the box with the note id from the DOM
      let elem = document.getElementById(`js-${noteId}`);
      elem.parentNode.removeChild(elem);
    } else {
      // TODO: Update status that delete failed.
    }
  })
  .catch(error => {
    console.log("saved.js - removeNote - delete failed: ", error);
  });
}

Array.from(removeClassName).forEach(e => {
  e.addEventListener("click", removeArticle);
});
