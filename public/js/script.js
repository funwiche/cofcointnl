// function toggle_object(el) {
//   el.classList.toggle("object-cover");
//   el.classList.toggle("object-contain");
// }
// function add_img(el) {
//   document.getElementById("img-expanded").src = el.src;
// }
// document
//   .querySelector("#request-quote form")
//   .addEventListener("submit", send_form);
// function send_form(el) {
//   el.preventDefault();
//   const name = el.target.querySelector('[name="name"]').value;
//   const phone = el.target.querySelector('[name="phone"]').value;
//   const email = el.target.querySelector('[name="email"]').value;
//   const message = el.target.querySelector("textarea").value;
// }
function resizeIframe(event) {
  document.getElementById("my_iframe").style.height = event.data + "px";
}
window.addEventListener("message", resizeIframe, false);
