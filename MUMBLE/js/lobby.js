let form = document.getElementById("lobby__form");

let displayName = sessionStorage.getItem("display_name");
if (displayName) {
  form.querySelector('input[name="name"]').value = displayName;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = form.querySelector('input[name="name"]').value;
  let inviteCode = form.querySelector('input[name="room"]').value;

  sessionStorage.setItem("display_name", name);
sessionStorage.setItem("room", inviteCode); // ADD THIS

window.location = `index.html?room=${inviteCode}&name=${name}`;

  if (!inviteCode) {
    inviteCode = String(Math.floor(1000 + Math.random() * 9000));
  }

  console.log("Redirecting to:", inviteCode);

  window.location = `index.html?room=${inviteCode}&name=${name}`;
});