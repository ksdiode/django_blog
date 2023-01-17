from django import template

register = template.Library()

@register.inclusion_tag('avatar.html')
def avatar(user):
  avatar_img = user.avatar if user.avatar else 'avatar/unknown.png'
  return {
    'avatar': avatar_img
  }

