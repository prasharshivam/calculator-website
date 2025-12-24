function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toDateString();
}

function calculateDueDateFromLmp(lmpDate) {
  return addDays(lmpDate, 280);
}

function setActiveModeTab(mode) {
  document.querySelectorAll(".preg-tab").forEach(function (btn) {
    const m = btn.getAttribute("data-mode");
    if (m === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".preg-tool").forEach(function (section) {
    if (section.id === mode) {
      section.style.display = "";
    } else {
      section.style.display = "none";
    }
  });

  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("pregDetails");
  if (resultEl) resultEl.innerText = "";
  if (detailsEl) detailsEl.innerHTML = "";
}

function calculatePregnancy() {
  const activeTab = document.querySelector(".preg-tab.active");
  const mode = activeTab ? activeTab.getAttribute("data-mode") : "lmp-to-due";

  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("pregDetails");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let message = "";
  let detailsHtml = "";

  if (mode === "lmp-to-due") {
    const lmpVal = document.getElementById("lmp").value;
    if (!lmpVal) {
      resultEl.innerText = "Please select the first day of your last menstrual period (LMP).";
      detailsEl.innerHTML = "";
      return;
    }
    const lmpDate = new Date(lmpVal);
    const due = calculateDueDateFromLmp(lmpDate);

    message = "Estimated due date: " + formatDate(due);

    const diffDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      detailsHtml =
        "<p>Approximate current pregnancy age: " +
        weeks +
        " weeks " +
        days +
        " days.</p>";
    }
  } else if (mode === "conception-to-due") {
    const concVal = document.getElementById("conceptionDate").value;
    if (!concVal) {
      resultEl.innerText = "Please select an approximate conception date.";
      detailsEl.innerHTML = "";
      return;
    }
    const concDate = new Date(concVal);
    const due = addDays(concDate, 266);

    message = "Estimated due date: " + formatDate(due);

    const diffDays = Math.floor((today - concDate) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      detailsHtml =
        "<p>Approximate time since conception: " +
        weeks +
        " weeks " +
        days +
        " days.</p>";
    }
  } else if (mode === "lmp-to-week") {
    const lmpVal = document.getElementById("lmpWeek").value;
    if (!lmpVal) {
      resultEl.innerText = "Please select the first day of your last menstrual period (LMP).";
      detailsEl.innerHTML = "";
      return;
    }
    const lmpDate = new Date(lmpVal);
    const diffDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      resultEl.innerText = "The selected LMP date is in the future. Please choose a valid date.";
      detailsEl.innerHTML = "";
      return;
    }

    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    message =
      "Approximate pregnancy age: " + weeks + " weeks " + days + " days.";

    const due = calculateDueDateFromLmp(lmpDate);
    detailsHtml =
      "<p>Estimated due date based on this LMP: " +
      formatDate(due) +
      ".</p>";
  } else if (mode === "due-to-lmp") {
    const dueVal = document.getElementById("dueDate").value;
    if (!dueVal) {
      resultEl.innerText = "Please select an estimated due date.";
      detailsEl.innerHTML = "";
      return;
    }
    const dueDate = new Date(dueVal);
    const lmpDate = addDays(dueDate, -280);

    message =
      "Approximate first day of last menstrual period (LMP): " +
      formatDate(lmpDate);

    const diffDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      detailsHtml =
        "<p>Based on this estimate, current pregnancy age would be about " +
        weeks +
        " weeks " +
        days +
        " days.</p>";
    }
  }

  resultEl.innerText = message;
  detailsEl.innerHTML =
    detailsHtml +
    "<p style='margin-top:8px;font-size:12px;color:#555;'>These dates are approximate and for general information only. Always rely on tests, scans, and guidance from your healthcare team for medical decisions.</p>";
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".preg-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const mode = btn.getAttribute("data-mode");
      setActiveModeTab(mode);
    });
  });

  setActiveModeTab("lmp-to-due");

  const btnCalc = document.getElementById("calculateBtn");
  if (btnCalc) {
    btnCalc.addEventListener("click", calculatePregnancy);
  }
});
