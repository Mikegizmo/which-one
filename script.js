let currentRound = 0;
let score = 0;
const totalRounds = 5;

const cardContainer = document.getElementById("card-container");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");
const nextRoundBtn = document.getElementById("next-round");
const categorySelect = document.querySelector(".category-select");

let correctIndex = -1;
let currentCategory = null;

async function loadCategoryData(category) {
  const response = await fetch(`./data/${category}.json`);
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
  nextRoundBtn.classList.remove("hidden");

  setTimeout(() => {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.classList.remove("lock");
  }, 3000);
}

function renderRound(data) {
  cardContainer.innerHTML = "";
  message.textContent = "";
  nextRoundBtn.classList.add("hidden");

  // Extract 4 similar + 1 different items dynamically
  const similarItems = shuffleArray(data.similar).slice(0, 4);
  const differentItem = shuffleArray(data.different)[0];

  const allItems = [...similarItems];
  correctIndex = Math.floor(Math.random() * 5);
  allItems.splice(correctIndex, 0, differentItem);

  allItems.forEach((item, index) => {
    const card = createCard(item, index);
    cardContainer.appendChild(card);
  });
}

async function startGame() {
  if (!currentCategory) return;

  currentRound = 0;
  score = 0;
  scoreDisplay.textContent = score;
  nextRoundBtn.textContent = "Next Round";

  categorySelect.style.display = "none";
  cardContainer.style.display = "flex";

  const data = await loadCategoryData(currentCategory);
  renderRound(data);
}

nextRoundBtn.addEventListener("click", async () => {
  currentRound++;
  if (currentRound < totalRounds) {
    const data = await loadCategoryData(currentCategory);
    renderRound(data);
  } else {
    message.textContent = `Game over! Final score: ${score}/${totalRounds}`;
    nextRoundBtn.textContent = "Play Again";
    nextRoundBtn.onclick = () => location.reload();
  }
});

document.querySelectorAll(".category-select button").forEach(button => {
  button.addEventListener("click", () => {
    currentCategory = button.getAttribute("data-category");
    startGame();
  });
});
