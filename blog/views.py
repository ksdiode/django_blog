from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.urls import reverse, reverse_lazy
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import FileResponse
from accounts.views import OwnerOnlyMixin
from taggit.models import Tag
from .models import Post, Category, PostAttachFile, Comment
from .forms import PostForm

class PostLV(generic.ListView):
  model = Post
  template_name = 'post_list.html'
  context_object_name = 'posts'
  paginate_by = 10

  def get_queryset(self):
    tag_slug = self.kwargs.get('tag')
    if tag_slug:
      return Post.objects.filter(tags__name=tag_slug)
    else:
      category = self.request.GET.get('category')
      if category:
        question_list = Post.objects.filter(category__name=category)
      else:
        question_list = Post.objects.all()

      keyword = self.request.GET.get('keyword', '')  # 검색어

      if keyword:
          question_list = question_list.filter(
              Q(title__icontains=keyword) |   # 제목검색
              Q(content__icontains=keyword)   # 내용검색              
          ).distinct()
      return question_list


          
  def get_context_data(self):
    context = super().get_context_data()
    context['page'] = self.request.GET.get('page', 1)
    context['categories'] = Category.objects.all()
    context['category'] = self.request.GET.get('category', '')
    context['keyword'] = self.request.GET.get('keyword', '')
    context['extra'] = f"category={context['category']}&keyword={context['keyword']}"
    return context
  

class PostDV(generic.DetailView):
  model = Post
  template_name = 'post_detail.html'
  context_object_name = 'post'

  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    post = context['post']

    if self.request.user == post.owner :
      context['is_owner'] = True
    else:
      post.view_count += 1
      post.save()
      context['is_owner'] = False
    context['like'] = True if post.like.filter(user_id = self.request.user) else False
    context['comments'] = post.comments.filter(parent__isnull=True )

    print(self.request.user.id, context['like'], context['is_owner'])

    return context


class PostCV(LoginRequiredMixin, generic.CreateView):
  model = Post
  template_name = "post_form.html"
  # fields = ['title', 'category', 'content']
  form_class = PostForm
  success_url = reverse_lazy('blog:index')

  def form_valid(self, form):
    form.instance.owner = self.request.user
    result = super().form_valid(form)
    files = self.request.FILES.getlist('files')
    for file in files:
      attachment = PostAttachFile(
        post = form.instance,
        file = file,
        filename = file.name,
        content_type = file.content_type,
        size = file.size
      )
      attachment.save()
    return result


class PostUV(OwnerOnlyMixin, generic.UpdateView):
  model = Post
  template_name = "post_form.html"
  # fields = ['title', 'category', 'content']
  form_class = PostForm


  def form_valid(self, form):
    result = super().form_valid(form)
    files = self.request.FILES.getlist('files')
    for file in files:
      attachment = PostAttachFile(
        post = form.instance,
        file = file,
        filename = file.name,
        content_type = file.content_type,
        size = file.size
      )
      attachment.save()
    return result


  def get_success_url(self):
    post = self.get_object()
    return reverse('blog:detail', args=[str(post.id)])



class PostDelV(OwnerOnlyMixin, generic.DeleteView):
  model = Post
  success_url = reverse_lazy('blog:index')

  def get(self, *args, **kwargs):
    return self.delete(*args, **kwargs)


def download(request, pk):
  attachment = PostAttachFile.objects.get(pk=pk)
  return FileResponse(attachment.file.open(), as_attachment=True, filename=attachment.filename)


from django.http import JsonResponse

def post_like(request, id):
  post = Post.objects.get(pk=id)

  if post.like.filter(user_id = request.user):
    post.like.remove(request.user)
  else:
    post.like.add(request.user)

  return JsonResponse({'result': 'ok', 'count': post.like.count()})


# Comment, Reply 처리
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import Comment
from .serializers import CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
  queryset = Comment.objects.all()
  serializer_class = CommentSerializer
  # permission_classes = (IsAuthenticated,)
  # http_method_names = ['post', ]

  @csrf_exempt
  def create(self, request, *args, **kwargs):
    self.request.data['post'] = kwargs['post_id']
    self.request.data['owner'] = request.user.id
    serializer = self.get_serializer(data=self.request.data)
    
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED) 
    else:
      print(serializer.errors)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

  def update(self, request, *args, **kwargs):
    kwargs['partial'] = True
    return super().update(request, *args, **kwargs)

class ReplyViewSet(viewsets.ModelViewSet):
  queryset = Comment.objects.all()
  serializer_class = CommentSerializer

  @csrf_exempt
  def create(self, request, *args, **kwargs):
    self.request.data['post'] = kwargs['post_id']
    self.request.data['parent'] = kwargs['comment_id']
    self.request.data['owner'] = request.user.id    
    serializer = self.get_serializer(data=self.request.data)
    
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED) 
    else:
      print(serializer.errors)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
