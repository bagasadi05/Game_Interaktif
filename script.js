document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const difficultyButtons = document.querySelectorAll('.difficulty');
    const operationButtons = document.querySelectorAll('.operation');
    const startGameBtn = document.getElementById('start-game-btn');
    const submitBtn = document.getElementById('submit-btn');
    const playAgainBtn = document.getElementById('play-again-btn');

    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const feedbackElement = document.getElementById('feedback');
    const progressBar = document.getElementById('progress-bar');
    const scoreElement = document.getElementById('score');
    const questionCounterElement = document.getElementById('question-counter');
    const finalScoreElement = document.getElementById('final-score');

    // === GAME STATE & SETTINGS ===
    let score;
    let currentQuestionIndex;
    let correctAnswer;
    const TOTAL_QUESTIONS = 5;

    let gameSettings = {
        difficulty: null,
        operation: null
    };

    const DIFFICULTY_RANGES = {
        easy: { min: 1, max: 10 },
        medium: { min: 10, max: 50 },
        hard: { min: 20, max: 100 },
        // Special ranges for multiplication to keep it manageable
        multiplication_easy: { min: 1, max: 5 },
        multiplication_medium: { min: 2, max: 10 },
        multiplication_hard: { min: 5, max: 12 }
    };

    // === FUNCTIONS ===

    // --- Screen Management ---
    function showScreen(screenId) {
        startScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        endScreen.classList.remove('active');
        document.getElementById(screenId).classList.add('active');
    }

    // --- Game Setup ---
    function handleOptionSelection(buttons, category) {
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                gameSettings[category] = button.dataset[category];
            });
        });
    }

    function startGame() {
        if (!gameSettings.difficulty || !gameSettings.operation) {
            alert("Silakan pilih tingkat kesulitan dan jenis operasi terlebih dahulu!");
            return;
        }

        score = 0;
        currentQuestionIndex = 0;
        updateUI();

        showScreen('game-screen');
        nextQuestion();
    }

    function resetGame() {
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        operationButtons.forEach(btn => btn.classList.remove('selected'));
        gameSettings.difficulty = null;
        gameSettings.operation = null;

        showScreen('start-screen');
    }

    // --- Core Game Loop ---
    function nextQuestion() {
        if (currentQuestionIndex >= TOTAL_QUESTIONS) {
            setTimeout(endGame, 500); // Give a moment before showing the end screen
            return;
        }
        currentQuestionIndex++;
        feedbackElement.textContent = '';
        answerInput.value = '';
        answerInput.focus();
        updateUI();
        generateQuestion();
    }

    function generateQuestion() {
        const { difficulty, operation } = gameSettings;

        const rangeKey = operation === 'multiplication' ? `${operation}_${difficulty}` : difficulty;
        const { min, max } = DIFFICULTY_RANGES[rangeKey];

        let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

        let questionText;

        switch(operation) {
            case 'addition':
                correctAnswer = num1 + num2;
                questionText = `Berapa ${num1} + ${num2}?`;
                break;
            case 'subtraction':
                if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure result isn't negative
                correctAnswer = num1 - num2;
                questionText = `Berapa ${num1} - ${num2}?`;
                break;
            case 'multiplication':
                correctAnswer = num1 * num2;
                questionText = `Berapa ${num1} x ${num2}?`;
                break;
        }

        questionElement.textContent = questionText;
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);

        if (isNaN(userAnswer)) {
            feedbackElement.textContent = "Masukkan angka saja ya!";
            feedbackElement.style.color = 'orange';
            return;
        }

        submitBtn.disabled = true; // Prevent double submission

        if (userAnswer === correctAnswer) {
            feedbackElement.textContent = "Benar! Hebat!";
            feedbackElement.style.color = 'green';
            score += 10;
        } else {
            feedbackElement.textContent = `Salah! Jawaban yang benar adalah ${correctAnswer}.`;
            feedbackElement.style.color = 'red';
        }

        updateUI();
        setTimeout(() => {
            submitBtn.disabled = false;
            nextQuestion();
        }, 1800); // Wait before showing the next question
    }

    function endGame() {
        finalScoreElement.textContent = score;
        showScreen('end-screen');
    }

    function updateUI() {
        scoreElement.textContent = score;
        // Update counter only during the game
        if (gameScreen.classList.contains('active')) {
            questionCounterElement.textContent = `${currentQuestionIndex}/${TOTAL_QUESTIONS}`;
            const progressPercentage = ((currentQuestionIndex -1) / TOTAL_QUESTIONS) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    // === EVENT LISTENERS ===
    handleOptionSelection(difficultyButtons, 'difficulty');
    handleOptionSelection(operationButtons, 'operation');

    startGameBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', resetGame);
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    // === INITIALIZATION ===
    showScreen('start-screen');
});
