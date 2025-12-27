// Cron Expression Generator JS
// Format: 5 fields -> minute hour day-of-month month day-of-week

// Allowed characters and ranges for simple Unix-style cron
const CRON_FIELD_REGEX = /^[\d*/,\-A-Z]+$/i;

function $(id) {
  return document.getElementById(id);
}

/* ========= Validation helpers ========= */

function splitCron(expr) {
  return expr.trim().replace(/\s+/g, " ").split(" ");
}

function basicValidateCron(expr) {
  const parts = splitCron(expr);
  if (parts.length !== 5) {
    return { valid: false, error: "Cron expression must have exactly 5 fields (minute hour day-of-month month day-of-week)." };
  }

  const [min, hour, dom, mon, dow] = parts;

  const fields = [
    { value: min,  name: "Minute",      min: 0,  max: 59 },
    { value: hour, name: "Hour",        min: 0,  max: 23 },
    { value: dom,  name: "Day of month",min: 1,  max: 31 },
    { value: mon,  name: "Month",       min: 1,  max: 12, allowNames: true },
    { value: dow,  name: "Day of week", min: 0,  max: 6,  allowNames: true }
  ];

  for (const field of fields) {
    if (field.value === "*") continue;

    if (!CRON_FIELD_REGEX.test(field.value)) {
      return { valid: false, error: `${field.name} contains invalid characters.` };
    }

    // Replace month/day names with dummy numbers for numeric checks
    let cleaned = field.value.toUpperCase();
    if (field.allowNames) {
      cleaned = cleaned
        .replace(/JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/g, "1")
        .replace(/SUN|MON|TUE|WED|THU|FRI|SAT/g, "1");
    }

    const pieces = cleaned.split(",");
    for (const piece of pieces) {
      if (piece === "*") continue;

      const stepParts = piece.split("/");
      const base = stepParts[0];

      const ranges = base.split("-");
      if (ranges.length > 2) {
        return { valid: false, error: `${field.name} has an invalid range.` };
      }

      for (const r of ranges) {
        if (r === "*" || r === "") continue;
        const num = Number(r);
        if (!Number.isInteger(num) || num < field.min || num > field.max) {
          return { valid: false, error: `${field.name} value ${r} is outside allowed range ${field.min}-${field.max}.` };
        }
      }
    }
  }

  return { valid: true, error: "" };
}

/* ========= Description helpers ========= */

function describeField(value, type) {
  // Very lightweight descriptions, enough for UX.
  if (value === "*") {
    if (type === "minute") return "every minute";
    if (type === "hour") return "every hour";
    if (type === "dom") return "every day of the month";
    if (type === "month") return "every month";
    if (type === "dow") return "every day of the week";
  }

  if (/^\*\/\d+$/.test(value)) {
    const step = value.split("/")[1];
    if (type === "minute") return `every ${step} minutes`;
    if (type === "hour") return `every ${step} hours`;
  }

  if (/^\d+$/.test(value)) {
    if (type === "minute") return `at minute ${value}`;
    if (type === "hour") return `at hour ${value}`;
    if (type === "dom") return `on day ${value} of the month`;
    if (type === "month") return `in month ${value}`;
    if (type === "dow") return `on weekday ${value}`;
  }

  // Lists or ranges
  if (value.includes(",")) {
    return `on ${type} values ${value}`;
  }
  if (value.includes("-")) {
    return `for ${type} range ${value}`;
  }

  return `with ${type} = ${value}`;
}

function describeCron(expr) {
  const validation = basicValidateCron(expr);
  if (!validation.valid) {
    return { ok: false, text: "", error: validation.error };
  }

  const [min, hour, dom, mon, dow] = splitCron(expr);

  const minuteDesc = describeField(min, "minute");
  const hourDesc   = describeField(hour, "hour");
  const domDesc    = describeField(dom, "dom");
  const monthDesc  = describeField(mon, "month");
  const dowDesc    = describeField(dow, "dow");

  let main;

  // Some common patterns for nicer text
  if (expr === "* * * * *") {
    main = "Runs every minute.";
  } else if (min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
    main = "Runs at the start of every hour.";
  } else if (min === "0" && hour === "0" && dom === "*" && mon === "*" && dow === "*") {
    main = "Runs every day at 00:00 (midnight).";
  } else if (dow === "1-5" && dom === "*" && mon === "*") {
    main = `Runs ${minuteDesc} ${hourDesc} on weekdays (Monday to Friday).`;
  } else {
    main = `Runs ${minuteDesc}, ${hourDesc}, ${domDesc}, ${monthDesc}, and ${dowDesc}.`;
  }

  return { ok: true, text: main, error: "" };
}

/* ========= UI logic ========= */

function handlePresetChange() {
  const preset = $("cronPreset").value;
  if (!preset) return;
  const parts = splitCron(preset);
  if (parts.length !== 5) return;

  $("fieldMinute").value = parts[0];
  $("fieldHour").value   = parts[1];
  $("fieldDom").value    = parts[2];
  $("fieldMonth").value  = parts[3];
  $("fieldDow").value    = parts[4];

  // Also generate immediately for good UX
  generateCronFromFields();
}

function generateCronFromFields() {
  const minute = $("fieldMinute").value.trim() || "*";
  const hour   = $("fieldHour").value.trim()   || "*";
  const dom    = $("fieldDom").value.trim()    || "*";
  const month  = $("fieldMonth").value.trim()  || "*";
  const dow    = $("fieldDow").value.trim()    || "*";

  const expr = `${minute} ${hour} ${dom} ${month} ${dow}`;
  const outputEl = $("cronOutput");
  const descEl   = $("cronDescription");
  const errEl    = $("cronError");

  const validation = basicValidateCron(expr);
  if (!validation.valid) {
    outputEl.textContent = expr;
    descEl.textContent = "";
    errEl.textContent = validation.error;
    return;
  }

  const desc = describeCron(expr);
  outputEl.textContent = expr;
  errEl.textContent = "";
  descEl.textContent = desc.text;
}

function explainExistingCron() {
  const input = $("cronInput").value.trim();
  const fieldsEl = $("cronFieldsBreakdown");
  const descEl   = $("cronExplainDescription");
  const errEl    = $("cronExplainError");

  if (!input) {
    fieldsEl.textContent = "";
    descEl.textContent = "";
    errEl.textContent = "Please paste a cron expression to explain.";
    return;
  }

  const validation = basicValidateCron(input);
  if (!validation.valid) {
    fieldsEl.textContent = "";
    descEl.textContent = "";
    errEl.textContent = validation.error;
    return;
  }

  const [min, hour, dom, mon, dow] = splitCron(input);
  fieldsEl.textContent =
    `Minute      : ${min}\n` +
    `Hour        : ${hour}\n` +
    `Day of month: ${dom}\n` +
    `Month       : ${mon}\n` +
    `Day of week : ${dow}`;

  const desc = describeCron(input);
  errEl.textContent = "";
  descEl.textContent = desc.ok ? desc.text : "";
}

/* ========= Tabs ========= */

function setupTabs() {
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
}

/* ========= Init ========= */

document.addEventListener("DOMContentLoaded", function () {
  setupTabs();

  const presetSel = $("cronPreset");
  if (presetSel) {
    presetSel.addEventListener("change", handlePresetChange);
  }

  const genBtn = $("btnGenerateCron");
  if (genBtn) {
    genBtn.addEventListener("click", generateCronFromFields);
  }

  const explainBtn = $("btnExplainCron");
  if (explainBtn) {
    explainBtn.addEventListener("click", explainExistingCron);
  }
});
