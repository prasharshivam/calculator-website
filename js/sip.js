// SIP CALCULATOR JS

function getCurrencySymbol(code) {
  switch (code) {
    case "US": return "$";
    case "UK": return "£";
    case "EU": return "€";
    case "AU": return "$";
    case "IN":
    default:  return "₹";
  }
}

// Convert annual return to monthly effective rate
// r_monthly = (1 + r_annual)^(1/12) - 1  [web:228][web:233]
function annualToMonthlyRate(annualRatePercent) {
  const r = annualRatePercent / 100;
  return Math.pow(1 + r, 1 / 12) - 1;
}

// Standard SIP future value with monthly contributions [web:227][web:233]
function calculateStandardSIP(monthly, annualReturn, inflation, years) {
  const monthlyRate = annualToMonthlyRate(annualReturn);
  const months = Math.round(years * 12);

  let fv = 0;
  for (let i = 1; i <= months; i++) {
    const remaining = months - i + 1;
    fv += monthly * Math.pow(1 + monthlyRate, remaining);
  }

  const realValue = fv / Math.pow(1 + inflation / 100, years);
  const invested = monthly * months;

  return { futureValue: fv, realValue, totalInvested: invested, years };
}

// Step-up SIP: monthly SIP increases once per year by stepUp% [web:231][web:234]
function calculateStepUpSIP(initialMonthly, stepUpPercent, annualReturn, inflation, years) {
  const monthlyRate = annualToMonthlyRate(annualReturn);
  let fv = 0;
  let invested = 0;
  let currentMonthly = initialMonthly;
  const totalYears = Math.round(years);

  for (let y = 1; y <= totalYears; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthsRemaining = (totalYears - y) * 12 + (12 - m + 1);
      fv += currentMonthly * Math.pow(1 + monthlyRate, monthsRemaining);
      invested += currentMonthly;
    }
    currentMonthly *= (1 + stepUpPercent / 100);
  }

  const realValue = fv / Math.pow(1 + inflation / 100, years);
  return { futureValue: fv, realValue, totalInvested: invested, years: totalYears };
}

// Goal-based reverse SIP using binary search on monthly SIP amount [web:235][web:241]
function calculateGoalSIP(targetToday, years, annualReturn, inflation) {
  const targetNominal = targetToday * Math.pow(1 + inflation / 100, years);
  const monthlyRate = annualToMonthlyRate(annualReturn);
  const months = Math.round(years * 12);

  let low = 0;
  let high = targetNominal;
  for (let i = 0; i < 60; i++) { // sufficient iterations
    const mid = (low + high) / 2;
    let fv = 0;
    for (let m = 1; m <= months; m++) {
      const remaining = months - m + 1;
      fv += mid * Math.pow(1 + monthlyRate, remaining);
    }
    if (fv < targetNominal) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return {
    requiredMonthly: low,
    targetReal: targetToday,
    targetNominal,
    years
  };
}

// Simple yearly stub growth table (can be enhanced later)
function renderGrowthStub(years, label) {
  const chart = document.getElementById("growthChart");
  if (!chart) return;
  chart.innerHTML = `
    <h3>${label} (Yearly View)</h3>
    <table class="growth-table">
      <tr>
        <th>Year</th>
        <th>Notes</th>
      </tr>
      ${Array.from({ length: Math.round(years) }, (_, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>Year ${i + 1} contribution and compounding included in final result.</td>
        </tr>
      `).join("")}
    </table>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  // Tabs
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const id = btn.getAttribute("data-tab");
      const tab = document.getElementById(id);
      if (tab) tab.classList.add("active");
    });
  });

  const resultBox = document.getElementById("resultBox");

  // Standard SIP handler
  const stdBtn = document.getElementById("calcStandard");
  if (stdBtn) {
    stdBtn.addEventListener("click", function () {
      const monthly = parseFloat(document.getElementById("monthlyAmt").value) || 0;
      const annualReturn = parseFloat(document.getElementById("returnRate").value) || 0;
      const inflation = parseFloat(document.getElementById("inflationRate").value) || 0;
      const years = parseFloat(document.getElementById("investmentYears").value) || 0;

      if (monthly <= 0 || annualReturn <= 0 || years <= 0) {
        resultBox.innerHTML = "<p>Please enter a positive SIP amount, return rate, and duration.</p>";
        return;
      }

      const res = calculateStandardSIP(monthly, annualReturn, inflation, years);

      resultBox.innerHTML = `
        <div class="result-highlight">
          <h3>Final Corpus: ${getCurrencySymbol("IN")}${res.futureValue.toLocaleString()}</h3>
          <p><strong>Real Purchasing Power:</strong> ${getCurrencySymbol("IN")}${Math.round(res.realValue).toLocaleString()} in today's money</p>
          <p><strong>Total Invested:</strong> ${getCurrencySymbol("IN")}${res.totalInvested.toLocaleString()}</p>
          <p><strong>Wealth Multiple:</strong> ${(res.futureValue / res.totalInvested).toFixed(1)}× of what you invested</p>
        </div>
      `;

      renderGrowthStub(res.years, "Standard SIP Growth");
    });
  }

  // Step-up SIP handler
  const stepBtn = document.getElementById("calcStepup");
  if (stepBtn) {
    stepBtn.addEventListener("click", function () {
      const initial = parseFloat(document.getElementById("stepMonthly").value) || 0;
      const stepUp = parseFloat(document.getElementById("stepUpRate").value) || 0;
      const annualReturn = parseFloat(document.getElementById("stepReturn").value) || 0;
      const inflation = parseFloat(document.getElementById("stepInflation").value) || 0;
      const years = parseFloat(document.getElementById("stepYears").value) || 0;

      if (initial <= 0 || annualReturn <= 0 || years <= 0) {
        resultBox.innerHTML = "<p>Please enter a positive initial SIP, return rate, and duration.</p>";
        return;
      }

      const res = calculateStepUpSIP(initial, stepUp, annualReturn, inflation, years);

      resultBox.innerHTML = `
        <div class="result-highlight">
          <h3>Final Corpus (Step-Up): ${getCurrencySymbol("IN")}${res.futureValue.toLocaleString()}</h3>
          <p><strong>Real Value:</strong> ${getCurrencySymbol("IN")}${Math.round(res.realValue).toLocaleString()} in today's money</p>
          <p><strong>Total Invested:</strong> ${getCurrencySymbol("IN")}${res.totalInvested.toLocaleString()}</p>
          <p><strong>Average Monthly SIP Over Period:</strong> ${getCurrencySymbol("IN")}${Math.round(res.totalInvested / (res.years * 12)).toLocaleString()}</p>
        </div>
      `;

      renderGrowthStub(res.years, "Step-Up SIP Growth");
    });
  }

  // Goal-based SIP handler
  const goalBtn = document.getElementById("calcGoal");
  if (goalBtn) {
    goalBtn.addEventListener("click", function () {
      const target = parseFloat(document.getElementById("targetAmount").value) || 0;
      const years = parseFloat(document.getElementById("goalYears").value) || 0;
      const annualReturn = parseFloat(document.getElementById("goalReturn").value) || 0;
      const inflation = parseFloat(document.getElementById("goalInflation").value) || 0;

      if (target <= 0 || annualReturn <= 0 || years <= 0) {
        resultBox.innerHTML = "<p>Please enter a positive target amount, return rate, and duration.</p>";
        return;
      }

      const res = calculateGoalSIP(target, years, annualReturn, inflation);

      const totalInvestedApprox = res.requiredMonthly * years * 12;

      resultBox.innerHTML = `
        <div class="result-highlight">
          <h3>Required Monthly SIP: ${getCurrencySymbol("IN")}${Math.round(res.requiredMonthly).toLocaleString()}</h3>
          <p><strong>Goal in Today's Money:</strong> ${getCurrencySymbol("IN")}${res.targetReal.toLocaleString()}</p>
          <p><strong>Future Value Needed:</strong> ${getCurrencySymbol("IN")}${Math.round(res.targetNominal).toLocaleString()}</p>
          <p><strong>Approx. Total Invested:</strong> ${getCurrencySymbol("IN")}${Math.round(totalInvestedApprox).toLocaleString()}</p>
        </div>
      `;

      renderGrowthStub(res.years, "Goal-Based SIP Timeline");
    });
  }
});
