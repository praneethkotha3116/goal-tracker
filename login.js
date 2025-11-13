document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const stored = JSON.parse(localStorage.getItem(`userProfile_${email}`));
    if (!stored) {
      alert("No such user. Please register first.");
      return;
    }

    if (stored.password === password) {
      // ✅ Fix: use `stored.name` instead of `stored.username`
      localStorage.setItem("username", stored.name);   // display name
      localStorage.setItem("email", email);            // user key

      localStorage.setItem("lastLogin", new Date().toLocaleString());

      alert("Login successful!");
      window.location.href = "home.html";
    } else {
      alert("Invalid password.");
    }
  });
});
