let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
let userAnswers = []; // Store answers and correctness

// Selecting Elements
let infobox = document.getElementById('infoBox');
let startbutton = document.querySelector('.start_btn button');
let continuebutton = document.querySelector('.continue');
let quitbutton = document.querySelector('.quit');
let quizbox = document.getElementById('quizBox');
let resultbox = document.getElementById('resultBox');
let que_text = document.querySelector('.que_text');
let TIMER = document.getElementById('timer');
let SCORE = document.getElementById('scoreText');

// Function that initializes all Event listeners at once
function setupEventListeners() {
    startbutton.addEventListener('click', showinfo);
    continuebutton.addEventListener('click', startQuiz);
    quitbutton.addEventListener('click', exitQuiz);
}

// Calling it after DOM creation
setupEventListeners();

function showinfo() {
    infobox.classList.add('active');
    startbutton.style.display = 'none';
}

function startQuiz() {
    infobox.classList.remove('active');
    quizbox.classList.add('active');
    fetchQuestions();
}

function exitQuiz() {
    window.location.reload();
}

function fetchQuestions() {
    fetch('200 questions.json')
        .then(myData => myData.json())
        .then(data => {
            questions = data;
            selectRandomQuestions();
            displayQuestion();
            startTimer();
        })
        .catch(error => console.error('Error loading questions:', error));
}

// Select 5 random questions
function selectRandomQuestions() {
    questions = shuffleArray(questions).slice(0, 5);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function displayQuestion() {
    const optionsList = document.querySelector('.option_list');
    optionsList.innerHTML = ''; // Clear the previous options
    
    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];
        que_text.textContent = questionData.question;

        // Display options
        questionData.options.forEach(option => {
            const optionButton = document.createElement('div');
            optionButton.classList.add('option');
            
            // If the question has already been answered, display the stored answer state
            if (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].answer === option) {
                optionButton.classList.add(userAnswers[currentQuestionIndex].isCorrect ? 'correct' : 'incorrect');
                optionButton.classList.add('disabled');
            }

            optionButton.textContent = option;
            optionButton.addEventListener('click', () => {
                if (!userAnswers[currentQuestionIndex]) { // Allow selection only if no answer was submitted
                    checkAnswer(option, questionData.answer);
                }
            });
            optionsList.appendChild(optionButton);
        });

        // Create navigation buttons container
        const navButtonsContainer = document.createElement('div');
        navButtonsContainer.classList.add('nav-buttons');

        // Add Previous Question button if it's not the first question
        if (currentQuestionIndex > 0) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous Question';
            prevButton.classList.add('prev-btn');
            prevButton.addEventListener('click', prevQuestion);
            navButtonsContainer.appendChild(prevButton);
        }

        // Add Next Question button if it's not the last question
        if (currentQuestionIndex < questions.length-1) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Question';
            nextButton.classList.add('next-btn');
            nextButton.addEventListener('click', nextQuestion);
            navButtonsContainer.appendChild(nextButton);
        }
        if (currentQuestionIndex === questions.length - 1) {
            // Add Show Result button for the last question
            const showResultButton = document.createElement('button');
            showResultButton.textContent = 'Show Result';
            showResultButton.classList.add('result-btn');
            showResultButton.addEventListener('click', () => showResult("You have completed the quiz!"));
            navButtonsContainer.appendChild(showResultButton);
        }
        
        // Append navigation buttons to the options list
        optionsList.appendChild(navButtonsContainer);

        // Update question counter
        document.getElementById('questionCounter').textContent = `${currentQuestionIndex + 1} of ${questions.length} Questions`;
    }
}

function checkAnswer(selectedOption, correctAnswer) {
    // Store the selected answer and whether it is correct
    userAnswers[currentQuestionIndex] = {
        answer: selectedOption,
        isCorrect: selectedOption === correctAnswer
    };

    // Disable all options after the user selects an answer
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.add('disabled');
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedOption) {
            option.classList.add('incorrect');
        }
    });

    if (selectedOption === correctAnswer) {
        score++;
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResult(); // Display completion message after the last question
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function startTimer() {
    let timeLeft = 2 * 60; // Total time for the quiz in seconds
    clearInterval(timer); // Clear any previous timer
    TIMER.textContent = `Time Left: ${formatTime(timeLeft)}`;

    timer = setInterval(() => {
        timeLeft--;
        TIMER.textContent = `Time Left: ${formatTime(timeLeft)}`;
        if (timeLeft <= 0) {
            clearInterval(timer); // Stop the timer
            handleTimeOut(); // End the quiz with "Time Out" message
        }
    }, 1000);
}

function handleTimeOut() {
    clearInterval(timer); // Stop the timer
    showResult("Time Out!"); // Show the result with "Time Out" message
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function showResult(message = "You have completed the quiz!") {
    clearInterval(timer); // Stop any running timer
    quizbox.classList.remove('active'); // Hide quiz box
    resultbox.classList.add('active'); // Show result box
    resultbox.innerHTML = `
        <div class="result-message">${message}</div>
        <div class="score-display">Your score: <span>${score}</span> out of ${questions.length}</div>
        <button onclick="restartQuiz()">Restart Quiz</button>
    `;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = []; // Reset answers
    resultbox.classList.remove('active');
    startQuiz();
}