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

    drawTimeline();
  });

function calculate() {
  const currentIndex = parseInt(document.getElementById("current-rank").value);
  const targetIndex = parseInt(document.getElementById("target-rank").value);
  const currentPC = parseInt(document.getElementById("current-pc").value) || 0;
  const weeklyGain = parseInt(document.getElementById("weekly-gain").value) || 7;

  if (currentIndex >= targetIndex) {
    alert("Target rank must be higher than current rank.");
    return;
  }

  const totalPcNeeded = ranks[targetIndex].pc_required - ranks[currentIndex].pc_required;
  const remainingPc = Math.max(totalPcNeeded - currentPC, 0);
  const weeksRequired = Math.ceil(remainingPc / weeklyGain);
  const promoDate = getNthThursdayFromToday(weeksRequired);

  document.getElementById("total-points").textContent = totalPcNeeded;
  document.getElementById("remaining-points").textContent = remainingPc;
  document.getElementById("weeks-required").textContent = weeksRequired;
  document.getElementById("promotion-date").textContent = promoDate.toDateString();
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
  timeline.innerHTML = `<div class="flex space-x-4 items-center">` +
    ranks.map((_, i) =>
      `<div class="text-center">
         <img src="./assets/badges/badge-${i + 1}.gif" class="w-10 h-10 mx-auto" alt="Badge ${i + 1}" />
         <div class="text-xs mt-1 text-black whitespace-nowrap">${ranks[i].rank}</div>
       </div>`
    ).join('') +
    `</div>`;
}
