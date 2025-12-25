// YouTube Income Calculator

function getYTCurrencySymbol(code) {
  if (code === "INR") return "₹";
  if (code === "EUR") return "€";
  return "$";
}

// Rough RPM ranges by country group and niche (USD per 1,000 views)
// Based on public 2024–2025 RPM ranges by country & category.[web:311][web:314][web:323]
const rpmTable = {
  US: {
    finance: [8, 25],
    tech: [5, 15],
    education: [4, 12],
    health: [4, 10],
    gaming: [1.5, 6],
    entertainment: [1, 5],
    kids: [1, 4]
  },
  EU: {
    finance: [6, 18],
    tech: [4, 12],
    education: [3, 9],
    health: [3, 8],
    gaming: [1.2, 5],
    entertainment: [0.8, 4],
    kids: [0.8, 3.5]
  },
  IN: {
    finance: [1.5, 6],
    tech: [1.2, 4],
    education: [1, 3.5],
    health: [0.8, 3],
    gaming: [0.4, 2],
    entertainment: [0.3, 1.5],
    kids: [0.3, 1.2]
  },
  BR: {
    finance: [1.5, 5],
    tech: [1.2, 3.5],
    education: [1, 3],
    health: [0.8, 2.5],
    gaming: [0.4, 2],
    entertainment: [0.3, 1.5],
    kids: [0.3, 1.2]
  },
  OTHER: {
    finance: [2, 8],
    tech: [1.5, 5],
    education: [1.5, 4],
    health: [1, 3.5],
    gaming: [0.5, 2.5],
    entertainment: [0.4, 2],
    kids: [0.4, 1.8]
  }
};

function getRPMRange(countryCode, niche) {
  const group = rpmTable[countryCode] || rpmTable.OTHER;
  return group[niche] || group.entertainment;
}

function convertViewsToPeriod(baseViews, period) {
  // baseViews = views for the chosen period
  let daily, monthly, yearly;
  if (period === "day") {
    daily = baseViews;
    monthly = baseViews * 30;
    yearly = baseViews * 365;
  } else if (period === "year") {
    yearly = baseViews;
    daily = Math.round(baseViews / 365);
    monthly = Math.round(baseViews / 12);
  } else {
    // month
    monthly = baseViews;
    daily = Math.round(baseViews / 30);
    yearly = baseViews * 12;
  }
  return { daily, monthly, yearly };
}

function estimateIncome(views, rpm) {
  return (views * rpm) / 1000;
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("ytCalcBtn");
  const resultBox = document.getElementById("resultBox");
  const growthChart = document.getElementById("growthChart");

  if (!btn) return;

  btn.addEventListener("click", function () {
    const viewsInput = parseFloat(document.getElementById("ytViews").value) || 0;
    const period = document.getElementById("ytPeriod").value;
    const country = document.getElementById("ytCountry").value;
    const niche = document.getElementById("ytNiche").value;
    const currency = document.getElementById("ytCurrency").value;
    const customRPM = parseFloat(document.getElementById("ytCustomRPM").value);

    if (viewsInput <= 0) {
      resultBox.innerHTML = "<p>Please enter a positive number of views.</p>";
      return;
    }

    const { daily, monthly, yearly } = convertViewsToPeriod(viewsInput, period);

    let rpmLow, rpmHigh, rpmUsedLabel;
    if (!isNaN(customRPM) && customRPM > 0) {
      rpmLow = customRPM;
      rpmHigh = customRPM;
      rpmUsedLabel = `Custom RPM: ${customRPM.toFixed(2)} per 1,000 views`;
    } else {
      const [low, high] = getRPMRange(country, niche);
      rpmLow = low;
      rpmHigh = high;
      rpmUsedLabel = `Estimated RPM range: $${low.toFixed(2)} – $${high.toFixed(2)} per 1,000 views (USD)`;
    }

    // For display currency, just convert symbol; keep numeric same (no FX)
    const symbol = getYTCurrencySymbol(currency);

    const dailyLow = estimateIncome(daily, rpmLow);
    const dailyHigh = estimateIncome(daily, rpmHigh);
    const monthlyLow = estimateIncome(monthly, rpmLow);
    const monthlyHigh = estimateIncome(monthly, rpmHigh);
    const yearlyLow = estimateIncome(yearly, rpmLow);
    const yearlyHigh = estimateIncome(yearly, rpmHigh);

    const format = (x) => symbol + x.toFixed(2).toLocaleString();

    resultBox.innerHTML = `
      <div class="result-highlight">
        <h3>Estimated YouTube Ad Income</h3>
        <p><strong>Daily:</strong> ${symbol}${dailyLow.toFixed(2)} – ${symbol}${dailyHigh.toFixed(2)}</p>
        <p><strong>Monthly:</strong> ${symbol}${monthlyLow.toFixed(2)} – ${symbol}${monthlyHigh.toFixed(2)}</p>
        <p><strong>Yearly:</strong> ${symbol}${yearlyLow.toFixed(2)} – ${symbol}${yearlyHigh.toFixed(2)}</p>
        <p>${rpmUsedLabel}</p>
        <p style="font-size:12px;margin-top:8px;">These are rough estimates based on average RPM data by country and niche. Your actual earnings may differ.</p>
      </div>
    `;

    growthChart.innerHTML = `
      <h3>Views and Income Snapshot</h3>
      <table class="growth-table">
        <tr>
          <th>Period</th>
          <th>Views</th>
          <th>Low Estimate</th>
          <th>High Estimate</th>
        </tr>
        <tr>
          <td>Daily</td>
          <td>${daily.toLocaleString()}</td>
          <td>${symbol}${dailyLow.toFixed(2)}</td>
          <td>${symbol}${dailyHigh.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Monthly</td>
          <td>${monthly.toLocaleString()}</td>
          <td>${symbol}${monthlyLow.toFixed(2)}</td>
          <td>${symbol}${monthlyHigh.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Yearly</td>
          <td>${yearly.toLocaleString()}</td>
          <td>${symbol}${yearlyLow.toFixed(2)}</td>
          <td>${symbol}${yearlyHigh.toFixed(2)}</td>
        </tr>
      </table>
    `;
  });
});
