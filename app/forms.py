from django import forms
from django_summernote.widgets import SummernoteWidget
from .models import Post

class PostForm(forms.ModelForm):
  files = forms.FileField(label='첨부파일', required=False, widget=forms.ClearableFileInput(attrs={'multiple': True}))
  class Meta:
    model = Post
    fields = ['title', 'category', 'files','content']
    widgets = {
      'content': SummernoteWidget(attrs={
         'summernote': {'width': '100%', 'height': '400px'}
      }),
    }
