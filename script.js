document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const gameModeButtons = document.querySelectorAll('.gameMode');
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
    const timerElement = document.getElementById('timer');

    // Audio Elements
    const soundCorrect = document.getElementById('sound-correct');
    const soundWrong = document.getElementById('sound-wrong');
    const soundClick = document.getElementById('sound-click');

    // === GAME STATE & SETTINGS ===
    let score;
    let currentQuestionIndex;
    let correctAnswer;
    let isMuted = false;
    let timerInterval;
    let timeLeft;
    const TIME_LIMIT = 60; // 60 seconds for Time Attack
    const TOTAL_QUESTIONS = 5; // For Classic mode

    let gameSettings = {
        gameMode: 'classic',
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
        division_easy: { min: 2, max: 9 },
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
    function getHighScoreKey(mode, difficulty, operation) {
        if (!mode || !difficulty || !operation) return null;
        return `highscore-${mode}-${difficulty}-${operation}`;
    }

    function getHighScore(key) {
        return parseInt(localStorage.getItem(key), 10) || 0;
    }

    function setHighScore(key, score) {
        localStorage.setItem(key, score);
    }

    function updateHighScoreDisplay() {
        const key = getHighScoreKey(gameSettings.gameMode, gameSettings.difficulty, gameSettings.operation);
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

        showScreen('game-screen');

        if (gameSettings.gameMode === 'classic') {
            gameScreen.classList.remove('time-attack-mode');
            currentQuestionIndex = 0;
            updateUI();
            nextQuestion();
        } else if (gameSettings.gameMode === 'timeAttack') {
            gameScreen.classList.add('time-attack-mode');
            updateUI();
            startTimer();
            generateQuestion();
        }
    }

    function resetGame() {
        playSound(soundClick);
        stopTimer();
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        gameModeButtons[0].classList.add('selected');
        gameSettings.gameMode = 'classic';
        gameSettings.difficulty = null;
        gameSettings.operation = null;
        playerIcon.style.left = '0px';
        updateHighScoreDisplay();
        showScreen('start-screen');
    }

    // --- Timer Logic ---
    function startTimer() {
        timeLeft = TIME_LIMIT;
        timerElement.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- Core Game Loop ---
    function nextQuestion() { // Classic Mode loop
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
                const answer = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                if (num2 === 0) num2 = 1;
                num1 = answer * num2;
                correctAnswer = answer;
                questionText = `Berapa ${num1} ÷ ${num2}?`;
                break;
        }
        questionElement.textContent = questionText;
        triggerAnimation(questionElement, 'fadeIn');
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);
        if (isNaN(userAnswer)) {
            feedbackElement.textContent = "Masukkan angka saja ya!";
            feedbackElement.style.color = 'orange';
            return;
        }

        let isCorrect = (userAnswer === correctAnswer);

        if (isCorrect) {
            playSound(soundCorrect);
            feedbackElement.textContent = "Benar!";
            feedbackElement.style.color = 'green';
            score += 10;
            triggerAnimation(scoreElement, 'pop');
        } else {
            playSound(soundWrong);
            feedbackElement.textContent = `Salah!`;
            feedbackElement.style.color = 'red';
            triggerAnimation(gameScreen, 'shake');
        }

        if (gameSettings.gameMode === 'classic') {
            submitBtn.disabled = true;
            setTimeout(() => {
                submitBtn.disabled = false;
                nextQuestion();
            }, 1000);
        } else if (gameSettings.gameMode === 'timeAttack') {
            updateUI();
            if (isCorrect) {
                generateQuestion();
            }
            answerInput.value = '';
            answerInput.focus();
        }
    }

    function endGame() {
        stopTimer();
        finalScoreElement.textContent = score;
        const key = getHighScoreKey(gameSettings.gameMode, gameSettings.difficulty, gameSettings.operation);
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
            if (gameSettings.gameMode === 'classic') {
                let progressIndex = gameFinished ? currentQuestionIndex : currentQuestionIndex - 1;
                if (progressIndex < 0) progressIndex = 0;
                questionCounterElement.textContent = `${currentQuestionIndex > TOTAL_QUESTIONS ? TOTAL_QUESTIONS : currentQuestionIndex}/${TOTAL_QUESTIONS}`;
                const progress = progressIndex / TOTAL_QUESTIONS;
                playerIcon.style.left = `calc(${progress * 100}% - ${progress * 40}px)`;
            }
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        playSound(soundClick);
    }

    // === EVENT LISTENERS ===
    handleOptionSelection(gameModeButtons, 'gameMode');
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
