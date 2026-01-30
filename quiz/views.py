import random
from concurrent.futures import ThreadPoolExecutor

import requests
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .models import Leaderboard

PLAYLISTS = {
    'top-worldwide': 3155776842,
    'rock-essentials': 1306931615,
    'rap-bangers': 1996494362,
    'hip-hop-hits': 1677006641,
    'greatest-hits-ever': 1257015791,
    '90s-party-hits': 2322259622,
}


def get_deezer_playlist_json(playlist_id):
    url = f"https://api.deezer.com/playlist/{playlist_id}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json()
    return None


def home(request):
    playlists = []
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [
            executor.submit(get_deezer_playlist_json, playlist_id)
            for slug, playlist_id in PLAYLISTS.items()
        ]
        for (slug, playlist_id), future in zip(PLAYLISTS.items(), futures):
            data = future.result()
            if data:
                playlists.append({
                    "slug": slug,
                    "id": data.get("id"),
                    "title": data.get("title", "Brak tytułu"),
                    "picture": data.get("picture_medium", ""),
                })
    return render(request, "common/home.html", {"playlists": playlists})


@login_required
def profile(request):
    try:
        stats = Leaderboard.objects.get(user=request.user)
    except Leaderboard.DoesNotExist:
        stats = None

    return render(request, "profile/profile.html", {
        "user_obj": request.user,
        "stats": stats
    })


def playlist_quiz(request, slug):
    playlist_id = PLAYLISTS.get(slug)
    if not playlist_id:
        raise Http404("Nie znaleziono takiej playlisty.")

    data = get_deezer_playlist_json(playlist_id)
    if data is None:
        raise Http404("Nie udało się pobrać playlisty.")

    # tylko utwory z preview
    all_tracks = [t for t in data.get('tracks', {}).get(
        'data', []) if t.get('preview')]
    if len(all_tracks) < 10:
        raise Http404("Utwory nie zawierają wymaganych danych.")

    selected_tracks = random.sample(all_tracks, 10)
    quiz = []
    titles = [t['title'] for t in all_tracks]

    for correct_track in selected_tracks:
        # losowe błędne odpowiedzi
        wrong_titles = random.sample(
            [t for t in titles if t != correct_track['title']], 3)
        options = wrong_titles + [correct_track['title']]
        random.shuffle(options)
        quiz.append({
            'preview': correct_track.get('preview', ''),  # link mp3 30sek
            'correct': correct_track['title'],
            'options': options,
            'artist': correct_track['artist']['name'],
        })

    return render(request, "quiz/quiz.html", {
        "quiz": quiz,
        "playlist_title": data.get("title", ""),
        "playlist_picture": data.get("picture_xl", ""),
        "user_is_authenticated": request.user.is_authenticated,
    })


def user_playlist_quiz(request, playlist_id):
    url = f"https://api.deezer.com/playlist/{playlist_id}"
    resp = requests.get(url)
    if resp.status_code != 200:
        raise Http404("Nie udało się pobrać playlisty.")
    data = resp.json()

    # tylko utwory z preview
    all_tracks = [t for t in data.get('tracks', {}).get(
        'data', []) if t.get('preview')]
    # musi być co najminej 10 utworów z preview, gdyż tyle jest wymaganych na rudne
    if len(all_tracks) < 10:
        raise Http404("Utwory nie zawierają wymaganych danych.")

    selected_tracks = random.sample(all_tracks, 10)

    quiz = []
    titles = [t['title'] for t in all_tracks]

    for correct_track in selected_tracks:
        # losowe błędne odpowiedzi
        wrong_titles = random.sample(
            [t for t in titles if t != correct_track['title']], 3)
        options = wrong_titles + [correct_track['title']]
        random.shuffle(options)

        quiz.append({
            'preview': correct_track.get('preview', ''),  # link mp3 30sek
            'correct': correct_track['title'],
            'options': options,
            'artist': correct_track['artist']['name'],
        })

    return render(request, "quiz/quiz.html", {
        "quiz": quiz,
        "playlist_title": data.get("title", "Twoja playlista"),
        "playlist_picture": data.get("picture_xl", ""),
    })


def leaderboard(request):
    users = Leaderboard.objects.select_related('user').all()

    paginator = Paginator(users, 15)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    start_pos = (page_obj.number - 1) * paginator.per_page
    leaderboard_with_position = []
    for idx, entry in enumerate(page_obj, start=start_pos + 1):
        leaderboard_with_position.append({
            'position': idx,
            'username': entry.user.username,
            'points': entry.points,
            'games_played': entry.games_played,
        })

    return render(request, "quiz/leaderboard.html", {
        "page_obj": page_obj,
        "leaderboard_with_position": leaderboard_with_position
    })


@require_POST
@login_required
def save_quiz_result(request):
    import json
    data = json.loads(request.body.decode('utf-8'))
    points = data.get('points')

    if points is None:
        return JsonResponse({'success': False, 'error': 'No points provided.'}, status=400)

    leaderboard, created = Leaderboard.objects.get_or_create(
        user=request.user,
        defaults={'points': points, 'games_played': 1}
    )
    if not created:
        leaderboard.points += points
        leaderboard.games_played += 1
        leaderboard.save()

    return JsonResponse({'success': True, 'total_points': leaderboard.points, 'games_played': leaderboard.games_played})
