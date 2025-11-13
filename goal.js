document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector(".add-btn");
  const [titleInput, descInput, dateInput, timeInput] = document.querySelectorAll(".goal-input");
  const categorySelect = document.getElementById("goal-category");
  const allGoals = document.getElementById("all-goals");
  const currentGoals = document.getElementById("current-goals");

  const userEmail = localStorage.getItem("username");
  if (!userEmail) {
    alert("User not logged in.");
    window.location.href = "login.html";
    return;
  }

  const STORAGE_KEY = `allGoalsData_${userEmail}`;
  const CURRENT_KEY = `userGoals_${userEmail}`;
  const LOG_KEY = `activityLog_${userEmail}`; // ✅ Per-user log key

  // ✅ Activity Log Helper
  function addToActivityLog(message) {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    const timestamp = new Date().toLocaleString();
    log.push(`[${timestamp}] ${message}`);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  }

  function saveGoalsToStorage() {
    const current = [];
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const previousCurrent = JSON.parse(localStorage.getItem(CURRENT_KEY)) || [];

    currentGoals.querySelectorAll(".goal-items").forEach(goalDiv => {
      const id = goalDiv.dataset.id;
      const fromAll = all.find(g => g.id === id);
      const fromCurrent = previousCurrent.find(g => g.id === id);

      if (fromAll || fromCurrent) {
        current.push({
          id,
          title: fromAll?.title || fromCurrent?.title || "",
          desc: fromAll?.desc || fromCurrent?.desc || "",
          category: fromAll?.category || fromCurrent?.category || "General",
          status: fromCurrent?.status ?? fromAll?.status ?? "Pending",
          screenshot: fromCurrent?.screenshot ?? fromAll?.screenshot ?? null,
          completedAt: fromCurrent?.completedAt ?? fromAll?.completedAt ?? null,
          owner: userEmail
        });
      }
    });

    localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
  }

  function loadGoalsFromStorage() {
    const allGoalsData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const currentGoalsData = JSON.parse(localStorage.getItem(CURRENT_KEY)) || [];

    allGoalsData.forEach(goal => {
      const g = createGoalForAll(goal);
      allGoals.appendChild(g);
    });

    currentGoalsData.forEach(goal => {
      const g = createGoalForCurrent(goal);
      currentGoals.appendChild(g);
    });
  }

  function createGoalForAll(goal) {
    const goalDiv = document.createElement("div");
    goalDiv.className = "goal-items";
    goalDiv.dataset.id = goal.id;

    const [descOnly, dt] = goal.desc.split(" | ");
    const [date, time] = (dt || "2025-12-31 12:00").split(" ");

    const text = document.createElement("span");
    text.innerHTML = `
      <strong>${goal.title}</strong><br>
      <small>${descOnly} | ${date} ${time}</small><br>
      <span class="goal-category">📁 ${goal.category}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "goal-action";

    const addToCurrent = document.createElement("i");
    addToCurrent.className = "fas fa-plus-circle";
    addToCurrent.title = "Add to Current";
    addToCurrent.style.color = "green";
    addToCurrent.onclick = () => {
      const exists = [...currentGoals.children].some(el => el.dataset.id === goal.id);
      if (!exists) {
        const goalCopy = createGoalForCurrent(goal);
        currentGoals.appendChild(goalCopy);
        saveGoalsToStorage();
        addToActivityLog(`Added goal to Current: ${goal.title}`);
      }
    };

    const editIcon = document.createElement("i");
    editIcon.className = "fas fa-edit";
    editIcon.title = "Edit";
    editIcon.onclick = () => {
      const [descOnly, dt] = goal.desc.split(" | ");
      const [date, time] = (dt || "2025-12-31 12:00").split(" ");
      const newTitle = prompt("Edit Title:", goal.title);
      const newDesc = prompt("Edit Description:", descOnly);
      const newDate = prompt("Edit Date:", date);
      const newTime = prompt("Edit Time:", time);

      if (newTitle && newDesc && newDate && newTime) {
        goal.title = newTitle;
        goal.desc = `${newDesc} | ${newDate} ${newTime}`;
        updateGoalInStorage(goal);
        addToActivityLog(`Edited goal: ${goal.title}`);
        location.reload();
      }
    };

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-trash-alt";
    deleteIcon.title = "Delete";
    deleteIcon.onclick = () => {
      const goalId = goal.id;
      goalDiv.remove();

      let allSaved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      let currentSaved = JSON.parse(localStorage.getItem(CURRENT_KEY)) || [];

      allSaved = allSaved.filter(g => g.id !== goalId);
      currentSaved = currentSaved.filter(g => g.id !== goalId);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSaved));
      localStorage.setItem(CURRENT_KEY, JSON.stringify(currentSaved));

      currentGoals.querySelectorAll(".goal-items").forEach(item => {
        if (item.dataset.id === goalId) item.remove();
      });

      addToActivityLog(`Deleted goal: ${goal.title}`);
    };

    actions.appendChild(addToCurrent);
    actions.appendChild(editIcon);
    actions.appendChild(deleteIcon);

    goalDiv.appendChild(text);
    goalDiv.appendChild(actions);

    return goalDiv;
  }

  function createGoalForCurrent(goal) {
    const goalDiv = document.createElement("div");
    goalDiv.className = "goal-items";
    goalDiv.dataset.id = goal.id;

    const [descOnly, dt] = goal.desc.split(" | ");
    const [date, time] = (dt || "2025-12-31 12:00").split(" ");

    const text = document.createElement("span");
    text.innerHTML = `
      <strong>${goal.title}</strong><br>
      <small>${descOnly} | ${date} ${time}</small><br>
      <span class="goal-category">📁 ${goal.category}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "goal-action";

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-trash-alt";
    deleteIcon.title = "Remove from Current";
    deleteIcon.onclick = () => {
      goalDiv.remove();
      let currentSaved = JSON.parse(localStorage.getItem(CURRENT_KEY)) || [];
      currentSaved = currentSaved.filter(g => g.id !== goal.id);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(currentSaved));
      addToActivityLog(`Removed goal from Current: ${goal.title}`);
    };

    actions.appendChild(deleteIcon);
    goalDiv.appendChild(text);
    goalDiv.appendChild(actions);

    return goalDiv;
  }

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const category = categorySelect.value;

    if (!title || !desc || !date || !time || !category) {
      alert("Please fill all the fields (Title, Description, Date, Time, Category)!");
      return;
    }

    const fullDesc = `${desc} | ${date} ${time}`;
    const goalId = `${Date.now() + Math.random()}`;

    const goalObj = {
      id: goalId,
      title,
      desc: fullDesc,
      category,
      owner: userEmail,
      status: "Pending",
      screenshot: null,
      completedAt: null
    };

    const goalDiv = createGoalForAll(goalObj);
    allGoals.appendChild(goalDiv);

    const allSaved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    allSaved.push(goalObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSaved));

    addToActivityLog(`Added new goal: ${title}`);

    titleInput.value = "";
    descInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    categorySelect.value = "General";
  });

  function updateGoalInStorage(goal) {
    let all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    all = all.map(g => g.id === goal.id ? goal : g);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  loadGoalsFromStorage();
});
