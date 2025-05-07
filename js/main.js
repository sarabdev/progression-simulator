let ranks = [];

fetch('./data/ranks.json')
  .then(res => res.json())
  .then(data => {
    ranks = data;
    const currentSelect = document.getElementById("current-rank");
    const targetSelect = document.getElementById("target-rank");

    ranks.forEach((r, index) => {
      const opt1 = new Option(r.rank, index);
      const opt2 = new Option(r.rank, index);
      currentSelect.add(opt1);
      targetSelect.add(opt2);
    });

   // drawTimeline();
  });

function calculate() {
  const currentIndex = parseInt(document.getElementById("current-rank").value);
  const targetIndex = parseInt(document.getElementById("target-rank").value);
  let currentPC = parseInt(document.getElementById("current-pc").value) || 0;
  const weeklyGain = parseInt(document.getElementById("weekly-gain").value) || 7;

  if (currentIndex >= targetIndex) {
    alert("Le grade visé doit être supérieur au grade actuel.");
    return;
  }

  let totalPcNeeded = 0;
  let remainingPc = 0;

  for (let i = currentIndex; i < targetIndex; i++) {
    const required = ranks[i].pc_required;

    if (i === currentIndex) {
      const needed = required - currentPC;
      remainingPc += needed > 0 ? needed : 0;
    } else {
      remainingPc += required;
    }

    totalPcNeeded += required;
    currentPC = 0; // Reset after promotion
  }

  const weeksRequired = Math.ceil(remainingPc / weeklyGain);
  const promoDate = getNthThursdayFromToday(weeksRequired);

  document.getElementById("total-points").textContent = totalPcNeeded;
  document.getElementById("remaining-points").textContent = remainingPc;
  document.getElementById("weeks-required").textContent = weeksRequired;
  document.getElementById("promotion-date").textContent = promoDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.getElementById("result").classList.remove("hidden");
}

function getNthThursdayFromToday(n) {
  const today = new Date();
  const day = today.getDay();
  const offset = (4 - day + 7) % 7 || 7;
  const firstThursday = new Date(today);
  firstThursday.setDate(today.getDate() + offset);
  const nthThursday = new Date(firstThursday);
  nthThursday.setDate(firstThursday.getDate() + (n - 1) * 7);
  return nthThursday;
}

function drawTimeline() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML =
    `<div class="flex space-x-4 items-center">` +
    ranks.map((_, i) =>
      `<div class="text-center">
         <img src="./assets/badges/badge-${i + 1}.gif" class="w-10 h-10 mx-auto" alt="Badge ${i + 1}" />
         <div class="text-xs mt-1 text-black whitespace-nowrap">${ranks[i].rank}</div>
       </div>`
    ).join('') +
    `</div>`;
}


function enforceNumericOnly(inputId) {
  const el = document.getElementById(inputId);
  el.addEventListener('input', () => {
    el.value = el.value.replace(/[^0-9]/g, '');
  });
}

enforceNumericOnly('current-pc');
enforceNumericOnly('weekly-gain');