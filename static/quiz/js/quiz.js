const quiz = window.quizData;
let current = 0;
let answered = false;
let timerBarInterval = null;
let questionDuration = 30;
let answers = [];
let timeStarted = null;

function resetTimerBar() {
  const bar = document.getElementById("timer-bar");
  bar.style.width = "100%";
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// function updateTimer(secondsLeft) {
//   document.getElementById('timer').innerText = `Pozostało: ${Math.ceil(secondsLeft)}s`;
// }

function animateTimerBar(audio) {
  resetTimerBar();
  clearInterval(timerBarInterval);
  const bar = document.getElementById("timer-bar");

  if (audio && audio.duration) {
    timerBarInterval = setInterval(() => {
      if (!answered) {
        const elapsed = audio.currentTime;
        const duration = audio.duration;
        const percent = Math.max(0, 1 - elapsed / duration);
        bar.style.width = percent * 100 + "%";
        // updateTimer(duration - elapsed);
        if (percent <= 0) {
          clearInterval(timerBarInterval);
          if (!answered) {
            answered = true;
            const points = 0;
            disableOptions(null, quiz[current].correct);
            answers.push({
              userAnswer: null,
              correctAnswer: quiz[current].correct,
              correct: false,
              points: points,
            });
            nextQuestion(false, points);
          }
        }
      }
    }, 30);

    audio.onended = () => {
      if (!answered) {
        answered = true;
        clearInterval(timerBarInterval);
        const points = 0;
        disableOptions(null, quiz[current].correct);
        answers.push({
          userAnswer: null,
          correctAnswer: quiz[current].correct,
          correct: false,
          points: points,
        });
        nextQuestion(false, points);
      }
    };
  }
}

function disableOptions(selectedBtn, correctAnswer) {
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove(
      "btn-outline-dark",
      "btn-success",
      "btn-danger",
      "btn-secondary"
    );
    const btnAnswer = decodeURIComponent(btn.dataset.answer);

    if (btn === selectedBtn && btnAnswer === correctAnswer) {
      btn.classList.add("btn-success");
    } else if (btn === selectedBtn) {
      btn.classList.add("btn-danger");
    } else if (btnAnswer === correctAnswer) {
      btn.classList.add("btn-success");
    } else {
      btn.classList.add("btn-secondary");
    }
  });
  clearInterval(timerBarInterval);
}

function showQuestion() {
  answered = false;
  if (current >= quiz.length) {
    clearInterval(timerBarInterval);
    document.getElementById("timer-bar-container").style.display = "none";

    // suma punktów
    let totalPoints = answers.reduce((sum, ans) => sum + (ans.points || 0), 0);

    let summaryHTML = `
            <div class="fs-2 mb-4">Wynik: <b>${totalPoints}/${
      quiz.length * 100
    }</b></div>
            <table id="summary-table" class="table table-striped table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>Lp.</th>
                        <th>Twoja odpowiedź</th>
                        <th>Poprawna odpowiedź</th>
                        <th>Punkty</th>
                    </tr>
                </thead>
                <tbody>
        `;
    answers.forEach((ans, idx) => {
      const resultClass = ans.correct ? "text-success" : "text-danger";
      summaryHTML += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${ans.userAnswer !== null ? ans.userAnswer : ""}</td>
                    <td>${ans.correctAnswer}</td>
                    <td>${ans.points}</td>
                </tr>
            `;
    });
    summaryHTML += "</tbody></table>";

    document.getElementById("quiz-area").innerHTML = summaryHTML;
    resetTimerBar();

    // punkty zapisujemy tylko zalogowanemu użytkownikowi
    if (window.userIsAuthenticated) {
      fetch("/quiz/save_result/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ points: totalPoints }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.success) {
            showToast("Wynik został zapisany do bazy danych.", "success");
          }
        });
    }

    return;
  }

  let q = quiz[current];
  document.getElementById("question").innerText = `Piosenka ${current + 1}/10`;
  let opts = q.options
    .map(
      (t) =>
        `<button class="btn btn-outline-dark border-1 option-btn" data-answer="${encodeURIComponent(
          t
        )}" style="min-width:400px; max-width:400px">${t}</button>`
    )
    .join("");
  document.getElementById("options").innerHTML = opts;
  document.getElementById("result").innerText = "";

  let audio = document.getElementById("audio");
  if (q.preview) {
    audio.src = q.preview;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Błąd podczas odtwarzania audio:", err);
      }
    });
    audio.onloadedmetadata = () => animateTimerBar(audio);
  }

  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      if (audio && audio.pause) audio.pause();

      let userAnswer = decodeURIComponent(btn.dataset.answer);
      let ok = userAnswer === q.correct;
      let time_left = 0;
      let points = 0;
      if (q.preview) {
        let elapsed = audio.currentTime;
        time_left = Math.max(0, (audio.duration || questionDuration) - elapsed);
      }
      if (ok) {
        points = Math.round(100 * (time_left / questionDuration));
      } else {
        points = 0;
      }

      disableOptions(btn, q.correct);
      answers.push({
        userAnswer: userAnswer,
        correctAnswer: q.correct,
        correct: ok,
        points: points,
      });
      nextQuestion(ok, points);
    };
  });
}

function nextQuestion(correct, points) {
  if (correct) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, ticks: 70 });
    document.getElementById(
      "result"
    ).innerHTML = `<span class='text-success'>Dobrze! +${points} pkt</span>`;
  } else {
    document.getElementById(
      "result"
    ).innerHTML = `<span class='text-danger'>Źle! +0 pkt</span>`;
  }
  setTimeout(() => {
    current++;
    showQuestion();
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn").onclick = () => {
    document.getElementById("timer-bar-container").style.display = "block";
    document.getElementById("quiz-area").innerHTML = `
            <div id="timer" class="fs-3 mb-3"></div>
            <audio id="audio"></audio>
            <div class="my-3 d-flex align-items-center" style="max-width: 300px; margin: 0 auto;">
                <span id="volume-icon" style="font-size: 2rem; margin-right: 1rem; cursor: pointer;">
                    <i class="bi bi-volume-up"></i>
                </span>
                <input type="range" class="form-range flex-grow-1" id="volume-slider" min="0" max="100" value="100">
            </div>
            <div id="question" class="fs-4 mb-3"></div>
            <div id="options" class="d-flex flex-column gap-2 justify-content-center align-items-center"></div>
            <div id="result" class="fs-2 mt-4"></div>
        `;

    const audio = document.getElementById("audio");
    const slider = document.getElementById("volume-slider");
    const icon = document.getElementById("volume-icon");
    let lastVolume = 1;

    function updateVolumeIcon(volume) {
      if (volume == 0) {
        icon.innerHTML = '<i class="bi bi-volume-mute"></i>';
      } else if (volume < 0.5) {
        icon.innerHTML = '<i class="bi bi-volume-down"></i>';
      } else {
        icon.innerHTML = '<i class="bi bi-volume-up"></i>';
      }
    }

    if (audio && slider && icon) {
      // poziom glośności z localStorage
      let savedVolume = localStorage.getItem("quiz_volume");
      if (savedVolume !== null) {
        audio.volume = parseFloat(savedVolume);
        slider.value = audio.volume * 100;
        if (audio.volume > 0) lastVolume = audio.volume;
      } else {
        audio.volume = slider.value / 100;
      }
      updateVolumeIcon(audio.volume);

      slider.addEventListener("input", function () {
        audio.volume = this.value / 100;
        if (audio.volume > 0) lastVolume = audio.volume;
        localStorage.setItem("quiz_volume", audio.volume);
        updateVolumeIcon(audio.volume);
      });

      icon.addEventListener("click", function () {
        if (audio.volume === 0) {
          audio.volume = lastVolume;
          slider.value = lastVolume * 100;
        } else {
          lastVolume = audio.volume;
          audio.volume = 0;
          slider.value = 0;
        }
        localStorage.setItem("quiz_volume", audio.volume);
        updateVolumeIcon(audio.volume);
      });
    }

    showQuestion();
  };
});
