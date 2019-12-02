const saveClassName = document.getElementsByClassName("btn-save-article");
const readClassName = document.getElementsByClassName("btn-read-article");

// TODO: Refactor this to change the functions to methods and export an object
const saveArticle = function() {
  const articleId = this.getAttribute("data-article-id");

  axios.put("/articles/save", {
    articleId
  })
  .then(response => {
    if (response.status === 200) {
        
      // Delete the box with the data id from the dom.
      let elem = document.getElementById(`js-${response.data}`);
      elem.parentNode.removeChild(elem);
    }
  })
  .catch (error => {
    console.log(error);
    alert(error);
  });
}

const readArticle = function() {
  const articleURL = this.getAttribute("data-article-url");
  parent.open(articleURL);
}

Array.from(saveClassName).forEach(e => {
  e.addEventListener("click", saveArticle);
});

Array.from(readClassName).forEach(e => {
  e.addEventListener("click", readArticle);
});
