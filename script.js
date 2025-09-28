let questions = [];
let currentQuestion = 0;
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
let weakAreas = {};

const quizDiv = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const resultsDiv = document.getElementById('results');
const progressDiv = document.getElementById('progress');

fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    questions.forEach(q => weakAreas[q.topic] = { correct: 0, total: 0 });
    loadQuestion();
  });

function loadQuestion() {
  if (currentQuestion >= questions.length) { showResults(); return; }
  const q = questions[currentQuestion];
  let html = `<div class="question"><strong>Topic: ${q.topic}</strong><p>${q.question}</p></div><ul class="options">`;
  for (let key in q.options) {
    const checked = userAnswers[currentQuestion]?.selected === key ? "checked" : "";
    html += `<li><label><input type="radio" name="answer" value="${key}" ${checked}> ${key}: ${q.options[key]}</label></li>`;
  }
  html += "</ul>";
  quizDiv.innerHTML = html;
  nextBtn.textContent = currentQuestion === questions.length - 1 ? "Finish" : "Next Question";
  updateProgress();
}

nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) { alert("Please select an answer."); return; }

  const q = questions[currentQuestion];
  const isCorrect = selected.value === q.correct;

  userAnswers[currentQuestion] = { questionId: q.id, selected: selected.value, correct: isCorrect };
  weakAreas[q.topic].total++;
  if (isCorrect) weakAreas[q.topic].correct++;

  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
  currentQuestion++;
  loadQuestion();
});

function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressDiv.style.width = percent + "%";
}

function showResults() {
  quizDiv.innerHTML = "";
  nextBtn.style.display = "none";
  localStorage.clear();

  let html = "<h2>Results</h2>";

  // Show individual question results
  questions.forEach((q, index) => {
    const user = userAnswers[index]?.selected || "No Answer";
    const isCorrect = user === q.correct;
    html += `<div class="result ${isCorrect ? "correct" : "incorrect"}">`;
    html += `<strong>Topic:</strong> ${q.topic}<br>`;
    html += `<strong>Q:</strong> ${q.question}<br>`;
    html += `<strong>Your answer:</strong> ${user} - ${q.options[user] || "Not answered"}<br>`;
    html += `<strong>Correct answer:</strong> ${q.correct} - ${q.options[q.correct]}<br>`;
    html += `<strong>Explanation:</strong> ${q.explanation}</div><br>`;
  });

  // Show weak area summary
  html += "<h3>Performance by Topic</h3><ul>";
  for (let topic in weakAreas) {
    const t = weakAreas[topic];
    const percent = t.total ? Math.round((t.correct / t.total) * 100) : 0;
    html += `<li>${topic}: ${percent}% correct (${t.correct} of ${t.total})</li>`;
  }
  html += "</ul>";

  resultsDiv.innerHTML = html;
}
