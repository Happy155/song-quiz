from django.urls import path
from django.contrib.auth.views import PasswordChangeView
from .views import PasswordChangeView

from . import views

urlpatterns = [
    path("login", views.login_user, name="login"),
    path("logout", views.logout_user, name="logout"),
    path("register", views.register_user, name="register"),
    path('password/', PasswordChangeView.as_view(
        template_name='registration/password_change.html'), name='password_change'),
]
