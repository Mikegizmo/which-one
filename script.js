let currentRound = 0;
let score = 0;
const totalRounds = 5;

const cardContainer = document.getElementById("card-container");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");
const nextRoundBtn = document.getElementById("next-round");

let correctIndex = -1;

async function loadCategoryData() {
  const response = await fetch("./data/colors.json");
  return response.json();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCard(color, index) {
  const card = document.createElement("div");
  card.classList.add("card");

  const colorBox = document.createElement("div");
  colorBox.classList.add("color-box");
  colorBox.style.backgroundColor = color;

  card.appendChild(colorBox);
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
  nextRoundBtn.classList.remove("hidden");

  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.classList.remove("lock");
  }, 3000);
}

function renderRound(colorsData) {
  cardContainer.innerHTML = "";
  message.textContent = "";
  nextRoundBtn.classList.add("hidden");

  const similarColors = shuffleArray(colorsData.similar).slice(0, 4);
  const oddColor = shuffleArray(colorsData.different)[0];

  const allColors = [...similarColors];
  correctIndex = Math.floor(Math.random() * 5);
  allColors.splice(correctIndex, 0, oddColor);

  allColors.forEach((color, index) => {
    const card = createCard(color, index);
    cardContainer.appendChild(card);
  });
}

async function startGame() {
  const colorsData = await loadCategoryData();
  renderRound(colorsData);
}

nextRoundBtn.addEventListener("click", () => {
  currentRound++;
  if (currentRound < totalRounds) {
    startGame();
  } else {
    message.textContent = `Game over! Final score: ${score}/${totalRounds}`;
    nextRoundBtn.textContent = "Play Again";
    nextRoundBtn.onclick = () => location.reload();
  }
});

startGame();
