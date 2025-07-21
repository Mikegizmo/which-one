// script.js

let currentRound = 0;
let score = 0;
let totalRounds = 5;
let correctIndex = -1;
let currentCategory = "colors";
let currentDifficulty = "easy";
let cardCount = 3;

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

function createCard(content, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  console.log(content);

  // For colors, content might be a color string; for others, an object with image or text
  if (typeof content === "string" && content.startsWith("#")) {
    // Color box
    const colorBox = document.createElement("div");
    colorBox.classList.add("color-box");
    colorBox.style.backgroundColor = content;
    card.appendChild(colorBox);
  } else if (content.image) {
    // Image card
    const img = document.createElement("img");
    img.src = content.image;
    img.alt = content.alt || "";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    card.appendChild(img);
  } else if (typeof content === "string") {
    // Text card (for Spanish words)
    const textBox = document.createElement("div");
    textBox.classList.add("text-box");
    textBox.textContent = content;
    textBox.style.fontSize = "1.5em";
    card.appendChild(textBox);
  }

  card.addEventListener("click", () => handleCardClick(index, card));
  return card;
}

function handleCardClick(index, card) {
  if (document.body.classList.contains("lock")) return;

  document.body.classList.add("lock");

  if (index === correctIndex) {
    score++;
    message.textContent = "Correct!";
    document.body.style.backgroundColor = "#a6f4a6";
  } else {
    message.textContent = "Incorrect. Try again next time.";
    document.body.style.backgroundColor = "#f4a6a6";
  }

  scoreDisplay.textContent = score;
  nextRoundBtn.classList.add("hidden");

  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.classList.remove("lock");

    currentRound++;
    if (currentRound < totalRounds) {
      startRound();
    } else {
      message.textContent = `Game over! Final score: ${score}/${totalRounds}`;
      nextRoundBtn.textContent = "Play Again";
      nextRoundBtn.classList.remove("hidden");
      nextRoundBtn.onclick = () => location.reload();
    }
  }, 3000);
}

function getRandomGroup(groups) {
  const keys = Object.keys(groups);
  return keys[Math.floor(Math.random() * keys.length)];
}

// function renderRound(cardsData) {
//   cardContainer.innerHTML = "";
//   message.textContent = "";
//   nextRoundBtn.classList.add("hidden");

//   const groups = cardsData.colorGroups;
//   const groupNames = Object.keys(groups);

//   // 1. Pick one group as the base (similar colors)
//   const baseGroupName = getRandomGroup(groups);
//   let oddGroupName = getRandomGroup(groups);

//   // 2. Make sure the odd group is different
//   while (oddGroupName === baseGroupName) {
//     oddGroupName = getRandomGroup(groups);
//   }

//   const baseColors = shuffleArray(groups[baseGroupName]);
//   console.log(baseColors);
//   const oddColors = shuffleArray(groups[oddGroupName]);

//   const numberOfCards = currentDifficulty; // easy: 3, medium: 6, hard: 9
//   console.log(currentDifficulty);

//   // 3. Choose one odd color
//   const oddColor = oddColors[0];

//   // 4. Fill the rest with base colors
//   const similarColors = baseColors.slice(0, numberOfCards - 1);

//   const allColors = [...similarColors];
//   correctIndex = Math.floor(Math.random() * numberOfCards);
//   allColors.splice(correctIndex, 0, oddColor);

//   allColors.forEach((color, index) => {
//     const card = createCard(color, index);
//     cardContainer.appendChild(card);
//   });
// }
function renderRound(data) {
  cardContainer.innerHTML = "";
  message.textContent = "";
  nextRoundBtn.classList.add("hidden");
  const numCards = currentDifficulty;

   // Set grid layout
  cardContainer.className = "card-container"; // reset classes
  if (numCards === 6) {
    cardContainer.classList.add("grid-3x2");
  } else if (numCards === 9) {
    cardContainer.classList.add("grid-3x3");
  }

  let items = [];
  let correctItem;
  if (currentCategory === "colors") {
    const groups = Object.values(data.colorGroups);
    const groupIndex = Math.floor(Math.random() * groups.length);
    const correctGroup = groups[groupIndex];
    const oddGroup = groups[(groupIndex + 1) % groups.length];

    const numCards = currentDifficulty;
    items = shuffleArray(correctGroup).slice(0, numCards - 1);
    correctItem = shuffleArray(oddGroup)[0];

    correctIndex = Math.floor(Math.random() * numCards);
    items.splice(correctIndex, 0, correctItem);
  } else {
    // For other categories (with similar/different structure)
    const numCards = currentDifficulty;
    const similarItems = shuffleArray(data.similar).slice(0, numCards - 1);
    const oddItem = shuffleArray(data.different)[0];
    items = [...similarItems];
    correctIndex = Math.floor(Math.random() * numCards);
    items.splice(correctIndex, 0, oddItem);
  }

  items.forEach((item, index) => {
    const card = createCard(item, index, currentCategory);
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

// Add toggle behavior for category and difficulty buttons
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
