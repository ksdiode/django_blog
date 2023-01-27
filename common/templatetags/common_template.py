from django import template
from django.utils.safestring import mark_safe
register = template.Library()

# @register.inclusion_tag('search_form.html')
# def search_form(user):
#   avatar_img = user.avatar if user.avatar else 'avatar/unknown.png'
#   return {
#     'avatar': avatar_img
#   }

@register.simple_tag()
def submit_button(**kwargs):
  icon = kwargs.get('icon', 'fas fa-check')
  title = kwargs.get('title', '확인')
  color = kwargs.get('color', 'btn-primary')
  return mark_safe(f"""
  <button type="submit" class="btn {color}">
    <i class="{icon}"></i> {title}
  </button>
  """)

@register.simple_tag()
def cancel_button(**kwargs):
  icon = kwargs.get('icon', 'fas fa-undo')
  title = kwargs.get('title', '취소')
  color = kwargs.get('color', 'btn-primary')
  return mark_safe(f"""
    <a href="javascript:history.back()" class="btn {color}">
      <i class="{icon}"></i>
      {title}
    </a>
  """)