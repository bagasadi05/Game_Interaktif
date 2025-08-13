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
        multiplication_easy: { min: 1, max: 5 },
        multiplication_medium: { min: 2, max: 10 },
        multiplication_hard: { min: 5, max: 12 }
    };

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
                if (num1 < num2) [num1, num2] = [num2, num1];
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
