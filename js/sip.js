// sip.js - Complete SIP Calculator with Inflation, Step-Up, and Goal-Based
function getCurrencySymbol(code) {
  const symbols = { IN: '₹', US: '$', UK: '£', EU: '€', AU: '$' };
  return symbols[code] || '₹';
}

function formatMoney(amount, currency = 'IN') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'IN' ? 'INR' : 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

function calculateStandardSIP(monthly, rate, inflation, years) {
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;
  let futureValue = 0;
  
  for (let i = 1; i <= months; i++) {
    futureValue += monthly * Math.pow(1 + monthlyRate, months - i + 1);
  }
  
  const realValue = futureValue / Math.pow(1 + inflation / 100, years);
  const totalInvested = monthly * months;
  
  return { futureValue, realValue, totalInvested, years };
}

function calculateStepUpSIP(initialMonthly, stepUpRate, returnRate, inflation, years) {
  const monthlyReturn = returnRate / 12 / 100;
  let futureValue = 0;
  let totalInvested = 0;
  let currentMonthly = initialMonthly;
  
  for (let year = 1; year <= years; year++) {
    const monthlyForYear = currentMonthly;
    for (let month = 1; month <= 12; month++) {
      const monthsRemaining = (years - year) * 12 + (12 - month + 1);
      futureValue += monthlyForYear * Math.pow(1 + monthlyReturn, monthsRemaining);
    }
    totalInvested += monthlyForYear * 12;
    currentMonthly *= (1 + stepUpRate / 100);
  }
  
  const realValue = futureValue / Math.pow(1 + inflation / 100, years);
  return { futureValue, realValue, totalInvested, years };
}

function calculateGoalSIP(targetReal, years, returnRate, inflation) {
  const targetNominal = targetReal * Math.pow(1 + inflation / 100, years);
  const monthlyRate = returnRate / 12 / 100;
  const months = years * 12;
  
  // Binary search for required monthly SIP
  let low = 0, high = targetNominal;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    let fv = 0;
    for (let m = 1; m <= months; m++) {
      fv += mid * Math.pow(1 + monthlyRate, months - m + 1);
    }
    if (fv < targetNominal) low = mid;
    else high = mid;
  }
  
  return { requiredMonthly: low, targetReal, targetNominal, years };
}

function createGrowthTable(data, type) {
  const chart = document.getElementById('growthChart');
  chart.innerHTML = `
    <h3>${type} Growth Over Time</h3>
    <table class="growth-table">
      <tr><th>Year</th><th>Monthly SIP</th><th>Total Invested</th><th>Corpus Value</th><th>Real Value</th></tr>
  `;
  
  // Simplified yearly view
  for (let year = 1; year <= data.years; year++) {
    chart.innerHTML += `<tr><td>${year}</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
  }
  chart.innerHTML += '</table>';
}

// Tab switching
document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Standard SIP
  document.getElementById('calcStandard').addEventListener('click', () => {
    const monthly = parseFloat(document.getElementById('monthlyAmt').value) || 0;
    const rate = parseFloat(document.getElementById('returnRate').value) || 12;
    const inflation = parseFloat(document.getElementById('inflationRate').value) || 6;
    const years = parseFloat(document.getElementById('investmentYears').value) || 10;
    
    const currency = document.getElementById('currency').value;
    const symbol = getCurrencySymbol(currency);
    
    const result = calculateStandardSIP(monthly, rate, inflation, years);
    
    const resultBox = document.getElementById('resultBox');
    resultBox.innerHTML = `
      <div class="result-highlight">
        <h3>₹${result.futureValue.toLocaleString()} Final Corpus</h3>
        <p><strong>Real Purchasing Power:</strong> ₹${result.realValue.toLocaleString()} (today's value)</p>
        <p><strong>Total Invested:</strong> ₹${result.totalInvested.toLocaleString()}</p>
        <p><strong>Wealth Multiple:</strong> ${(result.futureValue/result.totalInvested).toFixed(1)}x</p>
      </div>
    `;
    
    createGrowthTable(result, 'Standard SIP');
  });

  // Step-up SIP
  document.getElementById('calcStepup').addEventListener('click', () => {
    const initial = parseFloat(document.getElementById('stepMonthly').value) || 0;
    const stepUp = parseFloat(document.getElementById('stepUpRate').value) || 10;
    const rate = parseFloat(document.getElementById('stepReturn').value) || 12;
    const inflation = parseFloat(document.getElementById('stepInflation').value) || 6;
    const years = parseFloat(document.getElementById('stepYears').value) || 15;
    
    const currency = document.getElementById('stepCurrency').value;
    const result = calculateStepUpSIP(initial, stepUp, rate, inflation, years);
    
    const resultBox = document.getElementById('resultBox');
    resultBox.innerHTML = `
      <div class="result-highlight">
        <h3>₹${result.futureValue.toLocaleString()} Final Corpus</h3>
        <p><strong>Real Value:</strong> ₹${Math.round(result.realValue).toLocaleString()}</p>
        <p><strong>Total Invested:</strong> ₹${result.totalInvested.toLocaleString()}</p>
        <p><strong>Step-up Effect:</strong> ${(result.futureValue/(initial*12*years)).toFixed(1)}x better than regular</p>
      </div>
    `;
    
    createGrowthTable(result, 'Step-Up SIP');
  });

  // Goal-based
  document.getElementById('calcGoal').addEventListener('click', () => {
    const target = parseFloat(document.getElementById('targetAmount').value) || 0;
    const years = parseFloat(document.getElementById('goalYears').value) || 15;
    const rate = parseFloat(document.getElementById('goalReturn').value) || 12;
    const inflation = parseFloat(document.getElementById('goalInflation').value) || 6;
    
    const currency = document.getElementById('goalCurrency').value;
    const result = calculateGoalSIP(target, years, rate, inflation);
    
    const resultBox = document.getElementById('resultBox');
    resultBox.innerHTML = `
      <div class="result-highlight">
        <h3>Required Monthly SIP: ₹${Math.round(result.requiredMonthly).toLocaleString()}</h3>
        <p><strong>Target (today):</strong> ₹${result.targetReal.toLocaleString()}</p>
        <p><strong>Future Value Needed:</strong> ₹${Math.round(result.targetNominal).toLocaleString()}</p>
        <p><strong>Affordability Check:</strong> Start with this, increase 10% yearly</p>
      </div>
    `;
  });
});
