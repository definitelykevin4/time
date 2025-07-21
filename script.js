// Tab switching
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(btn.dataset.tab).style.display = 'block';
  });
});

const eventTimestamps = [
  { label: "Formation of Cybertron", value: "0 0 arc 0" },
  { label: "Quintesson Takeover", value: "12 arc 1 87 arc 3" },
  { label: "Golden Age Begins", value: "48 arc 0 500 arc 9" },
  { label: "Uprising of Megatronus", value: "89 arc 6 732 arc 12" },
  { label: "Great Exodus", value: "10 arc 5 300 arc 20" },
];

function populateEventDropdowns() {
  const dropdownInputs = document.querySelectorAll("input[id$='date']");

  dropdownInputs.forEach(input => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.marginBottom = '1rem';

    const dropdown = document.createElement('select');
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.width = '100%';
    dropdown.style.marginTop = '0.2rem';
    dropdown.style.maxHeight = '150px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.fontFamily = 'monospace';
    dropdown.style.zIndex = '1000';

    const defaultOption = document.createElement('option');
    defaultOption.text = '-- Select Event Timestamp --';
    defaultOption.value = '';
    dropdown.appendChild(defaultOption);

    eventTimestamps.forEach(event => {
      const option = document.createElement('option');
      option.text = event.label;
      option.value = event.value;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        input.value = e.target.value;
      }
    });

    const parent = input.parentNode;
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
  });
}

document.addEventListener('DOMContentLoaded', populateEventDropdowns);

// Placeholder parsing & conversion logic
function parseCybertronianDate(input) {
  return input.replace(/arc/g, '').split(/\s+/).map(Number);
}

function formatCyberDate(parts) {
  return parts.join(' arc ');
}

function parseHumanTime(str) {
  const units = {
    minute: 60,
    minutes: 60,
    hour: 3600,
    hours: 3600,
    day: 86400,
    days: 86400,
    week: 604800,
    weeks: 604800,
    year: 31536000,
    years: 31536000
  };
  return str.split(/,\s*/).reduce((total, part) => {
    const [num, unit] = part.trim().split(/\s+/);
    return total + (+num * (units[unit.toLowerCase()] || 0));
  }, 0);
}

function cyberDateToEarthSeconds(date) {
  const [klik = 0, chord = 0, cycle = 0, solar = 0] = date;
  return (
    klik * 300 +
    chord * 30000 +
    cycle * 315360 +
    solar * 31536000
  );
}

function earthSecondsToCyberDate(seconds) {
  const solar = Math.floor(seconds / 31536000);
  seconds %= 31536000;
  const cycle = Math.floor(seconds / 315360);
  seconds %= 315360;
  const chord = Math.floor(seconds / 30000);
  seconds %= 30000;
  const klik = Math.floor(seconds / 300);
  return [klik, chord, cycle, solar];
}

// Convert Date
document.getElementById('convert-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('convert-date').value;
  const result = document.getElementById('convert-result');

  try {
    const parts = parseCybertronianDate(input);
    const earthSeconds = cyberDateToEarthSeconds(parts);
    const earthDays = (earthSeconds / 86400).toFixed(2);
    result.textContent = `Approx. ${earthDays} Earth days since Cybertronian Year 0.`;
  } catch {
    result.textContent = 'Invalid format.';
  }
});

// Compare Dates
document.getElementById('compare-form').addEventListener('submit', e => {
  e.preventDefault();
  const d1 = parseCybertronianDate(document.getElementById('compare-date1').value);
  const d2 = parseCybertronianDate(document.getElementById('compare-date2').value);
  const result = document.getElementById('compare-result');
  const diff = Math.abs(cyberDateToEarthSeconds(d1) - cyberDateToEarthSeconds(d2));
  const days = (diff / 86400).toFixed(2);
  result.textContent = `Difference: ${days} Earth days (${diff} seconds)`;
});

// Add Earth Time
document.getElementById('add-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('add-date').value;
  const add = document.getElementById('add-earth-time').value;
  const result = document.getElementById('add-result');

  const parts = parseCybertronianDate(input);
  const start = cyberDateToEarthSeconds(parts);
  const added = parseHumanTime(add);
  const final = earthSecondsToCyberDate(start + added);
  result.textContent = 'New Cybertronian Date:\n' + formatCyberDate(final);
});

// Subtract Earth Time
document.getElementById('subtract-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const cyberInput = document.getElementById('subtract-date').value;
  const earthInput = document.getElementById('subtract-earth-time').value;
  const resultEl = document.getElementById('subtract-result');

  try {
    const date = parseCybertronianDate(cyberInput);
    const earthSecondsToSubtract = parseHumanTime(earthInput);
    const startSeconds = cyberDateToEarthSeconds(date);
    const newSeconds = startSeconds - earthSecondsToSubtract;

    if (newSeconds < 0) throw new Error('Resulting date is before Cybertronian time origin.');
    const newDate = earthSecondsToCyberDate(newSeconds);
    const formatted = formatCyberDate(newDate);
    resultEl.textContent = `Cybertronian Date after subtracting time:\n${formatted}`;
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});
