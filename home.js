document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("username") || "Student";
  document.getElementById("welcomeUser").textContent = `Welcome ${userEmail}`;

  const goals = JSON.parse(localStorage.getItem(`userGoals_${userEmail}`)) || [];

  const total = goals.length;

  const completed = goals.filter(g =>
    g.status?.toLowerCase() === "completed" ||
    (g.screenshot && g.screenshot.startsWith("data:image"))
  ).length;

  const pendingGoals = goals.filter(g =>
    !(g.status?.toLowerCase() === "completed" || (g.screenshot && g.screenshot.startsWith("data:image")))
  );

  // 🔵 Progress circle update
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  document.querySelector(".progress-circle").style.background =
    `conic-gradient(#195a78 0% ${percent}%, #a9e6e0 ${percent}% 100%)`;
  document.querySelector(".progress-text h2").textContent = `${percent}%`;
  document.querySelector(".progress-text p").textContent = `${completed} of ${total} goals`;

  // Summary text
  document.querySelectorAll("#d2")[0].textContent = `${completed} Goals out of ${total} goals are completed`;
  document.querySelectorAll("#d2")[1].textContent = `successfully`;

  // 🔔 Nearest pending goal
  if (pendingGoals.length > 0) {
    pendingGoals.sort((a, b) => {
      const aTime = new Date((a.desc?.split(" | ")[1] || "").trim());
      const bTime = new Date((b.desc?.split(" | ")[1] || "").trim());
      return aTime - bTime;
    });
    const nextGoal = pendingGoals[0];
    document.querySelectorAll("#d3")[0].textContent = `Next Goal: ${nextGoal.title}`;
    document.querySelectorAll("#d3")[1].textContent = `Due ${nextGoal.desc?.split(" | ")[1] || "Unknown"}`;
  } else {
    document.querySelectorAll("#d3")[0].textContent = `🎉 All goals completed!`;
    document.querySelectorAll("#d3")[1].textContent = ``;
  }

  // 📅 Upcoming Deadlines (within 5 days and pending only)
  const container = document.getElementById("deadlines");
  container.innerHTML = "";

  const now = new Date();
  const upcomingGoals = goals.filter(goal => {
    const isCompleted = goal.status?.toLowerCase() === "completed" ||
      (goal.screenshot && goal.screenshot.startsWith("data:image"));

    if (isCompleted) return false;

    const deadlineStr = goal.desc?.split(" | ")[1];
    if (!deadlineStr) return false;

    const goalDate = new Date(deadlineStr.trim());
    const timeDiff = (goalDate - now) / (1000 * 60 * 60 * 24);
    return timeDiff >= 0 && timeDiff <= 5;
  });

  upcomingGoals.sort((a, b) => {
    const aDate = new Date(a.desc?.split(" | ")[1] || "");
    const bDate = new Date(b.desc?.split(" | ")[1] || "");
    return aDate - bDate;
  });

  upcomingGoals.forEach(goal => {
    const deadline = goal.desc?.split(" | ")[1] || "Unknown";

    const div = document.createElement("div");
    div.className = "deadline-item";
    div.innerHTML = `
      <div>
        <strong>${goal.title}</strong><br>
        <span class="date">${deadline}</span>
      </div>
      <div class="status pending">⏳ Pending</div>
    `;
    container.appendChild(div);
  });

  // 🧾 Category Summary
  const categorySummary = {};
  goals.forEach(goal => {
    const cat = goal.category || "General";
    if (!categorySummary[cat]) categorySummary[cat] = { total: 0, completed: 0 };
    categorySummary[cat].total++;

    const isComplete = goal.status?.toLowerCase() === "completed" ||
      (goal.screenshot && goal.screenshot.startsWith("data:image"));
    if (isComplete) categorySummary[cat].completed++;
  });

  const categoryGrid = document.querySelector(".category-grid");
  categoryGrid.innerHTML = "";

  Object.entries(categorySummary).forEach(([cat, stat]) => {
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerHTML = `<h4>${cat}</h4><p>${stat.completed}/${stat.total} completed</p>`;
    categoryGrid.appendChild(div);
  });

  // 🟢 View All Goals → Navigate to goals page
  const viewBtn = document.querySelector(".view-goals button");
  viewBtn.addEventListener("click", () => {
    window.location.href = "goal.html";
  });
});
