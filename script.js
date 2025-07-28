// script.js

let currentRound = 0;
let score = 0;
let totalRounds = 5;
let correctIndex = -1;
let currentCategory = "colors";
let currentDifficulty = "easy";
let cardCount = 3;
let mainGroupLabel = "";
let oddOneLabel = "";

const cardContainer = document.getElementById("card-container");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");
const nextRoundBtn = document.getElementById("next-round");
const startGameBtn = document.getElementById("start-game");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

async function loadCategoryData() {
  const response = await fetch(`./data/${currentCategory}.json`);
  return response.json();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const numCards = currentDifficulty;

function createCard(item, index, category) {
  const card = document.createElement("div");
  card.classList.add("card");

  if (category === "colors") {
    const colorBox = document.createElement("div");
    colorBox.classList.add("color-box");
    colorBox.style.backgroundColor = item.value;
    card.appendChild(colorBox);
  } else {
    card.textContent = item; // word/image/etc
  }

  card.addEventListener("click", () => handleCardClick(index, card, category));
  return card;
}

// function handleCardClick(index, card, category) {
//   console.log(card.textContent);
//   if (document.body.classList.contains("lock")) return;

//   document.body.classList.add("lock");

//   if (index === correctIndex) {
//     score++;
//     message.textContent = "Correct!";
//     document.body.style.backgroundColor = "#a6f4a6";
//   } else {
//     message.textContent = "Incorrect. Try again next time.";
//     document.body.style.backgroundColor = "#f4a6a6";
//   }

//   scoreDisplay.textContent = `${score}/${totalRounds}`;
//   nextRoundBtn.classList.add("hidden");

//   setTimeout(() => {
//     document.body.style.backgroundColor = "#f4f4f4";
//     document.body.classList.remove("lock");

//     currentRound++;
//     if (currentRound < totalRounds) {
//       startRound();
//     } else {
//       message.textContent = `Game over! Final score: ${score}/${totalRounds}`;
//       nextRoundBtn.textContent = "Play Again";
//       nextRoundBtn.classList.remove("hidden");
//       nextRoundBtn.onclick = () => location.reload();
//     }
//   }, 3000);
// }
function handleCardClick(index, card, category) {
  if (document.body.classList.contains("lock")) return;

  document.body.classList.add("lock");

  if (index === correctIndex) {
    score++;
    message.textContent = `Correct! This one is from "${oddOneLabel}", while the others are from "${mainGroupLabel}".`;
    document.body.style.backgroundColor = "#a6f4a6";
  } else {
    message.textContent = `Incorrect. You chose one from "${mainGroupLabel}", but the odd one is ${index[correctIndex]}.`;
    document.body.style.backgroundColor = "#f4a6a6";
  }

  scoreDisplay.textContent = score;
  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.classList.remove("lock");
    nextRoundBtn.click(); // Advance automatically
  }, 3000);
}

function getRandomGroup(groups) {
  const keys = Object.keys(groups);
  return keys[Math.floor(Math.random() * keys.length)];
}

function generateItemsFromGroups(groups, numCards) {
  const groupValues = Object.values(groups);
  const groupCount = groupValues.length;

  const correctGroupIndex = Math.floor(Math.random() * groupCount);
  const oddGroupIndex = (correctGroupIndex + 1 + Math.floor(Math.random() * (groupCount - 1))) % groupCount;

  const correctGroup = shuffleArray([...groupValues[correctGroupIndex].items]);
  const oddGroup = shuffleArray([...groupValues[oddGroupIndex].items]);

  const correctItem = oddGroup[0];
  const items = correctGroup.slice(0, numCards - 1);
  const correctIndex = Math.floor(Math.random() * numCards);
  items.splice(correctIndex, 0, correctItem);

  return { items, correctIndex, correctGroup, oddGroup };
}

function renderRound(data) {
  cardContainer.innerHTML = "";
  message.textContent = "";
  nextRoundBtn.classList.add("hidden");
  const numCards = currentDifficulty;
 
  cardContainer.className = "card-container"; // reset classes
  if (numCards === 6) {
    cardContainer.classList.add("grid-3x2");
  } else if (numCards === 9) {
    cardContainer.classList.add("grid-3x3");
  }

  const { items, correctIndex: index, mainGroupLabel, oddOneLabel } = generateItemsFromGroups(data.groups, numCards);
  correctIndex = index;

  items.forEach((item, idx) => {
    const card = createCard(item, idx, currentCategory);
    cardContainer.appendChild(card);
  });  
}

async function startRound() {
  const cardsData = await loadCategoryData();
  renderRound(cardsData);
}

startGameBtn.addEventListener("click", () => {
  const selectedCategory = document.querySelector("#category-options .selected");
  const selectedDifficulty = document.querySelector("#difficulty-options .selected");

  if (selectedCategory) currentCategory = selectedCategory.dataset.value;
  if (selectedDifficulty) {
    currentDifficulty = selectedDifficulty.dataset.value === "medium" ? 6 :
                        selectedDifficulty.dataset.value === "hard" ? 9 : 3;
    cardCount = currentDifficulty === "easy" ? 3 : currentDifficulty === "medium" ? 6 : 9;
  }

  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startRound();
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

