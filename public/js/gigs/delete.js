const deleteProduct = (btn) => {
  let id = btn.parentNode.querySelector("[name=gigID]").value;
  let deleteThisShit = btn.closest("article");
  fetch("/gigs/" + id, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  })
    .then((result) => {
      deleteThisShit.parentNode.removeChild(deleteThisShit);
    })
    .catch((err) => console.log(err));
};
