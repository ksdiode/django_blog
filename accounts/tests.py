from django.test import TestCase

# Create your tests here.



from blog.models import Post, Category
from accounts.models import User

category = Category.objects.all()
category = list(category)
print(category)

users = list(User.objects.all())
print(users)


for i in range(0, 200):
  c = category[i % 3]
  u = users[i % 3]
  post = Post(
    category = c,
    title=f'{i}번째 글 제목입니다.', 
    owner=u,
    content =f'{i}번째 글의 내용니다.', 
    view_count = 0
  )
  post.save()
  print(post)


  