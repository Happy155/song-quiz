from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegisterUserForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        label="Email"
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super(RegisterUserForm, self).__init__(*args, **kwargs)

        self.label_suffix = ""  # usuwa dwukropki na końcu

        self.fields["username"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Nazwa"}
        )
        self.fields["username"].help_text = ""
        self.fields["username"].label = "Nazwa użytkownika"

        self.fields["email"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Email"}
        )
        self.fields["email"].help_text = ""
        self.fields["email"].label = "Email"

        self.fields["password1"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Hasło"}
        )
        self.fields["password1"].help_text = ""
        self.fields["password1"].label = "Hasło"

        self.fields["password2"].widget.attrs.update(
            {"class": "form-control", "placeholder": "Hasło"}
        )
        self.fields["password2"].help_text = ""
        self.fields["password2"].label = "Powtórz hasło"
