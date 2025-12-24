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
  return time; // years
}

function updateSiModeFields() {
  const siType = document.getElementById("siType").value;
  const targetLabel = document.getElementById("targetLabel");
  const targetInput = document.getElementById("targetAmount");

  if (siType === "interest") {
    targetLabel.style.display = "none";
    targetInput.style.display = "none";
  } else {
    targetLabel.style.display = "block";
    targetInput.style.display = "block";
    targetLabel.textContent =
      siType === "principal"
        ? "Target total amount"
        : siType === "rate"
        ? "Target total amount"
        : "Target total amount";
  }
}

function calculateSI() {
  const currencyCode = document.getElementById("siCurrency").value;
  const symbol = getSiCurrencySymbol(currencyCode);

  const principalInput = document.getElementById("principal").value;
  const rateInput = document.getElementById("rate").value;
  const timeInput = document.getElementById("time").value;
  const timeUnit = document.getElementById("timeUnit").value;
  const siType = document.getElementById("siType").value;
  const targetInput = document.getElementById("targetAmount").value;

  const resultEl = document.getElementById("result");

  let P = parseFloat(principalInput);
  let R = parseFloat(rateInput); // annual %
  let T = parseFloat(timeInput);
  const A = targetInput ? parseFloat(targetInput) : NaN; // target total

  if (siType === "interest") {
    if (isNaN(P) || isNaN(R) || isNaN(T)) {
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

  // Find required principal (P)
  if (siType === "principal") {
    if (isNaN(R) || isNaN(years) || R <= 0 || years <= 0) {
      resultEl.innerText = "Please enter rate and time to estimate principal.";
      return;
    }
    // A = P + P*R*T/100 = P(1 + R*T/100)
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

  // Find required rate (R)
  if (siType === "rate") {
    if (isNaN(P) || isNaN(years) || P <= 0 || years <= 0) {
      resultEl.innerText = "Please enter principal and time to estimate rate.";
      return;
    }
    // A = P + P*R*T/100 → (A - P) = P*R*T/100 → R
    const interest = A - P;
    R = (interest * 100) / (P * years);
    resultEl.innerText =
      "Approximate annual interest rate needed: " +
      R.toFixed(2) +
      "%";
    return;
  }

  // Find required time (T)
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
  const btn = document.getElementById("calculateBtn");
  const siTypeSelect = document.getElementById("siType");

  if (siTypeSelect) {
    siTypeSelect.addEventListener("change", updateSiModeFields);
    updateSiModeFields();
  }

  if (btn) {
    btn.addEventListener("click", calculateSI);
  }
});
