document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  const existing = localStorage.getItem(`userProfile_${email}`);
  if (existing) {
    alert("User already exists. Please login.");
    return;
  }

  const profileData = {
    name,
    email,
    password,
    bio: "Tell us something about you!",
    goalsCreated: 0,
    goalsCompleted: 0,
    avgCompletion: 0,
    completionRate: 0,
    streak: 0,
    logs: [],
    darkMode: false
  };

  localStorage.setItem(`userProfile_${email}`, JSON.stringify(profileData));
  alert("Registered successfully!");
  window.location.href = "login.html";
});
