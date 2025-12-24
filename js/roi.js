function getCurrencySymbolROI(code) {
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

function calculateROI() {
  const currencyCode = document.getElementById("currency").value;
  const symbol = getCurrencySymbolROI(currencyCode);

  const investmentInput = document.getElementById("investment").value;
  const returnsInput = document.getElementById("returns").value;
  const periodMonthsInput = document.getElementById("periodMonths").value;
  const monthlyCostInput = document.getElementById("monthlyCost").value;
  const monthlyRevenueInput = document.getElementById("monthlyRevenue").value;

  const resultEl = document.getElementById("result");
  const breakdownEl = document.getElementById("roiBreakdown");

  const investment = parseFloat(investmentInput);
  const finalValue = parseFloat(returnsInput);
  const periodMonths = periodMonthsInput ? parseFloat(periodMonthsInput) : 0;
  const monthlyCost = monthlyCostInput ? parseFloat(monthlyCostInput) : 0;
  const monthlyRevenue = monthlyRevenueInput ? parseFloat(monthlyRevenueInput) : 0;

  if (isNaN(investment) || isNaN(finalValue) || investment === 0) {
    resultEl.innerText = "Please enter a valid initial cost and final value.";
    breakdownEl.innerHTML = "";
    return;
  }

  // Basic ROI on one‑time investment
  const profit = finalValue - investment;
  const roiPercent = (profit / investment) * 100;

  let mainLine =
    "ROI: " + roiPercent.toFixed(2) + "% (" +
    (profit >= 0 ? "profit" : "loss") +
    " of " + symbol + Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 2 }) +
    ")";

  resultEl.innerText = mainLine;

  let breakdownHtml =
    "<p><strong>One‑time investment view</strong></p>" +
    "<p>Initial cost: " + symbol + investment.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
    "<p>Final value: " + symbol + finalValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
    "<p>Profit / loss: " + symbol + profit.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
    "<p>ROI: " + roiPercent.toFixed(2) + "%</p>";

  // Annualised ROI estimate if period is given
  if (!isNaN(periodMonths) && periodMonths > 0) {
    const years = periodMonths / 12;
    // Simple annualised ROI (not IRR, but fine as an estimate)
    const annualised = (Math.pow(1 + roiPercent / 100, 1 / years) - 1) * 100;

    breakdownHtml +=
      "<p style='margin-top:10px;'><strong>Time‑adjusted view</strong></p>" +
      "<p>Time period: " + periodMonths.toFixed(1) + " months</p>" +
      "<p>Approximate annualised ROI: " + annualised.toFixed(2) + "% per year</p>";
  }

  // Optional monthly campaign / subscription view
  if (!isNaN(monthlyCost) && !isNaN(monthlyRevenue) &&
      (monthlyCost > 0 || monthlyRevenue > 0) &&
      periodMonths > 0) {

    const totalCost = monthlyCost * periodMonths;
    const totalRevenue = monthlyRevenue * periodMonths;
    const campaignProfit = totalRevenue - totalCost;
    const campaignRoiPercent = totalCost !== 0 ? (campaignProfit / totalCost) * 100 : 0;

    breakdownHtml +=
      "<p style='margin-top:10px;'><strong>Recurring campaign view</strong></p>" +
      "<p>Total cost over " + periodMonths.toFixed(1) + " months: " +
      symbol + totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
      "<p>Total revenue / value over the same period: " +
      symbol + totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
      "<p>Profit / loss from recurring activity: " +
      symbol + campaignProfit.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "</p>" +
      "<p>ROI on recurring activity: " + campaignRoiPercent.toFixed(2) + "%</p>";
  }

  breakdownHtml +=
    "<p style='margin-top:10px;font-size:12px;color:#555;'>These figures are simplified estimates based on the numbers you enter. Real‑world performance can differ due to taxes, fees, discounts, timing of cash flows, and other business factors.</p>";

  breakdownEl.innerHTML = breakdownHtml;
}

// Attach listener when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("calculateBtn");
  if (btn) {
    btn.addEventListener("click", calculateROI);
  }
});
