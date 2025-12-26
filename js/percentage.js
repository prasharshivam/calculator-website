// Percentage Calculator with Tabs

function setResult(text) {
  const resultEl = document.getElementById("result");
  if (resultEl) {
    resultEl.innerText = text;
  }
}

/* ========= Core calculations ========= */

// 1) What is X% of Y?
function handlePercentOf() {
  const percent = parseFloat(document.getElementById("po-percent").value);
  const base = parseFloat(document.getElementById("po-base").value);

  if (isNaN(percent) || isNaN(base)) {
    setResult("Please enter both the percentage and the base value.");
    return;
  }

  const value = (percent * base) / 100;
  setResult(`${percent}% of ${base} is ${value.toFixed(4).replace(/\.?0+$/,"")}.`);
}

// 2) X is what % of Y?
function handleWhatPercent() {
  const part = parseFloat(document.getElementById("wp-part").value);
  const whole = parseFloat(document.getElementById("wp-whole").value);

  if (isNaN(part) || isNaN(whole) || whole === 0) {
    setResult("Please enter both values. The total value (Y) cannot be zero.");
    return;
  }

  const percent = (part / whole) * 100;
  setResult(`${part} is ${percent.toFixed(2)}% of ${whole}.`);
}

// 3) Percentage increase / decrease
function handleChange() {
  const oldVal = parseFloat(document.getElementById("ch-old").value);
  const newVal = parseFloat(document.getElementById("ch-new").value);

  if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) {
    setResult("Please enter both starting and final values. Starting value cannot be zero.");
    return;
  }

  const diff = newVal - oldVal;
  const percentChange = (diff / oldVal) * 100;

  if (diff === 0) {
    setResult(`There is no change between ${oldVal} and ${newVal}.`);
  } else if (diff > 0) {
    setResult(`From ${oldVal} to ${newVal} there is an increase of ${percentChange.toFixed(2)}%.`);
  } else {
    setResult(`From ${oldVal} to ${newVal} there is a decrease of ${Math.abs(percentChange).toFixed(2)}%.`);
  }
}

// 4) Forward discount
function handleDiscount() {
  const original = parseFloat(document.getElementById("ds-original").value);
  const percent = parseFloat(document.getElementById("ds-percent").value);

  if (isNaN(original) || isNaN(percent)) {
    setResult("Please enter both original price and discount percentage.");
    return;
  }

  const discountAmount = (original * percent) / 100;
  const finalPrice = original - discountAmount;

  setResult(
    `A discount of ${percent}% on ${original.toFixed(2)} reduces the price by ` +
    `${discountAmount.toFixed(2)}, so the final price is ${finalPrice.toFixed(2)}.`
  );
}

// 5) Reverse discount – find original price from final price and discount %
function handleReverseDiscount() {
  const finalPrice = parseFloat(document.getElementById("rd-final").value);
  const percent = parseFloat(document.getElementById("rd-percent").value);

  if (isNaN(finalPrice) || isNaN(percent)) {
    setResult("Please enter both the final price and the discount percentage.");
    return;
  }
  if (percent >= 100) {
    setResult("Discount percentage must be less than 100%.");
    return;
  }

  const factor = 1 - percent / 100;
  if (factor <= 0) {
    setResult("Discount percentage is too high to compute a valid original price.");
    return;
  }

  const original = finalPrice / factor;
  const discountAmount = original - finalPrice;

  setResult(
    `Paying ${finalPrice.toFixed(2)} after a ${percent}% discount ` +
    `means the original price was ${original.toFixed(2)} and you saved ${discountAmount.toFixed(2)}.`
  );
}

// 6) Markup vs Margin
/*
  If type = "markup":
    input % is markup on cost:
      selling = cost * (1 + m/100)
      margin% = (selling - cost) / selling * 100
  If type = "margin":
    input % is profit margin on selling:
      selling = cost / (1 - pm/100)
      markup% = (selling - cost) / cost * 100
*/
function handleMarkupMargin() {
  const cost = parseFloat(document.getElementById("mm-cost").value);
  const percent = parseFloat(document.getElementById("mm-percent").value);
  const type = document.getElementById("mm-type").value;

  if (isNaN(cost) || isNaN(percent) || cost <= 0) {
    setResult("Please enter a positive cost price and percentage.");
    return;
  }
  if (percent >= 100) {
    setResult("Percentage must be less than 100% for meaningful markup or margin.");
    return;
  }

  let selling, markupPct, marginPct;

  if (type === "markup") {
    markupPct = percent;
    selling = cost * (1 + markupPct / 100);
    marginPct = ((selling - cost) / selling) * 100;
  } else {
    marginPct = percent;
    const factor = 1 - marginPct / 100;
    if (factor <= 0) {
      setResult("Margin percentage is too high. It must be less than 100%.");
      return;
    }
    selling = cost / factor;
    markupPct = ((selling - cost) / cost) * 100;
  }

  setResult(
    `Cost price: ${cost.toFixed(2)}\n` +
    `Selling price: ${selling.toFixed(2)}\n` +
    `Markup: ${markupPct.toFixed(2)}%\n` +
    `Profit margin: ${marginPct.toFixed(2)}%.`
  );
}

/* ========= Tabs ========= */

function switchTab(tabId) {
  // hide all tab contents
  document.querySelectorAll(".tab-content").forEach(function (el) {
    el.classList.remove("active");
  });
  // remove active from all buttons
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });

  // show selected tab
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add("active");
  }

  // set active button
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    }
  });

  // Clear result when switching tabs
  setResult("");
}

/* ========= Attach event listeners ========= */

document.addEventListener("DOMContentLoaded", function () {
  // Tab buttons
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    });
  });

  // Calculation buttons
  const btnPercentOf = document.getElementById("btn-percent-of");
  if (btnPercentOf) btnPercentOf.addEventListener("click", handlePercentOf);

  const btnWhatPercent = document.getElementById("btn-what-percent");
  if (btnWhatPercent) btnWhatPercent.addEventListener("click", handleWhatPercent);

  const btnChange = document.getElementById("btn-change");
  if (btnChange) btnChange.addEventListener("click", handleChange);

  const btnDiscount = document.getElementById("btn-discount");
  if (btnDiscount) btnDiscount.addEventListener("click", handleDiscount);

  const btnReverseDiscount = document.getElementById("btn-reverse-discount");
  if (btnReverseDiscount) btnReverseDiscount.addEventListener("click", handleReverseDiscount);

  const btnMarkupMargin = document.getElementById("btn-markup-margin");
  if (btnMarkupMargin) btnMarkupMargin.addEventListener("click", handleMarkupMargin);
});
