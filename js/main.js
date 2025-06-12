let sectorData = [];
let ranks = [];

fetch("./data/ranks.json")
  .then((res) => res.json())
  .then((data) => {
    sectorData = data;

    // Set default sector if needed
    const defaultSector = "Police Nationale";
    const initialSector = sectorData.find((s) => s.sector === defaultSector);
    ranks = initialSector ? initialSector.ranks : [];

    const currentSelect = document.getElementById("current-rank");
    const targetSelect = document.getElementById("target-rank");

    // Populate target ranks (fixed set from selected sector)
    targetSelect.innerHTML =
      "<option disabled selected>— Choisir un grade —</option>";
    populateTargetRanks(ranks, -1); // show all initially

    // Populate current ranks from sector
    populateCurrentRanks(ranks);
  });

function populateCurrentRanks(ranksArray) {
  const currentSelect = document.getElementById("current-rank");
  currentSelect.innerHTML =
    "<option disabled selected>— Choisir un grade —</option>";

  ranksArray.forEach((r, index) => {
    const opt = new Option(r.rank, index);
    currentSelect.add(opt);
  });

  // When current rank changes, update target rank options
  currentSelect.onchange = () => {
    const selectedIndex = parseInt(currentSelect.value);
    populateTargetRanks(ranksArray, selectedIndex);
  };
}

function populateTargetRanks(ranksArray, startIndex = 0) {
  const targetSelect = document.getElementById("target-rank");
  targetSelect.innerHTML =
    "<option disabled selected>— Choisir un grade —</option>";

  ranksArray.forEach((r, index) => {
    if (index > startIndex) {
      const opt = new Option(r.rank, index);
      targetSelect.add(opt);
    }
  });
}

function calculate() {
  const currentIndex = parseInt(document.getElementById("current-rank").value);
  const targetIndex = parseInt(document.getElementById("target-rank").value);
  let currentPC = parseInt(document.getElementById("current-pc").value) || 0;
  const weeklyGain =
    parseInt(document.getElementById("weekly-gain").value) || 7;

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
  document.getElementById("promotion-date").textContent =
    promoDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
    ranks
      .map(
        (_, i) =>
          `<div class="text-center">
         <img src="./assets/badges/badge-${
           i + 1
         }.gif" class="w-10 h-10 mx-auto" alt="Badge ${i + 1}" />
         <div class="text-xs mt-1 text-black whitespace-nowrap">${
           ranks[i].rank
         }</div>
       </div>`
      )
      .join("") +
    `</div>`;
}
function checkFormCompletion() {
  const currentRank = document.getElementById("current-rank").value;
  const targetRank = document.getElementById("target-rank").value;
  const currentPc = document.getElementById("current-pc").value;
  const weeklyGain = document.getElementById("weekly-gain").value;

  const isComplete =
    currentRank !== "" &&
    targetRank !== "" &&
    !isNaN(currentPc) &&
    currentPc !== "" &&
    !isNaN(weeklyGain) &&
    weeklyGain !== "";

  const checkDiv = document.getElementById("form-check");
  if (isComplete) {
    checkDiv.classList.remove("hidden");
  } else {
    checkDiv.classList.add("hidden");
  }
}

function enforceNumericOnly(inputId) {
  const el = document.getElementById(inputId);
  el.addEventListener("input", () => {
    el.value = el.value.replace(/[^0-9]/g, "");
  });
}
["current-rank", "target-rank", "current-pc", "weekly-gain"].forEach((id) => {
  document.getElementById(id).addEventListener("input", checkFormCompletion);
});

enforceNumericOnly("current-pc");
enforceNumericOnly("weekly-gain");
function handleClick() {
  const button = document.getElementById("calculate-button");

  // Ajoute une animation rapide au clic
  button.classList.add("scale-95", "duration-150");

  // Exécute le calcul
  calculate();

  // Enlève l'animation après 150ms pour revenir à l’état normal
  setTimeout(() => {
    button.classList.remove("scale-95");
  }, 150);
}

document.getElementById("sector").addEventListener("change", (e) => {
  const selectedSector = e.target.value;
  const sector = sectorData.find((s) => s.sector === selectedSector);

  if (sector) {
    ranks = sector.ranks;
    populateCurrentRanks(ranks);
    populateTargetRanks(ranks, -1);
  }
});
