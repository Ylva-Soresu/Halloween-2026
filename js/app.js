const slides = [...document.querySelectorAll(".slide")],
  dots = [...document.querySelectorAll(".dot")],
  current = document.querySelector("#current");
  
let isTransitioning = false;
function go(i) {
  i = Math.max(0, Math.min(i, slides.length - 1));

  if (isTransitioning) return;

  const currentSlide = slides.findIndex((slide) =>
    slide.classList.contains("is-visible")
  );

  if (i === currentSlide) return;

  isTransitioning = true;

  /* Neue Slide vorbereiten */
  slides[i].classList.add("transitioning");

  /* Normales Scrollen zur nächsten Slide */
  slides[i].scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  /* Übergang wieder freigeben */
  setTimeout(() => {
    isTransitioning = false;
  }, 1000);
}

const observer = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = slides.indexOf(e.target);
      e.target.classList.add("is-visible");
      e.target.classList.remove("transitioning");
      dots.forEach((d, n) => d.classList.toggle("active", n === i));
      if (current) current.textContent = String(i + 1).padStart(2, "0");
    }),
  { threshold: 0.6 },
);
slides.forEach((s) => observer.observe(s));
document
  .querySelectorAll("[data-next]")
  .forEach(
    (b) => (b.onclick = () => go(slides.indexOf(b.closest(".slide")) + 1)),
  );
dots.forEach((d, i) => (d.onclick = () => go(i)));
document.onkeydown = (e) => {
  const i = slides.findIndex((s) => s.classList.contains("is-visible"));
  if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) go(i + 1);
  if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) go(i - 1);
};
slides[0].classList.add("is-visible");

/* =========================================================
   VOTING + GOOGLE SHEETS
   ========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwTMAN22O3k4A7z9ACioZKDcNQQ-W0Mx-p808U-j8ICMjdEOCd12589wDMszv2jhKZOcA/exec";

const nameInput = document.querySelector("#guest-name");
const voteButtons = [...document.querySelectorAll(".vote-button")];
const voteStatus = document.querySelector(".vote-status");

let voteSubmitted = false;

function updateVoteButtons() {
  const hasName = nameInput && nameInput.value.trim().length > 0;

  voteButtons.forEach((button) => {
    button.disabled = !hasName || voteSubmitted;
  });
}

if (nameInput) {
  nameInput.addEventListener("input", updateVoteButtons);
}

voteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (voteSubmitted) return;

    const name = nameInput.value.trim();

    if (!name) return;

    const answer = button.dataset.vote === "yes"
      ? "Komme"
      : "Komme nicht";

    /* Abstimmung sofort sperren */
    voteSubmitted = true;

    nameInput.disabled = true;

    voteButtons.forEach((otherButton) => {
      otherButton.disabled = true;
    });

    /* Gewählte Antwort markieren */
    button.classList.add("selected");

    /* Daten an Google Sheets senden */
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        name: name,
        answer: answer,
      }),
    }).catch((error) => {
      console.error("Fehler beim Speichern:", error);
    });
  });
});

updateVoteButtons();
