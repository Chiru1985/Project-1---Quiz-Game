const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreContainer = document.getElementById('score-container');
const progressBar = document.getElementById('progress');

let shuffledQuestions, currentQuestionIndex, score;

startButton.addEventListener('click', startGame);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});

async function startGame() {
    startButton.classList.add('hide');
    scoreContainer.classList.add('hide');
    shuffledQuestions = await fetchQuestions();
    currentQuestionIndex = 0;
    score = 0;
    questionContainerElement.classList.remove('hide');
    setNextQuestion();
    updateProgressBar();
}

async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=15&category=21&difficulty=medium&type=multiple');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('There was an error fetching the questions. Please try again later.');
        return [];
    }
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < shuffledQuestions.length) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
        updateProgressBar();
    } else {
        endGame();
    }
}

function showQuestion(question) {
    questionElement.innerHTML = question.question;
    const answers = [...question.incorrect_answers, question.correct_answer];
    answers.sort(() => Math.random() - 0.5);
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer;
        button.classList.add('btn');
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearStatusClass(document.body);
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.innerHTML === shuffledQuestions[currentQuestionIndex].correct_answer;
    setStatusClass(selectedButton, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.innerHTML === shuffledQuestions[currentQuestionIndex].correct_answer);
    });
    if (correct) score++;
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        endGame();
    }
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function endGame() {
    questionContainerElement.classList.add('hide');
    nextButton.classList.add('hide');
    
    const scorePercentage = Math.round((score / shuffledQuestions.length) * 100);
    
    let resultMessage = '';
    let resultEmoji = '';
    
    if (scorePercentage >= 90) {
        resultMessage = "Excellent! 🏆 You're a Sports Genius!";
        resultEmoji = "🥇";
    } else if (scorePercentage >= 70) {
        resultMessage = "Great Job! 👏 You Know Your Sports!";
        resultEmoji = "🥈";
    } else if (scorePercentage >= 50) {
        resultMessage = "Good Effort! 👍 Keep Learning!";
        resultEmoji = "🥉";
    } else {
        resultMessage = "Keep Practicing! 💪 Sports Knowledge Takes Time!";
        resultEmoji = "📚";
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container');
    resultsContainer.innerHTML = `
        <h2>Quiz Results ${resultEmoji}</h2>
        <div class="result-details">
            <p class="total-score">Total Score: ${score} / ${shuffledQuestions.length}</p>
            <p class="percentage">Percentage: ${scorePercentage}%</p>
            <p class="performance-message">${resultMessage}</p>
        </div>
        <div class="result-breakdown">
            <h3>Performance Breakdown</h3>
            <div class="breakdown-stats">
                <p>✅ Correct Answers: ${score}</p>
                <p>❌ Incorrect Answers: ${shuffledQuestions.length - score}</p>
                <p>📊 Accuracy Rate: ${scorePercentage}%</p>
            </div>
        </div>
        <button id="restart-btn" class="btn restart-btn">Restart Quiz</button>
    `;

    scoreContainer.innerHTML = '';
    scoreContainer.appendChild(resultsContainer);
    scoreContainer.classList.remove('hide');

    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
        scoreContainer.classList.add('hide');
        startGame();
    });
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}
