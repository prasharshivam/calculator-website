function calculatePercentage() {
  const calcType = document.getElementById("calcType").value;
  const resultEl = document.getElementById("result");

  let resultText = "";

  if (calcType === "percent-of") {
    const base = parseFloat(document.getElementById("value").value);
    const percent = parseFloat(document.getElementById("percentage").value);

    if (isNaN(base) || isNaN(percent)) {
      resultEl.innerText = "Please enter both the base value and percentage.";
      return;
    }

    const result = (base * percent) / 100;
    resultText = percent + "% of " + base + " is " + result;
  }

  if (calcType === "what-percent") {
    const part = parseFloat(document.getElementById("partValue").value);
    const whole = parseFloat(document.getElementById("wholeValue").value);

    if (isNaN(part) || isNaN(whole) || whole === 0) {
      resultEl.innerText = "Please enter both values. Total value cannot be zero.";
      return;
    }

    const percent = (part / whole) * 100;
    resultText = part + " is " + percent.toFixed(2) + "% of " + whole;
  }

  if (calcType === "change-percent") {
    const oldValue = parseFloat(document.getElementById("oldValue").value);
    const newValue = parseFloat(document.getElementById("newValue").value);

    if (isNaN(oldValue) || isNaN(newValue) || oldValue === 0) {
      resultEl.innerText = "Please enter both starting and final values. Starting value cannot be zero.";
      return;
    }

    const diff = newValue - oldValue;
    const percentChange = (diff / oldValue) * 100;
    const direction = diff > 0 ? "increase" : diff < 0 ? "decrease" : "no change";

    if (direction === "no change") {
      resultText = "There is no change between " + oldValue + " and " + newValue + ".";
    } else {
      resultText =
        "From " +
        oldValue +
        " to " +
        newValue +
        " there is a " +
        direction +
        " of " +
        Math.abs(percentChange).toFixed(2) +
        "%.";
    }
  }

  if (calcType === "discount") {
    const originalPrice = parseFloat(document.getElementById("originalPrice").value);
    const discountPercent = parseFloat(document.getElementById("discountPercent").value);

    if (isNaN(originalPrice) || isNaN(discountPercent)) {
      resultEl.innerText = "Please enter both original price and discount percentage.";
      return;
    }

    const discountAmount = (originalPrice * discountPercent) / 100;
    const finalPrice = originalPrice - discountAmount;

    resultText =
      "A discount of " +
      discountPercent +
      "% on " +
      originalPrice +
      " reduces the price by " +
      discountAmount.toFixed(2) +
      ", so the final price is " +
      finalPrice.toFixed(2) +
      ".";
  }

  resultEl.innerText = resultText;
}

// Switch field sets based on selected type
function handleCalcTypeChange() {
  const type = document.getElementById("calcType").value;

  const sections = [
    "percent-of-fields",
    "what-percent-fields",
    "change-percent-fields",
    "discount-fields"
  ];

  sections.forEach(function (id) {
    document.getElementById(id).style.display = "none";
  });

  if (type === "percent-of") {
    document.getElementById("percent-of-fields").style.display = "block";
  } else if (type === "what-percent") {
    document.getElementById("what-percent-fields").style.display = "block";
  } else if (type === "change-percent") {
    document.getElementById("change-percent-fields").style.display = "block";
  } else if (type === "discount") {
    document.getElementById("discount-fields").style.display = "block";
  }

  // Clear previous result when switching modes
  const resultEl = document.getElementById("result");
  if (resultEl) {
    resultEl.innerText = "";
  }
}

// Attach listeners after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const calcTypeSelect = document.getElementById("calcType");
  if (calcTypeSelect) {
    calcTypeSelect.addEventListener("change", handleCalcTypeChange);
  }

  const calculateBtn = document.getElementById("calculateBtn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculatePercentage);
  }
});
