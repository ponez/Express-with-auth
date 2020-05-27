const sortByPrice = () => {
  let sort = "budget";
  fetch("/gigs" + sort).then((data) => {
    //   location.reload();
    console.log("here");
  });
};
const sendDaPayment = (btn) => {
  let id = btn.parentNode.querySelector("[name=gigID]").value;
  console.log(id);
  fetch(`/payment/${id}`);
};
