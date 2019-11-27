// Depends on JQuery
const removeClassName = document.getElementsByClassName("removeBtn");

$(".notesBtn").on("click", function() {
    $("#notesModalLabel").append("Notes For: " + $(this).attr("data-article-name"));
    // Use Axios to retrieve the notes
    console.log($(this).attr("data-article-id"));
});

$("#notesModal").on("hidden.bs.modal", () => {
    $("#notesModalLabel").empty();
});

$(".saveNoteBtn").on("click", function() {
  // Save the note
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

Array.from(removeClassName).forEach(e => {
  e.addEventListener("click", removeArticle);
});
