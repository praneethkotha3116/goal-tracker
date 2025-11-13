document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("e11");
  const emailInput = document.getElementById("e12");
  const passwordInput = document.getElementById("e13");
  const updateBtn = document.getElementById("e14");
  const profileImg = document.getElementById("e1");
  const uploadBtn = document.getElementById("e2");
  const removeBtn = document.getElementById("e3");
  const logoutBtn = document.getElementById("e7");
  const deleteBtn = document.getElementById("e8");

  const username = localStorage.getItem("username") || "User";
  const profileData = JSON.parse(localStorage.getItem(`userProfile_${username}`)) || {};
  const email = profileData.email || username;

  nameInput.value = profileData.name || username;
  emailInput.value = email;
  document.getElementById("e4").textContent = `Name: ${profileData.name || username}`;
  document.getElementById("e5").textContent = `Email: ${email}`;

  const userGoals = JSON.parse(localStorage.getItem(`userGoals_${username}`) || "[]");
  const completed = userGoals.filter(g => (g.status || "").toLowerCase() === "completed");

  // === Goal Stats
  document.getElementById("goalsCreated").textContent = `Goals created: ${userGoals.length}`;
  document.getElementById("goalsCompleted").textContent = `Goals completed: ${completed.length}`;
  const compRate = userGoals.length ? Math.round((completed.length / userGoals.length) * 100) : 0;
  document.getElementById("compRate").textContent = `Completion Rate : ${compRate}%`;

  // === Average Completion Time
  let totalDays = 0;
  let count = 0;
  completed.forEach(g => {
    const createdAt = parseGoalDate(g.desc);
    const completedAt = g.completedAt ? new Date(g.completedAt) : new Date();
    let diff = Math.floor((completedAt - createdAt) / (1000 * 3600 * 24));
    if (!isNaN(diff)) {
      totalDays += Math.max(0, diff);
      count++;
    }
  });

  const avgText = document.getElementById("avgTime");
  if (count > 0) {
    const avgDays = Math.round(totalDays / count);
    avgText.textContent = avgDays === 0
      ? "Average completion Time : On Time"
      : `Average completion Time : ${avgDays} day${avgDays > 1 ? "s" : ""} late`;
  } else {
    avgText.textContent = "Average completion Time : No completed goals yet";
  }

  // === Active Streak
  const dates = completed
    .map(g => new Date(g.completedAt || new Date()))
    .sort((a, b) => b - a)
    .map(d => d.toDateString());

  let streak = 0;
  let current = new Date();
  for (let i = 0; i < dates.length; i++) {
    if (dates[i] === current.toDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  document.getElementById("streak").textContent = `Active Streak : ${streak}-day goal streak`;

  // === Profile Image Load (per user)
  const savedImage = localStorage.getItem(`profileImage_${username}`);
  if (savedImage) profileImg.src = savedImage;

  // === Upload Profile Image
  uploadBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        profileImg.src = reader.result;
        localStorage.setItem(`profileImage_${username}`, reader.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // === Remove Profile Image
  removeBtn.addEventListener("click", () => {
    profileImg.src = "assets/user.png";
    localStorage.removeItem(`profileImage_${username}`);
  });

  // === Update Profile Info
  updateBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const pass = passwordInput.value.trim();

    if (name) {
      profileData.name = name;
      localStorage.setItem("username", newEmail || username);
      document.getElementById("e4").textContent = `Name: ${name}`;
    }
    if (newEmail) {
      profileData.email = newEmail;
      document.getElementById("e5").textContent = `Email: ${newEmail}`;
    }
    if (pass.length > 0) {
      profileData.password = pass;
    }

    localStorage.setItem(`userProfile_${newEmail || username}`, JSON.stringify(profileData));
    alert("Profile updated successfully.");
    passwordInput.value = "";
  });

  // === Password Strength Bar
  passwordInput.addEventListener("input", () => {
    const strength = document.getElementById("passwordStrength");
    const val = passwordInput.value;
    let score = 0;
    if (val.length >= 6) score += 30;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 20;
    if (/[^A-Za-z0-9]/.test(val)) score += 30;
    strength.value = score;
  });

  // === Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    window.location.href = "login.html";
  });

  // === Delete Account
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account?")) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(username)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem(`userProfile_${username}`);
      localStorage.removeItem("username");
      window.location.href = "register.html";
    }
  });

  // === Activity Log (per user)
  const log = JSON.parse(localStorage.getItem(`activityLog_${username}`) || "[]");
  const logContainer = document.getElementById("logContainer");
  logContainer.innerHTML = "";
  if (log.length === 0) {
    logContainer.innerHTML = "<p>No recent activity</p>";
  } else {
    log.slice(-5).reverse().forEach(entry => {
      const p = document.createElement("p");
      p.textContent = entry;
      logContainer.appendChild(p);
    });
  }

  // === Last Login
  const lastLogin = localStorage.getItem("lastLogin");
  if (lastLogin) {
    const lastLoginElem = document.getElementById("lastLogin");
    if (lastLoginElem) lastLoginElem.textContent = `Last Login: ${lastLogin}`;
  }

  // === Mood Tracker (per user)
  const moodDisplay = document.getElementById("moodDisplay");
  const moodSelector = document.getElementById("moodSelector");

  const savedMood = localStorage.getItem(`userMood_${username}`);
  if (savedMood && moodDisplay) {
    moodDisplay.textContent = `Your mood today: ${savedMood}`;
    if (moodSelector) moodSelector.value = savedMood;
  }

  if (moodSelector) {
    moodSelector.addEventListener("change", (e) => {
      const mood = e.target.value;
      localStorage.setItem(`userMood_${username}`, mood);
      if (moodDisplay) moodDisplay.textContent = `Your mood today: ${mood}`;
    });
  }

  // === Helper: Parse date from goal description
  function parseGoalDate(desc) {
    const parts = desc?.split("|")[1]?.trim().split(" ");
    if (!parts || parts.length < 1) return new Date();
    return new Date(`${parts[0]}T${parts[1] || "00:00"}`);
  }
});
