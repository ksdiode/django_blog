from django.urls import reverse, reverse_lazy
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from accounts.views import OwnerOnlyMixin
from .models import Post, Category
from .forms import PostForm

class PostLV(generic.ListView):
  model = Post
  template_name = 'post_list.html'
  context_object_name = 'posts'
  paginate_by = 10

  def get_queryset(self):
    category = self.request.GET.get('category')
    if category:
      return Post.objects.filter(category__name=category)
    else:
      return Post.objects.all()

    
  def get_context_data(self):
    context = super().get_context_data()
    context['categories'] = Category.objects.all()
    context['category'] = self.request.GET.get('category')
    return context
  

class PostDV(generic.DetailView):
  model = Post
  template_name = 'post_detail.html'
  context_object_name = 'post'


class PostCV(LoginRequiredMixin, generic.CreateView):
  model = Post
  template_name = "post_form.html"
  # fields = ['title', 'category', 'content']
  form_class = PostForm
  success_url = reverse_lazy('blog:index')

  def form_valid(self, form):
    form.instance.owner = self.request.user
    return super().form_valid(form)


class PostUV(OwnerOnlyMixin, generic.UpdateView):
  model = Post
  template_name = "post_form.html"
  # fields = ['title', 'category', 'content']
  form_class = PostForm

  def get_success_url(self):
    post = self.get_object()
    return reverse('blog:detail', args=[str(post.id)])


class PostDelV(OwnerOnlyMixin, generic.DeleteView):
  model = Post
  success_url = reverse_lazy('blog:index')

  def get(self, *args, **kwargs):
    return self.delete(*args, **kwargs)

