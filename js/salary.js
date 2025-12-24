function getCurrencySymbol(code) {
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

function calculateSalary() {
  const country = document.getElementById("country").value;
  const payType = document.getElementById("payType").value;
  const baseAmount = parseFloat(document.getElementById("baseAmount").value);
  const hoursPerWeekInput = document.getElementById("hoursPerWeek").value;
  const hoursPerWeek = hoursPerWeekInput ? parseFloat(hoursPerWeekInput) : 40;
  const taxRateInput = document.getElementById("taxRate").value;
  const taxRate = taxRateInput ? parseFloat(taxRateInput) : 0;

  const resultEl = document.getElementById("result");
  const breakdownEl = document.getElementById("salaryBreakdown");
  const symbol = getCurrencySymbol(country);

  if (isNaN(baseAmount) || baseAmount <= 0) {
    resultEl.innerText = "Please enter a valid amount.";
    breakdownEl.innerHTML = "";
    return;
  }

  if (payType === "hourly" && (isNaN(hoursPerWeek) || hoursPerWeek <= 0)) {
    resultEl.innerText = "Please enter valid weekly working hours for hourly pay.";
    breakdownEl.innerHTML = "";
    return;
  }

  let grossHourly = 0;
  let grossWeekly = 0;
  let grossMonthly = 0;
  let grossYearly = 0;

  // Normalise to yearly, monthly, weekly, hourly
  if (payType === "hourly") {
    grossHourly = baseAmount;
    grossWeekly = grossHourly * hoursPerWeek;
    grossYearly = grossWeekly * 52;
    grossMonthly = grossYearly / 12;
  } else if (payType === "monthly") {
    grossMonthly = baseAmount;
    grossYearly = grossMonthly * 12;
    grossWeekly = grossYearly / 52;
    grossHourly = grossWeekly / hoursPerWeek;
  } else if (payType === "yearly") {
    grossYearly = baseAmount;
    grossMonthly = grossYearly / 12;
    grossWeekly = grossYearly / 52;
    grossHourly = grossWeekly / hoursPerWeek;
  }

  // Simple net estimate using a flat deduction rate
  const effectiveTaxRate = isNaN(taxRate) || taxRate < 0 ? 0 : taxRate;
  const deductionFactor = 1 - effectiveTaxRate / 100;

  const netYearly = grossYearly * deductionFactor;
  const netMonthly = grossMonthly * deductionFactor;
  const netWeekly = grossWeekly * deductionFactor;
  const netHourly = grossHourly * deductionFactor;

  resultEl.innerText =
    "Estimated net monthly salary: " +
    symbol +
    netMonthly.toFixed(2) +
    " (after " +
    effectiveTaxRate.toFixed(1) +
    "% estimated deductions)";

  const format = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  breakdownEl.innerHTML =
    "<p><strong>Gross salary (before deductions)</strong></p>" +
    "<p>Hourly: " + symbol + format(grossHourly) + "</p>" +
    "<p>Weekly: " + symbol + format(grossWeekly) + "</p>" +
    "<p>Monthly: " + symbol + format(grossMonthly) + "</p>" +
    "<p>Yearly: " + symbol + format(grossYearly) + "</p>" +
    "<p style='margin-top:10px;'><strong>Estimated net salary (after deductions)</strong></p>" +
    "<p>Hourly: " + symbol + format(netHourly) + "</p>" +
    "<p>Weekly: " + symbol + format(netWeekly) + "</p>" +
    "<p>Monthly: " + symbol + format(netMonthly) + "</p>" +
    "<p>Yearly: " + symbol + format(netYearly) + "</p>" +
    "<p style='margin-top:10px;font-size:12px;color:#555;'>Note: These are only illustrative estimates based on the values you enter and a flat deduction rate. Actual take-home pay depends on country-specific tax rules, employer policies, and individual circumstances.</p>";
}

// Attach listener when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("calculateBtn");
  if (btn) {
    btn.addEventListener("click", calculateSalary);
  }
});
