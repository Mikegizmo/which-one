let currentRound = 0;
let score = 0;
let totalRounds = 5;
let currentCategory = "colors";
let currentDifficulty = 3;
let currentData;
let currentCards =[];
let correctIndex = -1;
let correctGroupName = "";
let oddGroupName = "";
let otherGroupName = "";

const cardContainer = document.getElementById("card-container");
const message = document.getElementById("message");
const roundDisplay = document.getElementById("round-counter");
const scoreDisplay = document.getElementById("score");
const nextRoundBtn = document.getElementById("next-round");
const startGameBtn = document.getElementById("start-game");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadCategoryData() {
  const response = await fetch(`./data/${currentCategory}.json`);
  return response.json();
}

function createCard(item, index, isColorCategory) {
  const card = document.createElement("div");
  card.classList.add("card");

  if (isColorCategory) {
    const colorBox = document.createElement("div");
    colorBox.classList.add("color-box");
    colorBox.style.backgroundColor = item.value;
    card.appendChild(colorBox);
  } else {
    card.textContent = item;
  }

  card.addEventListener("click", () => handleCardClick(index, item));

  return card;
}

function handleCardClick(index, item) {
  if (document.body.classList.contains("lock")) return;

  document.body.classList.add("lock");

  if (index === correctIndex) {
    document.body.style.backgroundColor = "green";
    message.textContent = `✅ Correct! All the other cards were from the ${correctGroupName} group. You found the odd one from the ${oddGroupName} group.`;
    score++;
  } else {
    document.body.style.backgroundColor = "red";
    const chosenGroup = findGroup(currentCards[index]);
    message.textContent = `❌ Incorrect. That card was from the ${correctGroupName} group. The odd one out was from the ${oddGroupName} group.`;
  }

  console.log(currentRound);
  roundDisplay.innerHTML = `Round # ${currentRound}`;
  scoreDisplay.textContent = `${score} / ${totalRounds}`;
  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.classList.remove("lock");

    nextRound();
    
  }, 3000);
}

function findGroup(value, data) {
  for (const group in data) {
    if (data[group].items.includes(value)) {
      console.log(data[group]);
      return group;
    }
  }
  return "Unknown";
}

function renderRound() {
  // currentRound++;
  cardContainer.innerHTML = "";
  message.textContent = "";
  nextRoundBtn.classList.add("hidden");

  const groupNames = Object.keys(currentData.groups);
  const baseGroupName = shuffleArray(groupNames)[0];
  const correctGroup = groupNames[Math.floor(Math.random() * groupNames.length)];
  let oddGroup;
  
  do {
    oddGroup = groupNames[Math.floor(Math.random() * groupNames.length)];
  } while (oddGroup === correctGroup);

  const baseGroupItems = shuffleArray([...currentData.groups[baseGroupName].items]).slice(0, currentDifficulty - 1);
  const oddItem = shuffleArray([...currentData.groups[oddGroup].items])[0];
  const allItems = [...baseGroupItems];
  correctIndex = Math.floor(Math.random() * currentDifficulty);
  allItems.splice(correctIndex, 0, oddItem);

  correctGroupName = currentData.groups[baseGroupName].name;   // 🔥 store for messages
  oddGroupName = currentData.groups[oddGroup].name;

  currentCards = allItems;

  const isColorCategory = currentCategory === "colors";

  cardContainer.className = "card-container";
  if (currentDifficulty === 6) {
    cardContainer.classList.add("grid-3x2");
  } else if (currentDifficulty === 9) {
    cardContainer.classList.add("grid-3x3");
  }

  allItems.forEach((item, index) => {
    const card = createCard(item, index, isColorCategory);
    cardContainer.appendChild(card);
  });
}

function nextRound() {
  currentRound++;
  console.log(currentRound);
  if (currentRound < totalRounds) {
    roundDisplay.textContent = `Round # ${currentRound}`;
    nextRoundBtn.classList.remove("hidden");
    nextRoundBtn.textContent = "Next Round";
    nextRoundBtn.onclick = () => renderRound();
  } else {
    message.textContent = `Game over! Final score: ${score}/${totalRounds}`;
    nextRoundBtn.textContent = "Play Again";
    nextRoundBtn.classList.remove("hidden");
    nextRoundBtn.onclick = () => location.reload();
  }
}

async function beginGame(currentCategory, currentDifficulty, rounds) {
  totalRounds = rounds;
  currentRound++;
  score = 0;
  roundDisplay.textContent = `Round # ${currentRound}`;
  scoreDisplay.textContent = score;
  nextRoundBtn.textContent = "Next Round";
  currentData = await loadCategoryData(currentCategory);
  renderRound();
}

startGameBtn.addEventListener("click", () => {
  const selectedCategory = document.querySelector("#category-options .selected");
  const selectedDifficulty = document.querySelector("#difficulty-options .selected");
  const selectedRounds = document.querySelector("#rounds-group .option");

  if (selectedCategory) currentCategory = selectedCategory.dataset.value;
  if (selectedDifficulty) {
    currentDifficulty = selectedDifficulty.dataset.value === "medium" ? 6 :
                        selectedDifficulty.dataset.value === "hard" ? 9 : 3;
    cardCount = currentDifficulty === "easy" ? 3 : currentDifficulty === "medium" ? 6 : 9;
  }
  if(selectedRounds) totalRounds = selectedRounds.dataset.value;

  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  beginGame(currentCategory, currentDifficulty, totalRounds);
});

// Add toggle behavior for category, difficulty, number of rounds buttons
document.querySelectorAll("#category-options .option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#category-options .option").forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

document.querySelectorAll("#difficulty-options .option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#difficulty-options .option").forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

document.querySelectorAll("#rounds-group .option").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#rounds-group .option").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    totalRounds = parseInt(btn.dataset.value);
  });
});