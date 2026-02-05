<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Happy155/music-quiz">
    <img src="https://purepng.com/public/uploads/large/purepng.com-music-iconsymbolsiconsapple-iosiosios-8-iconsios-8-721522596085b6osz.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Quiz Muzyczny</h3>

  <p align="center">
    Czy rozpoznasz ten hit?
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## O projekcie
<strong>Quiz muzyczny</strong> to aplikacja do zgadywania piosenek na podstawie fragmentów utworów pobieranych z serwisu Deezer.
Użytkownicy mogą rywalizować w quizach muzycznych, wybierać playlisty, zdobywać punkty i porównywać wyniki w rankingu.

### Główne technologie
Backend aplikacji został zbudowany z wykorzystaniem frameworka Django, który obsługuje logikę aplikacji i zarządzanie danymi. Do przechowywania danych używana jest relacyjna baza danych SQLite, która jest lekka i łatwa w konfiguracji, a jednocześnie w pełni wystarczająca dla tego typu projektu. Za frontend odpowiada między innymi Bootstrap – popularny framework CSS umożliwiający tworzenie responsywnych i estetycznych interfejsów użytkownika.

[![Django][django]][django-url]
[![Bootstrap][bootstrap]][bootstrap-url]
[![SQLite][sqlite]][sqlite-url]

<!-- GETTING STARTED -->
## Pierwsze kroki

### Warunki wstępne
Do uruchomienia projektu wymagane jest posiadanie zainstalowanego Dockera oraz Docker Compose. Obie rzeczy najłatwiej zainstalować dzięki [Docker Desktop](https://docs.docker.com/get-started/get-docker/).

### Uruchomienie projektu

1. Sklonuj repozytorium
   ```sh
   git clone https://github.com/Happy155/song-quiz.git
   ```
1. Przejdź do folderu repozytorium
   ```sh
   cd song-quiz/
   ```
2. Uruchom projekt za pomocą Docker Compose
   ```sh
   docker compose up -d
   ```
Po wykonaniu powyższych kroków strona powinna już działać i być dostępna pod adresem http://localhost:8000.

### Po uruchomieniu (zalecane)

1. Wejdź w tryb exec kontenera ze stroną
   ```sh
   docker exec -it song-quiz-web-1 /bin/bash
   ```
2. Stwórz konto administratora
   ```sh
   python manage.py createsuperuser
   ```
Wykonanie powyższych kroków sprawi, że utworzone zostanie konto administratora, które umożliwi zarządzanie stroną poprzez panel administracyjny.

[django]: https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green
[django-url]: https://www.djangoproject.com/
[bootstrap]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[bootstrap-url]: https://getbootstrap.com/
[sqlite]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=SQLite&logoColor=white
[sqlite-url]: https://sqlite.org/
