document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackElement = document.getElementById('feedback');
    const progressBar = document.getElementById('progress-bar');
    const storyElement = document.getElementById('story');
    const quizArea = document.getElementById('quiz-area');

    // Game state
    let correctAnswer;
    let progress = 0;
    const questionsToWin = 5; // Player needs to answer 5 questions to "win"

    function generateQuestion() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
        questionElement.textContent = `Berapa ${num1} + ${num2}?`;
        answerInput.value = '';
        answerInput.focus();
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);

        if (isNaN(userAnswer)) {
            feedbackElement.textContent = "Masukkan angka saja ya!";
            feedbackElement.style.color = 'orange';
            return;
        }

        if (userAnswer === correctAnswer) {
            feedbackElement.textContent = "Benar! Hebat!";
            feedbackElement.style.color = 'green';
            progress++;
            updateProgress();

            if (progress >= questionsToWin) {
                setTimeout(endGame, 1000);
            } else {
                setTimeout(() => {
                    feedbackElement.textContent = '';
                    generateQuestion();
                }, 1500); // Wait 1.5 seconds before the next question
            }
        } else {
            feedbackElement.textContent = `Salah, coba lagi ya!`;
            feedbackElement.style.color = 'red';
            answerInput.value = '';
            answerInput.focus();
        }
    }

    function updateProgress() {
        const progressPercentage = (progress / questionsToWin) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function endGame() {
        storyElement.textContent = "Misi telah selesai! Kamu pahlawan matematika!";
        quizArea.style.display = 'none'; // Hide quiz area
        feedbackElement.textContent = "Selamat, kamu berhasil!";
        feedbackElement.style.color = '#FF6347';
    }

    // Event Listeners
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    // Initial load
    generateQuestion();
});
