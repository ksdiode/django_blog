from django.urls import path
from . import views

app_name = '${app}'

urlpatterns = [
  path('', views.${Model}LV.as_view(), name='index'),
  path('detail/<int:pk>/', views.${Model}DV.as_view(), name='detail'),
  path('create/', views.${Model}CV.as_view(), name='create'),
  path('update/<int:pk>/', views.${Model}UV.as_view(), name='update'),
  path('delete/<int:pk>/', views.${Model}DelV.as_view(), name='delete'),
]
