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
    alert(error);
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
      const noteContent = response.data.content;
      const newNote = `<p class="note-content">${noteContent}</p>`;
      $(".modal-body").prepend(newNote);
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
        response.data.forEach(note => {
          notes += `<p class="note-content">${note.content}</p>`;
        });
        resolve(notes);
      });
    } catch (error) {
      reject(`Failed to retrieve notes for ${articleId}. Error: ${error}`); 
    }
  });
}

Array.from(removeClassName).forEach(e => {
  e.addEventListener("click", removeArticle);
});
