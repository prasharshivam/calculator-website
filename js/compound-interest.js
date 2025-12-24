function getCurrencySymbolCI(code) {
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

function calculateCompoundInterest() {
  const currencyCode = document.getElementById("currency").value;
  const principalInput = document.getElementById("principal").value;
  const rateInput = document.getElementById("rate").value;
  const timeInput = document.getElementById("time").value;
  const frequencyInput = document.getElementById("frequency").value;
  const monthlyContributionInput = document.getElementById("monthlyContribution").value;

  const resultEl = document.getElementById("result");
  const breakdownEl = document.getElementById("ciBreakdown");
  const symbol = getCurrencySymbolCI(currencyCode);

  const P = parseFloat(principalInput);
  const rAnnual = parseFloat(rateInput);
  const tYears = parseFloat(timeInput);
  const n = parseInt(frequencyInput, 10) || 1;
  const monthlyContribution = monthlyContributionInput
    ? parseFloat(monthlyContributionInput)
    : 0;

  if (isNaN(P) || isNaN(rAnnual) || isNaN(tYears) || P < 0 || rAnnual < 0 || tYears <= 0) {
    resultEl.innerText = "Please enter a valid principal, interest rate, and time period.";
    breakdownEl.innerHTML = "";
    return;
  }

  const r = rAnnual / 100;
  const totalPeriods = n * tYears;

  // Base compound interest (principal only)
  const amountPrincipalOnly = P * Math.pow(1 + r / n, n * tYears);

  let totalAmount = amountPrincipalOnly;
  let totalContributions = P;

  // If monthly contribution is provided, approximate its future value
  if (!isNaN(monthlyContribution) && monthlyContribution > 0) {
    // convert compounding to monthly for contribution growth approximation
    const monthlyRate = r / 12;
    const totalMonths = Math.round(tYears * 12);

    // standard future value of annuity formula: FV = PMT * [((1 + i)^n - 1) / i]
    const fvContrib =
      monthlyRate > 0
        ? monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
        : monthlyContribution * totalMonths;

    totalAmount += fvContrib;
    totalContributions += monthlyContribution * totalMonths;
  }

  const totalInterest = totalAmount - totalContributions;

  resultEl.innerText =
    "Estimated future value: " + symbol + totalAmount.toFixed(2);

  const format = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  breakdownEl.innerHTML =
    "<p><strong>Summary</strong></p>" +
    "<p>Initial principal: " + symbol + format(P) + "</p>" +
    "<p>Total contributions (including principal): " + symbol + format(totalContributions) + "</p>" +
    "<p>Total interest earned (approximate): " + symbol + format(totalInterest) + "</p>" +
    "<p>Compounding frequency: " +
    (n === 1
      ? "Yearly"
      : n === 2
      ? "Half‑yearly"
      : n === 4
      ? "Quarterly"
      : n === 12
      ? "Monthly"
      : "Daily") +
    "</p>" +
    "<p style='margin-top:10px;font-size:12px;color:#555;'>Note: These results are illustrative estimates based on the values and assumptions you enter. Actual returns depend on the specific product, fees, taxes, and market behaviour.</p>";
}

// Attach listener when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("calculateBtn");
  if (btn) {
    btn.addEventListener("click", calculateCompoundInterest);
  }
});
