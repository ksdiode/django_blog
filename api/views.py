from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination 

from accounts.serializers import UserSerializer
from accounts.models import User
from .permissions import IsOwnerOrAdmin, ReadOnly

# AllowAny
# IsAuthenticated
# IsAuthenticatedOrReadOnly
# IsAdminUser
# DjangoModelPermissions
# DjangoModelPermissionsOrAnonReadOnly
# DjangoObjectPermissions


class UserPagination(PageNumberPagination):
  page_size = 3


class UserViewSet(viewsets.ModelViewSet):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  pagination_class = UserPagination    
  permission_classes = [AllowAny]   # IsAuthenticatedOrReadOnly


  
