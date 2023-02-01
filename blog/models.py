from django.db import models
from taggit.managers import TaggableManager
from accounts.models import User
from django.utils import timezone
from django.urls import reverse
from common.models import BaseDateModel



class Category(models.Model):
  name = models.CharField('이름', max_length=128)
  
  class Meta:
    ordering = ["name"]
  
  def __str__(self):
    return f'{self.name}'


class Post(models.Model):
  category = models.ForeignKey(Category, verbose_name='카테고리', on_delete=models.CASCADE)
  title = models.CharField('제목', max_length=300)
  owner = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE)
  content = models.TextField('내용')
  view_count = models.IntegerField('조회수', blank=True, default=0)
  like = models.ManyToManyField(User, related_name='post_likes')
  tags = TaggableManager('태그들', help_text='태그들을 콤마로 구분하세요') 

  created = models.DateTimeField('생성일', auto_now_add = True)
  updated = models.DateTimeField('수정일', auto_now = True)
  # image = models.ImageField(upload_to="images/%Y/%m/%d", storage=MediaStorage(), blank=True)

  class Meta:
    ordering = ["-id"]

  def detail_url(self):
      return reverse("blog:detail", kwargs={'pk':self.id})
  
  def update_url(self):
      return reverse("blog:update", kwargs={'pk':self.id})
  
  def __str__(self):
    return f'{self.id} {self.title}'



class PostAttachFile(models.Model):
  post = models.ForeignKey(Post, related_name='files', on_delete=models.CASCADE)
  file = models.FileField(upload_to="upload/%Y/%m/%d", blank=True, null=True)
  filename = models.CharField('파일명', max_length=255)
  content_type = models.CharField('타입', max_length=255)
  size = models.IntegerField() 
  
  class Meta:
    ordering = ["-id"]

  def __str__(self):
    return f''




class Comment(BaseDateModel):
  post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
  owner = models.ForeignKey(User, on_delete=models.CASCADE)
  content = models.TextField('내용')
  parent = models.ForeignKey('self' , null=True , blank=True , on_delete=models.CASCADE , related_name='replies')

  class Meta:
    ordering = ["-id"]

  @property
  def children(self):
      return Comment.objects.filter(parent=self).reverse()

  @property
  def is_parent(self):
      if self.parent is None:
          return True
      return False

  def __str__(self):
    return f'{self.content}'

