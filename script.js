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
    const muteBtn = document.getElementById('mute-btn');

    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');
    const questionCounterElement = document.getElementById('question-counter');
    const finalScoreElement = document.getElementById('final-score');
    const playerIcon = document.getElementById('player-icon');
    const highScoreElement = document.getElementById('high-score');

    // Audio Elements
    const soundCorrect = document.getElementById('sound-correct');
    const soundWrong = document.getElementById('sound-wrong');
    const soundClick = document.getElementById('sound-click');

    // === GAME STATE & SETTINGS ===
    let score;
    let currentQuestionIndex;
    let correctAnswer;
    let isMuted = false;
    const TOTAL_QUESTIONS = 5;

    let gameSettings = {
        difficulty: null,
        operation: null
    };

    const DIFFICULTY_RANGES = {
        easy: { min: 1, max: 10 },
        medium: { min: 10, max: 50 },
        hard: { min: 20, max: 100 },
        multiplication_easy: { min: 2, max: 9 },
        multiplication_medium: { min: 3, max: 12 },
        multiplication_hard: { min: 5, max: 15 },
        division_easy: { min: 2, max: 9 }, // Divisor range
        division_medium: { min: 3, max: 12 },
        division_hard: { min: 5, max: 15 }
    };

    const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'];

    // === FUNCTIONS ===

    function triggerAnimation(element, animationClass) {
        element.classList.add(animationClass);
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }

    function playSound(sound) {
        if (!isMuted) {
            sound.currentTime = 0;
            sound.play().catch(error => console.error(`Audio play failed: ${error}`));
        }
    }

    // --- High Score Logic ---
    function getHighScoreKey(difficulty, operation) {
        if (!difficulty || !operation) return null;
        return `highscore-${difficulty}-${operation}`;
    }

    function getHighScore(key) {
        return parseInt(localStorage.getItem(key), 10) || 0;
    }

    function setHighScore(key, score) {
        localStorage.setItem(key, score);
    }

    function updateHighScoreDisplay() {
        const key = getHighScoreKey(gameSettings.difficulty, gameSettings.operation);
        if (key) {
            const highScore = getHighScore(key);
            highScoreElement.textContent = highScore;
        } else {
            highScoreElement.textContent = '...';
        }
    }

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
                playSound(soundClick);
                triggerAnimation(button, 'pop');
                buttons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                gameSettings[category] = button.dataset[category];
                updateHighScoreDisplay();
            });
        });
    }

    function startGame() {
        if (!gameSettings.difficulty || !gameSettings.operation) {
            alert("Silakan pilih tingkat kesulitan dan jenis operasi terlebih dahulu!");
            return;
        }
        playSound(soundClick);
        score = 0;
        currentQuestionIndex = 0;
        updateUI();
        showScreen('game-screen');
        nextQuestion();
    }

    function resetGame() {
        playSound(soundClick);
        difficultyButtons.forEach(btn => btn.classList.remove('selected'));
        operationButtons.forEach(btn => btn.classList.remove('selected'));
        gameSettings.difficulty = null;
        gameSettings.operation = null;
        playerIcon.style.left = '0px';
        updateHighScoreDisplay();
        showScreen('start-screen');
    }

    // --- Core Game Loop ---
    function nextQuestion() {
        if (currentQuestionIndex >= TOTAL_QUESTIONS) {
            updateUI(true);
            setTimeout(endGame, 800);
            return;
        }
        currentQuestionIndex++;
        feedbackElement.textContent = '';
        answerInput.value = '';
        answerInput.focus();
        updateUI();
        generateQuestion();
        triggerAnimation(questionElement, 'fadeIn');
    }

    function generateQuestion() {
        const { difficulty } = gameSettings;
        let operation = gameSettings.operation;

        // If mode is 'mixed', pick a random operation for this question
        if (operation === 'mixed') {
            operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
        }

        const rangeKey = `${operation}_${difficulty}`;
        const defaultRangeKey = difficulty;
        const { min, max } = DIFFICULTY_RANGES[rangeKey] || DIFFICULTY_RANGES[defaultRangeKey];

        let num1, num2;
        let questionText;

        switch(operation) {
            case 'addition':
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                correctAnswer = num1 + num2;
                questionText = `Berapa ${num1} + ${num2}?`;
                break;
            case 'subtraction':
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                if (num1 < num2) [num1, num2] = [num2, num1];
                correctAnswer = num1 - num2;
                questionText = `Berapa ${num1} - ${num2}?`;
                break;
            case 'multiplication':
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                correctAnswer = num1 * num2;
                questionText = `Berapa ${num1} x ${num2}?`;
                break;
            case 'division':
                // Work backwards to ensure whole number result
                const answer = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                num1 = answer * num2;
                correctAnswer = answer;
                questionText = `Berapa ${num1} ÷ ${num2}?`;
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
        submitBtn.disabled = true;

        if (userAnswer === correctAnswer) {
            playSound(soundCorrect);
            feedbackElement.textContent = "Benar! Hebat!";
            feedbackElement.style.color = 'green';
            score += 10;
            triggerAnimation(scoreElement, 'pop');
        } else {
            playSound(soundWrong);
            feedbackElement.textContent = `Salah! Jawaban yang benar adalah ${correctAnswer}.`;
            feedbackElement.style.color = 'red';
            triggerAnimation(gameScreen, 'shake');
        }

        setTimeout(() => {
            submitBtn.disabled = false;
            nextQuestion();
        }, 1800);
    }

    function endGame() {
        finalScoreElement.textContent = score;

        const key = getHighScoreKey(gameSettings.difficulty, gameSettings.operation);
        const currentHighScore = getHighScore(key);
        if (score > currentHighScore) {
            setHighScore(key, score);
            updateHighScoreDisplay();
        }

        showScreen('end-screen');
    }

    function updateUI(gameFinished = false) {
        scoreElement.textContent = score;
        if (gameScreen.classList.contains('active')) {
            let progressIndex = gameFinished ? currentQuestionIndex : currentQuestionIndex - 1;
            if (progressIndex < 0) progressIndex = 0;
            questionCounterElement.textContent = `${currentQuestionIndex > TOTAL_QUESTIONS ? TOTAL_QUESTIONS : currentQuestionIndex}/${TOTAL_QUESTIONS}`;
            const progress = progressIndex / TOTAL_QUESTIONS;
            playerIcon.style.left = `calc(${progress * 100}% - ${progress * 40}px)`;
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        playSound(soundClick);
    }

    // === EVENT LISTENERS ===
    handleOptionSelection(difficultyButtons, 'difficulty');
    handleOptionSelection(operationButtons, 'operation');

    startGameBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', resetGame);
    muteBtn.addEventListener('click', toggleMute);
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    // === INITIALIZATION ===
    resetGame();
    showScreen('start-screen');
});
