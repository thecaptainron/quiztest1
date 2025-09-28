let questions = [];
let currentQuestion = 0;
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
let weakAreas = {};

const quizDiv = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const resultsDiv = document.getElementById('results');
const progressDiv = document.getElementById('progress');

// Load questions
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    questions.forEach(q => weakAreas[q.topic] = { correct: 0, total: 0 });
    loadQuestion();
  });

// Load current question
function loadQuestion() {
  if (currentQuestion >= questions.length) { 
    progressDiv.style.width = "100%"; 
    showResults(); 
    return; 
  }

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

// Handle Next Question button
nextBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) { 
    alert("Please select an answer."); 
    return; 
  }

  const q = questions[currentQuestion];
  const isCorrect = selected.value === q.correct;

  // Save answer
  userAnswers[currentQuestion] = { questionId: q.id, selected: selected.value, correct: isCorrect };
  weakAreas[q.topic].total++;
  if (isCorrect) weakAreas[q.topic].correct++;

  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));

  currentQuestion++;
  loadQuestion();
});

// Update progress bar
function updateProgress() {
  const percent = ((currentQuestion) / questions.length) * 100;
  progressDiv.style.width = percent + "%";
}

// Show results and study plan
function showResults() {
  quizDiv.innerHTML = "";
  nextBtn.style.display = "none";

  let html = "<h2>Results</h2>";

  // Individual question results
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

  // Performance by topic
  html += "<h3>Performance by Topic</h3><ul>";
  for (let topic in weakAreas) {
    const t = weakAreas[topic];
    const percent = t.total ? Math.round((t.correct / t.total) * 100) : 0;
    html += `<li>${topic}: ${percent}% correct (${t.correct} of ${t.total})</li>`;
  }
  html += "</ul>";

  // Study Plan
  html += "<h3>Your Personalized Study Plan</h3><ul>";
  const sortedTopics = Object.keys(weakAreas).sort((a,b) => {
    const pa = weakAreas[a].total ? weakAreas[a].correct / weakAreas[a].total : 0;
    const pb = weakAreas[b].total ? weakAreas[b].correct / weakAreas[b].total : 0;
    return pa - pb;
  });

  sortedTopics.forEach(topic => {
    const t = weakAreas[topic];
    const percent = t.total ? Math.round((t.correct / t.total) * 100) : 0;
    let priority = "";
    if (percent < 50) priority = "High priority – focus heavily";
    else if (percent < 75) priority = "Medium priority – review key concepts";
    else priority = "Low priority – light review";

    let focusPoints = "";
    switch(topic){
      case "Codes": focusPoints = "Egress calculations, occupant loads, corridor widths, door swing directions"; break;
      case "Accessibility": focusPoints = "ADA clearances, turning radii, reach ranges, signage requirements"; break;
      case "Programming": focusPoints = "Net-to-gross calculations, space planning, square footage formulas"; break;
      case "Electrical": focusPoints = "Lighting levels, task vs. ambient lighting, circuit planning"; break;
      default: focusPoints = "Review relevant concepts";
    }

    html += `<li><strong>${topic}</strong> – ${priority} (${percent}% correct)<br>`;
    html += `Suggested focus: ${focusPoints}</li>`;
  });
  html += "</ul>";

  resultsDiv.innerHTML = html;

  // Clear storage after rendering
  localStorage.clear();

  // Save missed categories to localStorage
localStorage.setItem("studyPlan", JSON.stringify(studyPlan));

// Show study notes link
document.getElementById("studyNotesLink").style.display = "block";

  // Show study notes link after results
document.getElementById("studyNotesLink").style.display = "block";

}
