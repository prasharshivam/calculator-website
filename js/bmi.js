function getBmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function calculateBMI() {
  const unitSystem = document.getElementById("unitSystem").value;
  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("bmiDetails");

  let bmi = null;

  if (unitSystem === "metric") {
    const weight = parseFloat(document.getElementById("weight").value);
    const heightCm = parseFloat(document.getElementById("height").value);

    if (!weight || !heightCm || weight <= 0 || heightCm <= 0) {
      resultEl.innerText = "Please enter a valid weight and height.";
      detailsEl.innerHTML = "";
      return;
    }

    const heightM = heightCm / 100;
    bmi = weight / (heightM * heightM);
  } else {
    const weightLb = parseFloat(document.getElementById("weightLb").value);
    const heightFt = parseFloat(document.getElementById("heightFt").value);
    const heightIn = parseFloat(document.getElementById("heightIn").value) || 0;

    if (!weightLb || !heightFt || weightLb <= 0 || heightFt <= 0) {
      resultEl.innerText = "Please enter a valid weight and height.";
      detailsEl.innerHTML = "";
      return;
    }

    const totalInches = heightFt * 12 + heightIn;
    // BMI formula for imperial units
    bmi = (weightLb / (totalInches * totalInches)) * 703;
  }

  const category = getBmiCategory(bmi);
  resultEl.innerText = "Your BMI is: " + bmi.toFixed(2) + " (" + category + ")";

  detailsEl.innerHTML =
    "<p>Standard adult BMI categories:</p>" +
    "<ul style='margin-left:18px;'>" +
    "<li>Underweight: below 18.5</li>" +
    "<li>Normal weight: 18.5 to 24.9</li>" +
    "<li>Overweight: 25 to 29.9</li>" +
    "<li>Obese: 30 and above</li>" +
    "</ul>" +
    "<p style='font-size:12px;color:#555;'>BMI is only a general indicator and does not replace professional medical advice.</p>";
}

function handleUnitChange() {
  const unitSystem = document.getElementById("unitSystem").value;
  const metricFields = document.getElementById("metricFields");
  const imperialFields = document.getElementById("imperialFields");

  if (unitSystem === "metric") {
    metricFields.style.display = "";
    imperialFields.style.display = "none";
  } else {
    metricFields.style.display = "none";
    imperialFields.style.display = "";
  }

  // Clear previous result when switching units
  const resultEl = document.getElementById("result");
  const detailsEl = document.getElementById("bmiDetails");
  if (resultEl) resultEl.innerText = "";
  if (detailsEl) detailsEl.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("calculateBtn");
  const unitSelect = document.getElementById("unitSystem");

  if (unitSelect) {
    unitSelect.addEventListener("change", handleUnitChange);
  }

  if (btn) {
    btn.addEventListener("click", calculateBMI);
  }
});
