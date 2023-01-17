from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class SignupForm(UserCreationForm):
  email = forms.EmailField(label="이메일")

  class Meta:
    model = User
    fields = ["user_id", "email", "avatar"]


class ProfileForm(forms.ModelForm):
    chk_password = forms.CharField(label='비밀번호', widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ('chk_password', 'email', 'avatar')

    def clean_password(self):
        return self.initial["password"]