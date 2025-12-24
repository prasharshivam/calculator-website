function calculateMortgage() {
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const tenureYears = parseFloat(document.getElementById("loanTenure").value);
  const extraPaymentInput = document.getElementById("extraPayment").value;
  const extraPayment = extraPaymentInput ? parseFloat(extraPaymentInput) : 0;

  const resultEl = document.getElementById("result");
  const breakdownEl = document.getElementById("breakdown");

  // basic validation
  if (isNaN(amount) || isNaN(annualRate) || isNaN(tenureYears) || amount <= 0 || annualRate <= 0 || tenureYears <= 0) {
    resultEl.innerText = "Please enter a valid loan amount, interest rate, and tenure.";
    breakdownEl.innerHTML = "";
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = tenureYears * 12;

  // standard EMI formula
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
              (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - amount;

  let resultText = "Estimated Monthly EMI: ₹" + emi.toFixed(2);
  resultEl.innerText = resultText;

  let breakdownHtml =
    "<p>Total payment over the full tenure: ₹" +
    totalPayment.toFixed(2) +
    "</p>" +
    "<p>Total interest paid over the full tenure: ₹" +
    totalInterest.toFixed(2) +
    "</p>";

  // If extra monthly payment is provided, simulate earlier payoff
  if (!isNaN(extraPayment) && extraPayment > 0) {
    let balance = amount;
    let monthsWithExtra = 0;
    const totalMonthlyOutflow = emi + extraPayment;

    // simple amortization loop
    while (balance > 0 && monthsWithExtra < 1000 * 12) {
      const interestForMonth = balance * monthlyRate;
      let principalPaid = totalMonthlyOutflow - interestForMonth;

      if (principalPaid <= 0) {
        // safety check: extra payment too small to reduce principal
        break;
      }

      balance -= principalPaid;
      monthsWithExtra++;
    }

    const yearsWithExtra = monthsWithExtra / 12;
    const totalPaidWithExtra = totalMonthlyOutflow * monthsWithExtra;
    const interestWithExtra = totalPaidWithExtra - amount;
    const monthsSaved = totalMonths - monthsWithExtra;

    breakdownHtml +=
      "<p style='margin-top:10px; font-weight:bold;'>With an extra monthly payment of ₹" +
      extraPayment.toFixed(2) +
      ":</p>" +
      "<p>Approximate new payoff time: " +
      yearsWithExtra.toFixed(1) +
      " years (" +
      monthsWithExtra +
      " months)</p>" +
      "<p>Approximate total interest with extra payments: ₹" +
      interestWithExtra.toFixed(2) +
      "</p>" +
      "<p>Approximate months saved compared to the original schedule: " +
      monthsSaved +
      " months</p>";
  }

  breakdownEl.innerHTML = breakdownHtml;
}

// Attach listener when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("calculateBtn");
  if (btn) {
    btn.addEventListener("click", calculateMortgage);
  }
});
