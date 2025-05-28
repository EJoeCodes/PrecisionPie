/*************************************
 * SPLASH SCREEN TRANSITION (No Login)
 *************************************/
const splashScreen = document.getElementById('splash-screen');

// Force dropdown logic on load by toggling selection
window.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('item-selector');
  if (selector) {
    selector.value = 'Drinks'; // Temporarily select another item
    selector.dispatchEvent(new Event('change')); // Trigger dropdown logic

    setTimeout(() => {
      selector.value = 'Pizza'; // Then switch back to Pizza
      selector.dispatchEvent(new Event('change'));
    }, 50); // Small delay to ensure both events fire
  }
});

setTimeout(() => {
  splashScreen.classList.add('hidden');
  setTimeout(() => {
    splashScreen.style.display = 'none';
    document.querySelector('.scroll-container').style.display = 'block';
    document.querySelector('.top-buttons').style.display = 'flex';
    document.querySelector('.bottom-nav').style.display = 'flex';
  }, 800);
}, 1500);



/*************************************
 * NAVIGATION
 *************************************/
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.remove('active'));
    const target = btn.getAttribute('data-target');
    document.getElementById(target).classList.add('active');

    if (target === 'section-averages') {
      updateAverageList();
    } else if (target === 'section-total-estimates') {
      updateTotalEstimates();
    }
  });
});


/*************************************
 * ITEM TIMER ENTRY & TRACKING (Continuous Timer)
 *************************************/
let itemEntries = [];
let lastClearTime = null;
let timerStarted = false;
let liveTimerInterval = null;

function startTrackingSession() {
  if (!timerStarted) {
    lastClearTime = new Date();
    timerStarted = true;
    document.getElementById('entry-status').textContent = 'Tracking started. Select item and click Clear after each one is made.';
    startLiveTimer();
  }
}

function stopTrackingSession() {
  if (liveTimerInterval) clearInterval(liveTimerInterval);
  timerStarted = false;
  document.getElementById('entry-status').textContent = 'Tracking stopped.';
  document.getElementById('live-timer').textContent = 'Current Timer: 0m 00s';
}

function resetTrackingSession() {
  itemEntries = [];
  lastClearTime = null;
  timerStarted = false;
  clearInterval(liveTimerInterval);
  document.getElementById('entry-status').textContent = 'Tracking session reset.';
  document.getElementById('live-timer').textContent = 'Current Timer: 0m 00s';
  updateEntryList();
  updateAverageList();
}

function clearItemEntry() {
  if (!timerStarted) {
    alert("You need to start the session first.");
    return;
  }
  const now = new Date();
  const item = document.getElementById('item-selector').value;
  const crust = document.getElementById('pizza-crust').value || '';
  const size = document.getElementById('pizza-size').value || '';
  const fullItem = item === 'Pizza' ? `${item} – ${crust}, ${size}` : item;
  const staffCount = parseInt(document.getElementById('staff-count').value) || 1;

  const elapsedMs = now - lastClearTime;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.round((elapsedMs % 60000) / 1000);

  const clearTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

itemEntries.push({
  name: fullItem,
  minutes: elapsedMin,
  seconds: elapsedSec,
  staff: staffCount,
  time: clearTime
});

  lastClearTime = now;

  document.getElementById('entry-status').textContent = `Cleared: ${fullItem}`;
  updateEntryList();
  startLiveTimer();
}

function updateEntryList() {
  const list = document.getElementById('item-log');
  list.innerHTML = '';
  itemEntries.forEach((entry, idx) => {
    const row = document.createElement('li');
    row.textContent = `${idx + 1}. ${entry.name} – ${entry.minutes}m ${entry.seconds}s (Staff: ${entry.staff}) at ${entry.time}`;
    list.appendChild(row);
  });
}


function startLiveTimer() {
  if (liveTimerInterval) clearInterval(liveTimerInterval);
  liveTimerInterval = setInterval(() => {
    const now = new Date();
    const elapsedMs = now - lastClearTime;
    const min = Math.floor(elapsedMs / 60000);
    const sec = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('live-timer').textContent = `Current Timer: ${min}m ${sec}s`;
  }, 1000);
}

function updateAverageList() {
  const averages = {};

  // Build total time and counts per item
  itemEntries.forEach(entry => {
    const key = `${entry.name} (Staff: ${entry.staff})`;
    const totalSec = entry.minutes * 60 + entry.seconds;

    if (!averages[key]) {
      averages[key] = { totalTime: totalSec, count: 1 };
    } else {
      averages[key].totalTime += totalSec;
      averages[key].count += 1;
    }
  });

  // Update the average-log list
  const averageList = document.getElementById('average-log');
  averageList.innerHTML = '';

  let count = 1;
  for (const item in averages) {
    const avgSec = averages[item].totalTime / averages[item].count;
    const min = Math.floor(avgSec / 60);
    const sec = Math.round(avgSec % 60);
    const row = document.createElement('li');
    row.textContent = `${count}. ${item} – Average: ${min}m ${sec}s`;
    averageList.appendChild(row);
    count++;
  }
}

function updateTotalEstimates() {
  const totalList = document.getElementById('total-estimate-log');
  totalList.innerHTML = '';

  const ovenTime = 7 * 60; // 7 minutes in seconds
  const cutTime = 90;      // average 1.5 minutes in seconds

  const totals = {};

  itemEntries.forEach(entry => {
    const key = `${entry.name} (Staff: ${entry.staff})`;
    const totalSec = entry.minutes * 60 + entry.seconds;

    if (!totals[key]) {
      totals[key] = { totalTime: totalSec, count: 1 };
    } else {
      totals[key].totalTime += totalSec;
      totals[key].count += 1;
    }
  });

  let count = 1;
  for (const item in totals) {
    const avgPrepSec = totals[item].totalTime / totals[item].count;
    const totalSec = avgPrepSec + ovenTime + cutTime;

    const totalMin = Math.floor(totalSec / 60);
    const totalRemSec = Math.round(totalSec % 60);

    const row = document.createElement('li');
    row.textContent = `${count}. ${item} – Estimated Total Time: ${totalMin}m ${totalRemSec}s`;
    totalList.appendChild(row);
    count++;
  }
}

/*************************************
 SETTINGS MODAL
 *************************************/

document.getElementById('settings-btn').addEventListener('click', function() {
  document.getElementById('settings-modal').style.display = 'block';
});

window.logoutUser = function() {
  location.reload();
};
