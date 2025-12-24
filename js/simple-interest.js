function getSiCurrencySymbol(code) {
  switch (code) {
    case "US":
      return "$";
    case "UK":
      return "£";
    case "EU":
      return "€";
    case "AU":
      return "$";
    case "IN":
    default:
      return "₹";
  }
}

function normalizeYears(time, unit) {
  if (unit === "months") return time / 12;
  if (unit === "days") return time / 365;
  return time;
}

function setDisplayForClass(className, show) {
  document.querySelectorAll("." + className).forEach(function (el) {
    el.style.display = show ? "" : "none";
  });
}

function updateSiModeFields() {
  const siType = document.getElementById("siType").value;
  const targetLabel = document.getElementById("targetLabel");
  const targetInput = document.getElementById("targetAmount");

  // Reset all to visible
  setDisplayForClass("field-principal", true);
  setDisplayForClass("field-rate", true);
  setDisplayForClass("field-time", true);
  setDisplayForClass("field-target", false);
  targetLabel.style.display = "none";
  targetInput.style.display = "none";

  if (siType === "interest") {
    // Need P, R, T only
    // target stays hidden
  } else if (siType === "principal") {
    // Find P → need R, T, target A
    setDisplayForClass("field-principal", false);
    setDisplayForClass("field-target", true);
    targetLabel.textContent = "Target total amount";
  } else if (siType === "rate") {
    // Find R → need P, T, target A
    setDisplayForClass("field-rate", false);
    setDisplayForClass("field-target", true);
    targetLabel.textContent = "Target total amount";
  } else if (siType === "time") {
    // Find T → need P, R, target A (time input is not used)
    setDisplayForClass("field-time", false);
    setDisplayForClass("field-target", true);
    targetLabel.textContent = "Target total amount";
  }

  // Ensure label + input for target are visible when needed
  if (siType !== "interest") {
    targetLabel.style.display = "";
    targetInput.style.display = "";
  }

  // Clear any previous result when mode changes
  const resultEl = document.getElementById("result");
  if (resultEl) resultEl.innerText = "";
}

function calculateSI() {
  const currencyCode = document.getElementById("siCurrency").value;
  const symbol = getSiCurrencySymbol(currencyCode);

  const siType = document.getElementById("siType").value;
  const principalInput = document.getElementById("principal").value;
  const rateInput = document.getElementById("rate").value;
  const timeInput = document.getElementById("time").value;
  const timeUnit = document.getElementById("timeUnit").value;
  const targetInput = document.getElementById("targetAmount").value;

  const resultEl = document.getElementById("result");

  let P = parseFloat(principalInput);
  let R = parseFloat(rateInput);
  let T = parseFloat(timeInput);
  const A = targetInput ? parseFloat(targetInput) : NaN;

  if (siType === "interest") {
    if (isNaN(P) || isNaN(R) || isNaN(T) || P <= 0 || R <= 0 || T <= 0) {
      resultEl.innerText = "Please enter principal, rate, and time.";
      return;
    }
    const years = normalizeYears(T, timeUnit);
    const interest = (P * R * years) / 100;
    const total = P + interest;
    resultEl.innerText =
      "Simple interest: " +
      symbol +
      interest.toFixed(2) +
      ", Total amount: " +
      symbol +
      total.toFixed(2);
    return;
  }

  if (isNaN(A) || A <= 0) {
    resultEl.innerText = "Please enter a valid target total amount.";
    return;
  }

  const years = !isNaN(T) && T > 0 ? normalizeYears(T, timeUnit) : NaN;

  if (siType === "principal") {
    if (isNaN(R) || isNaN(years) || R <= 0 || years <= 0) {
      resultEl.innerText = "Please enter rate and time to estimate principal.";
      return;
    }
    P = A / (1 + (R * years) / 100);
    const interest = A - P;
    resultEl.innerText =
      "Approximate principal needed: " +
      symbol +
      P.toFixed(2) +
      " (interest: " +
      symbol +
      interest.toFixed(2) +
      ")";
    return;
  }

  if (siType === "rate") {
    if (isNaN(P) || isNaN(years) || P <= 0 || years <= 0) {
      resultEl.innerText = "Please enter principal and time to estimate rate.";
      return;
    }
    const interest = A - P;
    R = (interest * 100) / (P * years);
    resultEl.innerText =
      "Approximate annual interest rate needed: " +
      R.toFixed(2) +
      "%";
    return;
  }

  if (siType === "time") {
    if (isNaN(P) || isNaN(R) || P <= 0 || R <= 0) {
      resultEl.innerText = "Please enter principal and rate to estimate time.";
      return;
    }
    const interest = A - P;
    const yearsNeeded = (interest * 100) / (P * R);

    let timeText = yearsNeeded.toFixed(2) + " years";
    if (timeUnit === "months") {
      const monthsNeeded = yearsNeeded * 12;
      timeText = monthsNeeded.toFixed(1) + " months";
    } else if (timeUnit === "days") {
      const daysNeeded = yearsNeeded * 365;
      timeText = Math.round(daysNeeded) + " days";
    }

    resultEl.innerText =
      "Approximate time needed to reach the target amount: " + timeText;
    return;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const siTypeSelect = document.getElementById("siType");
  const btn = document.getElementById("calculateBtn");

  if (siTypeSelect) {
    siTypeSelect.addEventListener("change", updateSiModeFields);
    updateSiModeFields();
  }

  if (btn) {
    btn.addEventListener("click", calculateSI);
  }
});
