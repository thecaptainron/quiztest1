let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];

// Load questions
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    showQuestion();
    updateProgress();
  });

function showQuestion() {
  const container = document.getElementById("quiz");
  const question = questions[currentQuestionIndex];
  if (!question) return;

  container.innerHTML = `
    <div class="question-block">
      <h2>Question ${currentQuestionIndex + 1} of ${questions.length}</h2>
      <p class="question-text">${question.question}</p>
      <ul class="options">
        ${question.options
          .map(
            (opt, i) => `
          <li>
            <label>
              <input type="radio" name="answer" value="${i}">
              ${opt}
            </label>
          </li>`
          )
          .join("")}
      </ul>
      <button onclick="nextQuestion()" class="btn">Next Question</button>
    </div>
  `;
}

function nextQuestion() {
  const selected = document.querySelector("input[name='answer']:checked");
  if (!selected) {
    alert("Please select an answer.");
    return;
  }

  const answer = parseInt(selected.value);
  userAnswers[currentQuestionIndex] = answer;

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
    updateProgress();
  } else {
    showResults();
  }
}

function updateProgress() {
  const progress = document.getElementById("progress");
  const percent = ((currentQuestionIndex) / questions.length) * 100;
  progress.style.width = `${percent}%`;
}

function showResults() {
  const container = document.getElementById("quiz");
  let score = 0;
  let studyPlan = {};
  let missedQuestions = [];

  questions.forEach((q, i) => {
    const correct = userAnswers[i] === q.answer;
    if (correct) {
      score++;
    } else {
      // Count misses by category
      studyPlan[q.category] = (studyPlan[q.category] || 0) + 1;
      // Store missed question with user answer
      q.userAnswer = userAnswers[i];
      missedQuestions.push(q);
    }
  });

  container.innerHTML = `
    <h2>Results</h2>
    <p>You scored ${score} out of ${questions.length}.</p>
    <h3>Study Plan</h3>
    ${
      Object.keys(studyPlan).length === 0
        ? "<p>Great job! No weak categories 🎉</p>"
        : `<ul>${Object.entries(studyPlan)
            .map(([cat, count]) => `<li>${cat}: ${count} missed</li>`)
            .join("")}</ul>`
    }
  `;

  // Save to localStorage for notes page
  localStorage.setItem("studyPlan", JSON.stringify(studyPlan));
  localStorage.setItem("missedQuestions", JSON.stringify(missedQuestions));

  // Show study notes link
  document.getElementById("studyNotesLink").style.display = "block";
}
