from django import forms
from django_summernote.widgets import SummernoteWidget
from .models import Post

class PostForm(forms.ModelForm):
  class Meta:
    model = Post
    fields = ['title', 'category', 'content']
    widgets = {
      'content': SummernoteWidget(attrs={
         'summernote': {'width': '100%', 'height': '400px'}
      }),
    }
