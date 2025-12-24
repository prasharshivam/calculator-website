function diffYMD(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function setActiveAgeMode(mode) {
  document.querySelectorAll(".age-tab").forEach(function (btn) {
    const m = btn.getAttribute("data-mode");
    if (m === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".age-tool").forEach(function (section) {
    section.style.display = section.id === mode ? "" : "none";
  });

  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("ageDetails");
  if (resultEl) resultEl.innerText = "";
  if (detailsEl) detailsEl.innerHTML = "";
}

function calculateAgeTools() {
  const activeTab = document.querySelector(".age-tab.active");
  const mode = activeTab ? activeTab.getAttribute("data-mode") : "dob-to-today";

  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("ageDetails");

  let message = "";
  let details = "";

  if (mode === "dob-to-today") {
    const dobVal = document.getElementById("dobToday").value;
    if (!dobVal) {
      resultEl.innerText = "Please select date of birth.";
      detailsEl.innerHTML = "";
      return;
    }
    const dob = new Date(dobVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dob > today) {
      resultEl.innerText = "Date of birth cannot be in the future.";
      detailsEl.innerHTML = "";
      return;
    }

    const { years, months, days } = diffYMD(dob, today);
    message =
      "Age as of today: " +
      years +
      " years, " +
      months +
      " months, " +
      days +
      " days.";

  } else if (mode === "dob-to-ref") {
    const dobVal = document.getElementById("dobRef").value;
    const refVal = document.getElementById("refDate").value;

    if (!dobVal || !refVal) {
      resultEl.innerText = "Please select both date of birth and reference date.";
      detailsEl.innerHTML = "";
      return;
    }

    const dob = new Date(dobVal);
    const ref = new Date(refVal);
    ref.setHours(0, 0, 0, 0);

    if (dob > ref) {
      resultEl.innerText = "Date of birth should be before the reference date.";
      detailsEl.innerHTML = "";
      return;
    }

    const { years, months, days } = diffYMD(dob, ref);
    message =
      "Age on " +
      ref.toDateString() +
      ": " +
      years +
      " years, " +
      months +
      " months, " +
      days +
      " days.";

  } else if (mode === "diff-between") {
    const startVal = document.getElementById("startDate").value;
    const endVal = document.getElementById("endDate").value;

    if (!startVal || !endVal) {
      resultEl.innerText = "Please select both start and end dates.";
      detailsEl.innerHTML = "";
      return;
    }

    const start = new Date(startVal);
    const end = new Date(endVal);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      resultEl.innerText = "Start date should be before the end date.";
      detailsEl.innerHTML = "";
      return;
    }

    const { years, months, days } = diffYMD(start, end);
    message =
      "Difference: " +
      years +
      " years, " +
      months +
      " months, " +
      days +
      " days.";
  }

  resultEl.innerText = message;
  detailsEl.innerHTML =
    "<p style='font-size:12px;color:#555;margin-top:6px;'>This calculator uses calendar dates and takes leap years into account to show the difference in years, months, and days.</p>";
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".age-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const mode = btn.getAttribute("data-mode");
      setActiveAgeMode(mode);
    });
  });

  setActiveAgeMode("dob-to-today");

  const btnCalc = document.getElementById("calculateBtn");
  if (btnCalc) {
    btnCalc.addEventListener("click", calculateAgeTools);
  }
});
