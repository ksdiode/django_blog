from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrAdmin(BasePermission):
  def has_object_permission(self, request, view, obj):
    if request.user.is_staff:
      return True
    return obj.owner == request.user

class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
