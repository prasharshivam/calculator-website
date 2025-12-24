// Tab handling (reuses .age-tab / .age-tool styles)

function setActive401kMode(mode) {
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
    const detailsEl = document.getElementById("kDetails");
    if (resultEl) resultEl.innerText = "";
    if (detailsEl) detailsEl.innerHTML = "";
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".age-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const mode = btn.getAttribute("data-mode");
        setActive401kMode(mode);
      });
    });
  
    setActive401kMode("growth");
  
    const btnCalc = document.getElementById("calculateBtn");
    if (btnCalc) {
      btnCalc.addEventListener("click", calculate401k);
    }
  });
  
  // ---------- Core helper functions ----------
  
  function calcAnnualContribution(salary, empPct, matchPct, matchLimitPct) {
    const employee = salary * (empPct / 100);
  
    const cappedPct = Math.min(empPct, matchLimitPct);
    const employer =
      salary * (matchPct / 100) * (cappedPct > 0 ? 1 : 0);
  
    return { employee, employer, total: employee + employer };
  }
  
  function futureValueSeries(currentBalance, annualContribution, years, annualReturn) {
    const r = annualReturn / 100;
    let balance = currentBalance;
  
    for (let i = 0; i < years; i++) {
      balance = balance * (1 + r) + annualContribution;
    }
    return balance;
  }
  
  function formatMoney(value) {
    return "$" + value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  
  // ---------- Growth projection ----------
  
  function calculateGrowth() {
    const currentBalance = parseFloat(document.getElementById("currentBalance").value) || 0;
    const salary = parseFloat(document.getElementById("annualSalary").value);
    const empPct = parseFloat(document.getElementById("employeePercent").value);
    const matchPct = parseFloat(document.getElementById("employerMatchPercent").value) || 0;
    const matchLimit = parseFloat(document.getElementById("employerMatchLimit").value) || 0;
    const years = parseFloat(document.getElementById("growthYears").value);
    const returnPct = parseFloat(document.getElementById("annualReturn").value);
  
    if (!salary || !empPct || !years || !returnPct) {
      return { error: "Please enter salary, contribution %, years and return rate." };
    }
  
    const contrib = calcAnnualContribution(salary, empPct, matchPct, matchLimit);
    const fv = futureValueSeries(currentBalance, contrib.total, years, returnPct);
  
    const totalEmployee = contrib.employee * years;
    const totalEmployer = contrib.employer * years;
    const totalContrib = totalEmployee + totalEmployer + currentBalance;
    const growth = fv - totalContrib;
  
    return {
      fv,
      totalEmployee,
      totalEmployer,
      totalContrib,
      growth,
      years
    };
  }
  
  // ---------- Retirement balance ----------
  
  function calculateRetirement() {
    const currentAge = parseFloat(document.getElementById("currentAge").value);
    const retireAge = parseFloat(document.getElementById("retireAge").value);
    const currentBalance = parseFloat(document.getElementById("currentBalance2").value) || 0;
    const salary = parseFloat(document.getElementById("annualSalary2").value);
    const empPct = parseFloat(document.getElementById("employeePercent2").value);
    const matchPct = parseFloat(document.getElementById("employerMatchPercent2").value) || 0;
    const matchLimit = parseFloat(document.getElementById("employerMatchLimit2").value) || 0;
    const returnPct = parseFloat(document.getElementById("annualReturn2").value);
  
    if (!currentAge || !retireAge || retireAge <= currentAge) {
      return { error: "Please enter a current age and a higher retirement age." };
    }
    if (!salary || !empPct || !returnPct) {
      return { error: "Please enter salary, contribution % and return rate." };
    }
  
    const years = retireAge - currentAge;
    const contrib = calcAnnualContribution(salary, empPct, matchPct, matchLimit);
    const fv = futureValueSeries(currentBalance, contrib.total, years, returnPct);
  
    const totalEmployee = contrib.employee * years;
    const totalEmployer = contrib.employer * years;
    const totalContrib = totalEmployee + totalEmployer + currentBalance;
    const growth = fv - totalContrib;
  
    return {
      fv,
      totalEmployee,
      totalEmployer,
      totalContrib,
      growth,
      years,
      currentAge,
      retireAge
    };
  }
  
  // ---------- Early withdrawal + IRS exceptions ----------
  
  function calculateWithdrawal() {
    const amount = parseFloat(document.getElementById("withdrawAmount").value);
    const age = parseFloat(document.getElementById("ageNow").value);
    const fedRate = parseFloat(document.getElementById("federalTaxRate").value) || 0;
    const stateRate = parseFloat(document.getElementById("stateTaxRate").value) || 0;
    const exceptionType = document.getElementById("exceptionType").value;
  
    if (!amount || !age) {
      return { error: "Please enter withdrawal amount and your age." };
    }
  
    const federalTax = amount * (fedRate / 100);
    const stateTax = amount * (stateRate / 100);
  
    let penaltyRate = 0;
    let penaltyReason = "";
  
    if (age < 59.5) {
      penaltyRate = 0.10;
      penaltyReason =
        "Standard 10% early withdrawal penalty applies because age is below 59½.";
  
      if (
        exceptionType === "disability" ||
        exceptionType === "medical" ||
        exceptionType === "separation55" ||
        exceptionType === "substantiallyEqual"
      ) {
        penaltyRate = 0;
        penaltyReason =
          "This scenario is often associated with an IRS exception that may reduce or remove the 10% early withdrawal penalty when all requirements are met. Regular income tax usually still applies to the distribution.";
      } else if (exceptionType === "firstHome") {
        penaltyReason =
          "Certain first‑time home purchase withdrawals may qualify for a penalty exception from IRAs, but 401(k) plans have different rules. Check with your plan administrator and a tax professional.";
      }
    } else {
      penaltyReason =
        "Age 59½ or older is typically beyond the standard early withdrawal penalty, although regular income tax still applies.";
    }
  
    const penalty = amount * penaltyRate;
    const totalCost = federalTax + stateTax + penalty;
    const netAmount = amount - totalCost;
  
    return {
      amount,
      federalTax,
      stateTax,
      penalty,
      totalCost,
      netAmount,
      penaltyReason,
      penaltyRate
    };
  }
  
  // ---------- Main dispatcher ----------
  
  function calculate401k() {
    const activeTab = document.querySelector(".age-tab.active");
    const mode = activeTab ? activeTab.getAttribute("data-mode") : "growth";
  
    const resultEl = document.getElementById("result");
    const detailsEl = document.getElementById("kDetails");
  
    if (mode === "growth") {
      const res = calculateGrowth();
      if (res.error) {
        resultEl.innerText = res.error;
        detailsEl.innerHTML = "";
        return;
      }
  
      resultEl.innerText =
        "Estimated 401(k) value after " +
        res.years +
        " years: " +
        formatMoney(res.fv);
  
      detailsEl.innerHTML =
        "<p><strong>Contributions over " + res.years + " years</strong></p>" +
        "<p>Your contributions: " + formatMoney(res.totalEmployee) + "</p>" +
        "<p>Employer match: " + formatMoney(res.totalEmployer) + "</p>" +
        "<p>Starting balance: " +
        formatMoney(res.totalContrib - res.totalEmployee - res.totalEmployer) +
        "</p>" +
        "<p><strong>Estimated growth from investment returns: " +
        formatMoney(res.growth) +
        "</strong></p>" +
        "<p style='font-size:12px;color:#555;margin-top:8px;'>This projection assumes a constant annual return and steady contributions. Actual 401(k) performance will vary from year to year.</p>";
  
    } else if (mode === "retirement") {
      const res = calculateRetirement();
      if (res.error) {
        resultEl.innerText = res.error;
        detailsEl.innerHTML = "";
        return;
      }
  
      resultEl.innerText =
        "Estimated 401(k) balance at age " +
        res.retireAge +
        ": " +
        formatMoney(res.fv);
  
      detailsEl.innerHTML =
        "<p><strong>Saving horizon:</strong> " +
        res.years +
        " years (from age " +
        res.currentAge +
        " to " +
        res.retireAge +
        ").</p>" +
        "<p>Your contributions: " + formatMoney(res.totalEmployee) + "</p>" +
        "<p>Employer match: " + formatMoney(res.totalEmployer) + "</p>" +
        "<p>Starting balance: " +
        formatMoney(res.totalContrib - res.totalEmployee - res.totalEmployer) +
        "</p>" +
        "<p><strong>Estimated growth from investment returns: " +
        formatMoney(res.growth) +
        "</strong></p>" +
        "<p style='font-size:12px;color:#555;margin-top:8px;'>This is a simplified estimate. Your actual retirement balance will depend on salary changes, market performance, fees and how consistently you contribute.</p>";
  
    } else if (mode === "withdrawal") {
      const res = calculateWithdrawal();
      if (res.error) {
        resultEl.innerText = res.error;
        detailsEl.innerHTML = "";
        return;
      }
  
      resultEl.innerText =
        "Estimated cash after taxes and any 10% penalty: " +
        formatMoney(res.netAmount);
  
      const penaltyText =
        res.penaltyRate > 0
          ? formatMoney(res.penalty) + " (10% early withdrawal penalty)"
          : formatMoney(res.penalty) + " (no 10% penalty assumed)";
  
      detailsEl.innerHTML =
        "<p>Requested withdrawal: " + formatMoney(res.amount) + "</p>" +
        "<p>Estimated federal taxes: " + formatMoney(res.federalTax) + "</p>" +
        "<p>Estimated state taxes: " + formatMoney(res.stateTax) + "</p>" +
        "<p>Penalty estimate: " + penaltyText + "</p>" +
        "<p><strong>Total estimated taxes and penalty: " +
        formatMoney(res.totalCost) +
        "</strong></p>" +
        "<p style='margin-top:6px;'>" +
        res.penaltyReason +
        "</p>" +
        "<p style='font-size:12px;color:#555;margin-top:8px;'>This calculator gives an educational illustration only. IRS rules about early distributions and exceptions are complex, and real results depend on your full income, plan type and current tax law. Always confirm details with a tax professional or plan administrator before taking money out of a 401(k).</p>";
    }
  }
  