document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  const goals = JSON.parse(localStorage.getItem(`userGoals_${username}`)) || [];

  const summaryContainer = document.getElementById("summary-list");
  const completionContainer = document.getElementById("goal-boxes");

  // ✅ Activity Logger (now per-user)
  function addToActivityLog(message) {
    const log = JSON.parse(localStorage.getItem(`activityLog_${username}`) || "[]");
    const timestamp = new Date().toLocaleString();
    log.push(`[${timestamp}] ${message}`);
    localStorage.setItem(`activityLog_${username}`, JSON.stringify(log));
  }

  goals.forEach((goal, index) => {
    // ✅ Left Summary Column
    const summary = document.createElement("div");
    summary.className = "task-items";

    const title = document.createElement("span");
    title.className = "task-text";
    title.innerText = `• ${goal.title}`;

    const status = document.createElement("span");
    const statusClass = goal.status === "Completed" ? "completed" : "pending";
    status.className = `task-status ${statusClass}`;
    status.innerText = goal.status || "Pending";

    summary.appendChild(title);
    summary.appendChild(status);
    summaryContainer.appendChild(summary);

    // ✅ Right Goal Completion Box
    const box = document.createElement("div");
    box.className = `box${(index % 3) + 1}`;

    const deadline = goal.desc?.split("|")[1]?.trim() || "Unknown";

    const top = document.createElement("div");
    top.className = "top";
    top.innerHTML = `
      <h2>Goal ${index + 1}</h2>
      <h3>${goal.title}</h3>
      <p>${goal.desc?.split("|")[0]?.trim() || ""}</p>
      <div class="task-items">
        <span class="task-text2">${deadline}</span>
        <span class="task-status2 ${goal.status === "Completed" ? "completed" : ""}">${goal.status}</span>
      </div>
    `;

    const bottom = document.createElement("div");
    bottom.className = "bottom";

    const uploadBox = document.createElement("div");
    uploadBox.className = "ss";

    if (goal.status === "Completed" && goal.screenshot) {
      uploadBox.innerHTML = `
        <h2>Uploaded Screenshot</h2>
        <img src="${goal.screenshot}" alt="Screenshot" />
        <p class="task-status2 completed">Completed</p>
      `;
    } else {
      uploadBox.innerHTML = `
        <h2>Upload Screenshot</h2>
        <input type="file" accept="image/*" data-id="${goal.id}" />
      `;

      uploadBox.querySelector("input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSizeMB = 2;

        if (!validTypes.includes(file.type)) {
          alert("Only image files (jpg, png, webp) are allowed!");
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert("File too large. Max 2 MB allowed.");
          return;
        }

        const fileName = `goal_${goal.id}.${file.name.split(".").pop()}`;
        const filePath = `assets/screenshots/${fileName}`;

        const updatedGoals = goals.map(g => {
          if (g.id === goal.id) {
            return {
              ...g,
              status: "Completed",
              screenshot: filePath,
              completedAt: new Date().toISOString()
            };
          }
          return g;
        });

        localStorage.setItem(`userGoals_${username}`, JSON.stringify(updatedGoals));
        addToActivityLog(`Marked goal as completed via screenshot: '${goal.title}'`);

        alert(`Goal marked as completed!\nNow place this file manually at:\n${filePath}`);
        location.reload();
      });
    }

    bottom.appendChild(uploadBox);
    box.appendChild(top);
    box.appendChild(bottom);
    completionContainer.appendChild(box);
  });
});
