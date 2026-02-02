document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("user-playlist-form");
  form.onsubmit = function (e) {
    e.preventDefault();
    const link = document.getElementById("user-playlist-link").value.trim();
    const match = link.match(/playlist\/(\d+)/);
    if (match) {
      const playlistId = match[1];
      window.location.href = `/user-quiz/${playlistId}/`;
    } else {
      alert("Nieprawidłowy link do playlisty.");
    }
  };
});
