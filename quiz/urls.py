from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('quiz/save_result/', views.save_quiz_result,
         name='save_quiz_result'),
    path('quiz/<slug:slug>/', views.playlist_quiz, name='playlist_quiz'),
    path('user-quiz/<int:playlist_id>/',
         views.user_playlist_quiz, name='user_playlist_quiz'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('profile/', views.profile, name='profile'),
]
