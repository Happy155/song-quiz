from django.db import models
from django.contrib.auth.models import User


class Leaderboard(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name="Użytkownik")
    points = models.PositiveIntegerField(verbose_name="Punkty")
    games_played = models.PositiveIntegerField(verbose_name="Liczba gier")

    class Meta:
        verbose_name = "Leaderboard"
        verbose_name_plural = "Leaderboards"
        ordering = ['-points', 'games_played']

    def __str__(self):
        return f"{self.user.username} - {self.points} pkt"
