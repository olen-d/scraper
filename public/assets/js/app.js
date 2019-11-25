const className = document.getElementsByClassName("saveBtn");

const saveArticle = function() {
  const articleId = this.getAttribute("data-article-id");

  axios.post("/articles/save", {
    articleId: articleId,
    saved: true
  })
  .then ((response) => {
    if (response.status === 200) {
        
      // Delete the box with the data id from the dom.
      let elem = document.getElementById(`js-${response.data}`);
      elem.parentNode.removeChild(elem);
    }
  })
  .catch ((error) => {
    console.log(error);
    alert(error);
  });
}

Array.from(className).forEach((e) => {
  e.addEventListener("click", saveArticle);
});
