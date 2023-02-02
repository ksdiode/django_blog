from django.urls import path, include
from rest_framework import routers
from . import views

commentRouter = routers.DefaultRouter()
commentRouter.register('', views.CommentViewSet)
replyRouter = routers.DefaultRouter()
replyRouter.register('', views.ReplyViewSet)

app_name = 'blog'
urlpatterns = [
  path('', views.PostLV.as_view(), name='index'),
  path('detail/<int:pk>/', views.PostDV.as_view(), name='detail'),
  path('create/', views.PostCV.as_view(), name='create'),
  path('update/<int:pk>/', views.PostUV.as_view(), name='update'),
  path('delete/<int:pk>/', views.PostDelV.as_view(), name='delete'),
  path('tag/<str:tag>/', views.PostLV.as_view(), name='post_tag'), 
  path('download/<int:pk>', views.download, name='download'),
  path('like/<int:id>/', views.post_like, name='like'),
  path('comment/<int:post_id>/', include(commentRouter.urls)),
  path('reply/<int:post_id>/<int:comment_id>/', include(replyRouter.urls))
]
