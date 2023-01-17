from rest_framework import routers
from django.urls import path, include

from api.views import *

router = routers.DefaultRouter()
router.register(r'user', UserViewSet)

urlpatterns = [
  path('', include(router.urls)),
]
