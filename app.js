// 按鈕位置狀態管理
let buttonsPosition = localStorage.getItem("buttonsPosition") || "left";

// 初始化位置
function initializePosition() {
  const container = document.getElementById("list-container");
  const icon = document.getElementById("position-icon");
  const scrollBtn = document.getElementById("scroll-to-top");

  if (buttonsPosition === "right") {
    container.classList.add("buttons-right");
    icon.textContent = "靠右";
    if (scrollBtn) scrollBtn.classList.remove("left");
  } else {
    container.classList.remove("buttons-right");
    icon.textContent = "靠左";
    if (scrollBtn) scrollBtn.classList.add("left");
  }
}

// 切換位置
function togglePosition() {
  buttonsPosition = buttonsPosition === "left" ? "right" : "left";
  localStorage.setItem("buttonsPosition", buttonsPosition);
  initializePosition();
}

// 滾動到指定區段
function scrollToSection(sectionName) {
  const sectionId = "section-" + encodeURIComponent(sectionName);
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// 建立區段導航列
function createSectionNav(sectionNames) {
  const nav = document.getElementById("section-nav");

  sectionNames.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "section-nav-btn";
    btn.textContent = name;
    btn.onclick = () => scrollToSection(name);
    nav.appendChild(btn);
  });
}

async function loadData() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const container = document.getElementById("list-container");

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();

    // Hide loading
    loading.classList.add("hidden");

    // Create section navigation
    createSectionNav(Object.keys(data));

    // Iterate through sections
    Object.entries(data).forEach(([sectionName, items]) => {
      const section = createSection(sectionName, items);
      container.appendChild(section);
    });
  } catch (err) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
    console.error("Error loading data:", err);
  }
}

function createSection(sectionName, items) {
  const section = document.createElement("div");
  section.className = "section-container";
  section.id = "section-" + encodeURIComponent(sectionName);

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = sectionName;

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "section-cards";

  items.forEach((item) => {
    const card = createListItem(item);
    cardsContainer.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(cardsContainer);

  return section;
}

function formatRomaji(romaji) {
  return romaji
    .split("-")
    .map((syllable) => `<span class="romaji-syllable">${syllable}</span>`)
    .join("");
}

function createListItem(item) {
  const card = document.createElement("div");
  card.className = "flat-card rounded-lg p-6";

  const hasNote = item.註解 && item.註解.trim() !== "";
  const emoji = item.emoji || "💬";

  card.innerHTML = `
                <div class="flex items-start gap-4">
                    <!-- Play Buttons -->
                    <div class="flex flex-col gap-2 flex-shrink-0">
                        <button class="play-button" data-audio="${
                          item.音檔 ? "voice/" + item.音檔 : ""
                        }" data-speed="1.0" ${
    !item.音檔 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ""
  }>
                            <div class="play-icon"></div>
                        </button>
                        <button class="play-button slow" data-audio="${
                          item.音檔 ? "voice/" + item.音檔 : ""
                        }" data-speed="0.50" ${
    !item.音檔 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ""
  }>
                            <span class="text-xl leading-none">🐢</span>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <!-- Chinese with emoji -->
                        <div class="mb-3">
                            <p class="text-gray-dark font-semibold text-lg leading-relaxed">
                                ${emoji} ${item.中文}
                            </p>
                        </div>

                        <!-- Japanese -->
                        <div class="mb-2 pl-6">
                            <p class="text-gray-dark japanese-text font-bold text-3xl leading-relaxed">
                                ${item.日文}
                            </p>
                        </div>

                        <!-- Romaji -->
                        <div class="mb-3 pl-6">
                            <p class="text-gray-text text-xl tracking-wide leading-relaxed">
                                ${formatRomaji(item.羅馬拼音)}
                            </p>
                        </div>

                        ${
                          hasNote
                            ? `
                        <!-- Note Section -->
                        <div class="mt-4 pt-3 border-t border-gray-border">
                            <div class="bg-gray-hover rounded-lg px-4 py-2 border border-gray-border">
                                <p class="text-gray-text text-sm leading-relaxed">
                                    💡 ${item.註解}
                                </p>
                            </div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;

  return card;
}

// Audio player
let currentAudio = null;
let currentButton = null;

function playAudio(audioFile, button, speed = 1.0) {
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentButton) {
      currentButton.classList.remove("playing");
    }
  }

  // If clicking the same button, just stop
  if (currentButton === button && currentAudio) {
    currentAudio = null;
    currentButton = null;
    return;
  }

  // Play new audio
  currentAudio = new Audio(audioFile);
  currentAudio.playbackRate = speed;
  currentButton = button;
  button.classList.add("playing");

  currentAudio.play().catch((err) => {
    console.error("Audio playback failed:", err);
    button.classList.remove("playing");
  });

  currentAudio.addEventListener("ended", () => {
    button.classList.remove("playing");
    currentAudio = null;
    currentButton = null;
  });
}

// Add click listeners to play buttons
document.addEventListener("click", (e) => {
  const button = e.target.closest(".play-button");
  if (button && !button.disabled) {
    const audioFile = button.dataset.audio;
    const speed = parseFloat(button.dataset.speed) || 1.0;
    if (audioFile) {
      playAudio(audioFile, button, speed);
    }
  }
});

// Scroll to top functionality
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function toggleScrollToTopButton() {
  const scrollBtn = document.getElementById("scroll-to-top");
  if (window.scrollY > 300) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
}

// Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializePosition();

  const toggleBtn = document.getElementById("toggle-position");
  toggleBtn.addEventListener("click", togglePosition);

  const scrollBtn = document.getElementById("scroll-to-top");
  scrollBtn.addEventListener("click", scrollToTop);

  window.addEventListener("scroll", toggleScrollToTopButton);

  loadData();
});
