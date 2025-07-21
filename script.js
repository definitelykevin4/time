// Cybertronian time constants
const EARTH_YEAR_IN_DAYS = 365.25;
const SOLAR_CYCLE_YEARS = 10; // 10 Earth years
const SOLAR_CYCLE_DAYS = SOLAR_CYCLE_YEARS * EARTH_YEAR_IN_DAYS; // 3652.5 days approx

const CYCLE = SOLAR_CYCLE_DAYS / 1000; // ~3.65 Earth days
const CHORD = CYCLE / 10 * 100; // 1/10 cycle = 100 kliks
const KLIK = CYCLE / 1000; // ~5 Earth minutes (0.005 Earth days)
const ASTROSECOND = KLIK / 1000; // ~0.3 Earth seconds
const ZETASECOND = ASTROSECOND / 100; // ~0.003 Earth seconds

// Parse cybertronian date string to object with parts (klik, chord, cycle, solarCycle)
// Examples accepted:
// "54 arc 4 593 arc 129"  --> [54 klik, 4 chord, 593 cycle, 129 solarCycle]
// or shorter formats
// We'll parse the numbers separated by "arc" keyword (or spaces)
// We will assume input like:
// - Full: klik chord cycle arc solarCycle
// - Partial: chord cycle arc solarCycle
// - Very short: klik chord

// Return an object with parts normalized to numbers or null if invalid
function parseCybertronianDate(input) {
  // Remove extra spaces and lowercase
  input = input.trim().toLowerCase();

  // Split by "arc" keyword
  let arcParts = input.split(/\s*arc\s*/);
  if (arcParts.length < 1) return null;

  // Now parse each arc part by splitting on spaces
  let parsedParts = arcParts.map(part => part.trim().split(/\s+/).map(Number));

  // Flatten to one array of numbers
  let numbers = [];
  parsedParts.forEach(arr => {
    arr.forEach(n => {
      if (isNaN(n)) throw new Error('Invalid number in date');
      numbers.push(n);
    });
  });

  // Cybertronian date can have variable length:
  // We'll interpret from right to left:
  // solarCycle (last number)
  // cycle (second last)
  // chord (third last)
  // klik (fourth last)
  // Examples:
  // 54 arc 4 593 arc 129 -> numbers = [54,4,593,129]
  // Here 54 klik, 4 chord, 593 cycle, 129 solarCycle

  // We'll assign based on length:
  // 4 numbers: klik chord cycle solarCycle
  // 3 numbers: chord cycle solarCycle
  // 2 numbers: klik chord (common fast time)
  // 1 number: cycle only (?)
  // 0 numbers: invalid

  let date = {
    klik: null,
    chord: null,
    cycle: null,
    solarCycle: null,
  };

  if (numbers.length === 4) {
    date.klik = numbers[0];
    date.chord = numbers[1];
    date.cycle = numbers[2];
    date.solarCycle = numbers[3];
  } else if (numbers.length === 3) {
    date.chord = numbers[0];
    date.cycle = numbers[1];
    date.solarCycle = numbers[2];
  } else if (numbers.length === 2) {
    date.klik = numbers[0];
    date.chord = numbers[1];
  } else if (numbers.length === 1) {
    date.cycle = numbers[0];
  } else {
    return null;
  }

  return date;
}

// Convert a cybertronian date object to total Earth seconds from cycle 0 (solarCycle 0)
function cyberDateToEarthSeconds(date) {
  // total days = solarCycle * solar cycle days + cycle * cycle days + chord * chord days + klik * klik days
  // Note that chord = 1/10 cycle = 100 kliks
  // klik = 1/1000 cycle
  // cycle = 1/1000 solar cycle

  let totalDays = 0;
  if (date.solarCycle !== null) totalDays += date.solarCycle * SOLAR_CYCLE_DAYS;
  if (date.cycle !== null) totalDays += date.cycle * CYCLE;
  if (date.chord !== null) totalDays += date.chord * (CYCLE / 10);
  if (date.klik !== null) totalDays += date.klik * (CYCLE / 1000);

  // Return seconds
  return totalDays * 86400; // seconds in a day
}

// Convert Earth seconds to cybertronian date (approximate, integers)
function earthSecondsToCyberDate(seconds) {
  let totalDays = seconds / 86400;

  let solarCycle = Math.floor(totalDays / SOLAR_CYCLE_DAYS);
  totalDays -= solarCycle * SOLAR_CYCLE_DAYS;

  let cycle = Math.floor(totalDays / CYCLE);
  totalDays -= cycle * CYCLE;

  let chord = Math.floor(totalDays / (CYCLE / 10));
  totalDays -= chord * (CYCLE / 10);

  let klik = Math.floor(totalDays / (CYCLE / 1000));

  return { klik, chord, cycle, solarCycle };
}

// Format cybertronian date object into a string
function formatCyberDate(date) {
  // Show full form if solarCycle and cycle exist
  if (
    date.solarCycle !== null &&
    date.cycle !== null &&
    date.chord !== null &&
    date.klik !== null
  ) {
    return `${date.klik} arc ${date.chord} ${date.cycle} arc ${date.solarCycle}`;
  }
  if (
    date.solarCycle !== null &&
    date.cycle !== null &&
    date.chord !== null &&
    date.klik === null
  ) {
    return `${date.chord} ${date.cycle} arc ${date.solarCycle}`;
  }
  if (date.klik !== null && date.chord !== null) {
    return `${date.klik} arc ${date.chord}`;
  }
  if (date.cycle !== null) {
    return `${date.cycle}`;
  }
  return 'Invalid date';
}

// Explain a cybertronian date (return string explanation)
function explainDate(date) {
  let parts = [];

  if (date.solarCycle !== null) {
    parts.push(
      `Solar Cycle: ${date.solarCycle} (Each solar cycle = 10 Earth years)`
    );
  }
  if (date.cycle !== null) {
    parts.push(`Cycle: ${date.cycle} (Each cycle ≈ 3.65 Earth days)`);
  }
  if (date.chord !== null) {
    parts.push(`Chord: ${date.chord} (1/10 of a cycle ≈ 8.76 hours)`);
  }
  if (date.klik !== null) {
    parts.push(`Klik: ${date.klik} (1/1000 of a cycle ≈ 5 Earth minutes)`);
  }

  return parts.join('\n');
}

// Calculate difference between two cybertronian dates in Earth seconds and cybertronian units
function differenceBetweenDates(date1, date2) {
  let seconds1 = cyberDateToEarthSeconds(date1);
  let seconds2 = cyberDateToEarthSeconds(date2);

  let diffSeconds = Math.abs(seconds2 - seconds1);

  // Convert diffSeconds back to cybertronian date
  let diffCyber = earthSecondsToCyberDate(diffSeconds);

  return {
    diffSeconds,
    diffCyber,
  };
}

// Parse human time like "2 years, 3 weeks, 5 minutes"
function parseHumanTime(text) {
  let totalSeconds = 0;
  const units = {
    year: 365.25 * 86400,
    years: 365.25 * 86400,
    week: 7 * 86400,
    weeks: 7 * 86400,
    day: 86400,
    days: 86400,
    hour: 3600,
    hours: 3600,
    minute: 60,
    minutes: 60,
    second: 1,
    seconds: 1,
  };

  // Use regex to extract amount and unit pairs
  let regex = /(\d+)\s*(years?|weeks?|days?|hours?|minutes?|seconds?)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    let val = parseInt(match[1]);
    let unit = match[2].toLowerCase();
    if (units[unit]) {
      totalSeconds += val * units[unit];
    }
  }
  return totalSeconds;
}

// Tab switching logic
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    contents.forEach((content) => {
      content.classList.remove('active');
    });

    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Explain form submit
document.getElementById('explain-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('explain-date').value;
  const resultEl = document.getElementById('explain-result');

  try {
    const date = parseCybertronianDate(input);
    if (!date) throw new Error('Invalid cybertronian date format.');
    const explanation = explainDate(date);
    resultEl.textContent = explanation;
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});

// Compare form submit
document.getElementById('compare-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input1 = document.getElementById('compare-date1').value;
  const input2 = document.getElementById('compare-date2').value;
  const resultEl = document.getElementById('compare-result');

  try {
    const date1 = parseCybertronianDate(input1);
    const date2 = parseCybertronianDate(input2);
    if (!date1 || !date2) throw new Error('Invalid cybertronian date format.');

    const diff = differenceBetweenDates(date1, date2);

    // Format elapsed Earth time in human readable format
    const seconds = diff.diffSeconds;
    let remaining = seconds;

    const years = Math.floor(remaining / (365.25 * 86400));
    remaining -= years * 365.25 * 86400;
    const weeks = Math.floor(remaining / (7 * 86400));
    remaining -= weeks * 7 * 86400;
    const days = Math.floor(remaining / 86400);
    remaining -= days * 86400;
    const hours = Math.floor(remaining / 3600);
    remaining -= hours * 3600;
    const minutes = Math.floor(remaining / 60);
    remaining -= minutes * 60;
    const secs = Math.floor(remaining);

    let humanElapsed = `${years} years, ${weeks} weeks, ${days} days, ${hours} hours, ${minutes} minutes, ${secs} seconds`;

    let cyberElapsed = `Klik: ${diff.diffCyber.klik}, Chord: ${diff.diffCyber.chord}, Cycle: ${diff.diffCyber.cycle}, Solar Cycle: ${diff.diffCyber.solarCycle}`;

    resultEl.textContent =
      `Elapsed Cybertronian Time:\n${cyberElapsed}\n\nElapsed Earth Time:\n${humanElapsed}`;
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});

// Add Earth time form submit
document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const cyberInput = document.getElementById('add-date').value;
  const earthInput = document.getElementById('add-earth-time').value;
  const resultEl = document.getElementById('add-result');

  try {
    const date = parseCybertronianDate(cyberInput);
    if (!date) throw new Error('Invalid cybertronian date format.');
    const earthSecondsToAdd = parseHumanTime(earthInput);
    if (earthSecondsToAdd <= 0) throw new Error('Invalid or zero Earth time to add.');

    const startSeconds = cyberDateToEarthSeconds(date);
    const newSeconds = startSeconds + earthSecondsToAdd;

    const newDate = earthSecondsToCyberDate(newSeconds);
    const formatted = formatCyberDate(newDate);

    resultEl.textContent = `New Cybertronian Date:\n${formatted}`;
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});

// Subtract Earth Time from Cybertronian Date
document.getElementById('subtract-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const cyberInput = document.getElementById('subtract-date').value;
  const earthInput = document.getElementById('subtract-earth-time').value;
  const resultEl = document.getElementById('subtract-result');

  try {
    const date = parseCybertronianDate(cyberInput);
    if (!date) throw new Error('Invalid cybertronian date format.');
    const earthSecondsToSubtract = parseHumanTime(earthInput);
    if (earthSecondsToSubtract <= 0) throw new Error('Invalid or zero Earth time to subtract.');

    const startSeconds = cyberDateToEarthSeconds(date);
    const newSeconds = startSeconds - earthSecondsToSubtract;
    if (newSeconds < 0) throw new Error('Resulting date is before the start of Cybertronian time.');

    const newDate = earthSecondsToCyberDate(newSeconds);
    const formatted = formatCyberDate(newDate);

    resultEl.textContent = `Cybertronian Date after subtracting time:\n${formatted}`;
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});
