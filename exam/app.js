const EXAM_DURATION = 30 * 60;

let examQuestions = [];
let remainingSeconds = EXAM_DURATION;
let timerInterval = null;
let submitted = false;

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function initializeExam() {
    // FIX: Removed localStorage (not reliably available in all environments).
    // Each session starts fresh with a new random selection.
    examQuestions = shuffle(questionBank).slice(0, 25);

    document.getElementById("totalCount").textContent = examQuestions.length;

    renderQuestions();
    startTimer();
    updateProgress();

    document
        .getElementById("submitButton")
        .addEventListener("click", submitExam);
}

function renderQuestions() {
    const container = document.getElementById("questionContainer");
    let html = "";

    examQuestions.forEach((question, index) => {
        const inputType = question.type === "multiple" ? "checkbox" : "radio";

        // FIX: Show a hint for multiple-answer questions so users know to pick more than one.
        const multiHint =
            question.type === "multiple"
                ? `<span class="multi-hint">Select all that apply</span>`
                : "";

        html += `
        <div class="question" id="question-${index}">
            <h3>${index + 1}. ${question.question}</h3>
            ${multiHint}
        `;

        question.options.forEach((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            html += `
            <label class="option">
                <input type="${inputType}" name="q${index}" value="${letter}">
                ${letter}. ${option}
            </label>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("change", updateProgress);
    });
}

function updateProgress() {
    let answered = 0;

    examQuestions.forEach((question, index) => {
        const checked = document.querySelectorAll(`input[name="q${index}"]:checked`);
        if (checked.length > 0) answered++;
    });

    document.getElementById("answeredCount").textContent = answered;

    const percentage = (answered / examQuestions.length) * 100;
    document.getElementById("progressBar").style.width = `${percentage}%`;
}

function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    document.getElementById("timer").textContent = display;

    // Turn timer red in the last 5 minutes
    const timerBox = document.querySelector(".timer-box");
    if (remainingSeconds <= 300) {
        timerBox.style.background = "#b91c1c";
    }
}

function getUserAnswers(index) {
    return Array.from(
        document.querySelectorAll(`input[name="q${index}"]:checked`)
    ).map(el => el.value);
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    const first = [...a].sort();
    const second = [...b].sort();
    return first.every((value, i) => value === second[i]);
}

// FIX: Helper to convert answer letters (["A","B"]) to the actual option text.
function letterToText(question, letter) {
    const index = letter.charCodeAt(0) - 65;
    return `${letter}. ${question.options[index] || "?"}`;
}

function submitExam() {
    if (submitted) return;
    submitted = true;

    clearInterval(timerInterval);

    // FIX: Disable the submit button visually after submission.
    const submitBtn = document.getElementById("submitButton");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitted";
    submitBtn.style.background = "#6b7280";
    submitBtn.style.cursor = "default";

    let score = 0;

    examQuestions.forEach((question, index) => {
        const userAnswer = getUserAnswers(index);
        const correctAnswer = question.answer;
        const box = document.getElementById(`question-${index}`);
        const correct = arraysEqual(userAnswer, correctAnswer);

        // Disable all inputs for this question
        box.querySelectorAll("input").forEach(inp => (inp.disabled = true));

        if (correct) {
            score++;
            box.classList.add("correct");
        } else {
            box.classList.add("incorrect");

            const review = document.createElement("div");
            review.className = "answer-box";

            // FIX: Show the full option text, not just the letter.
            const correctText = correctAnswer
                .map(l => letterToText(question, l))
                .join("<br>");

            const yourText =
                userAnswer.length > 0
                    ? userAnswer.map(l => letterToText(question, l)).join("<br>")
                    : "<em>No answer</em>";

            review.innerHTML = `
                <div><strong>✓ Correct answer:</strong><br>${correctText}</div>
                <div style="margin-top:8px"><strong>✗ Your answer:</strong><br>${yourText}</div>
            `;

            box.appendChild(review);
        }
    });

    const percentage = (score / examQuestions.length) * 100;

    document.getElementById("result").innerHTML = `
        <div class="score-card">
            Score: ${score} / ${examQuestions.length}
            <br><br>
            <span class="${percentage >= 60 ? "pass" : "fail"}">
                ${percentage.toFixed(1)}%
            </span>
            <br><br>
            <span style="font-size:16px;color:#666;font-weight:normal">
                ${percentage >= 60 ? "🎉 Passed!" : "📚 Not passed. Review the answers above."}
            </span>
        </div>
    `;

    // FIX: Auto-scroll to the result card after submission.
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

initializeExam();
