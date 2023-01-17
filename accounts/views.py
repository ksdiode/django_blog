from django.shortcuts import get_object_or_404
from django.views import generic
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import AccessMixin
from django.contrib.auth.hashers import check_password
# from django.views.defaults import permission_denied
from .forms import SignupForm, ProfileForm
from .models import User

class OwnerOnlyMixin(AccessMixin):
  raise_exception = True
  permission_denied_message = "작성자만이 수정/삭제할 수 있습니다."

  def get(self, request, *args, **kwargs):
    self.object = self.get_object()		# 모델 인스턴스 얻기
    if self.request.user != self.object.owner:
      self.handle_no_permission()		

    return super().get(request, *args, **kwargs)



class UserCreateView(generic.CreateView): 
  template_name = 'registration/register.html' 
  form_class = SignupForm 

  # 회원가입 성공시 이동할 url 지정
  success_url = reverse_lazy('register_done') 


class UserCreateDoneView(generic.TemplateView): 
  template_name = 'registration/register_done.html'


class UserProfileView(LoginRequiredMixin, generic.DetailView): 
  # model = User
  template_name = 'registration/profile.html' 
  context_object_name = 'profile'

  def get_object(self):
    return get_object_or_404(User, pk=self.request.user.id)




class UserProfileUpdateView(LoginRequiredMixin, generic.UpdateView): 
  model = User
  # fields = ['email', 'avatar']
  form_class = ProfileForm
  template_name = 'registration/profile_form.html' 
  success_url = reverse_lazy('profile') 
  
  def get_object(self):
    return get_object_or_404(User, pk=self.request.user.id)

  def form_valid(self, form):
    chk_password = form.cleaned_data['chk_password']
    if check_password(chk_password, self.request.user.password):
      return super().form_valid(form)
    
    # 비밀번호 틀린 경우
    form.add_error('chk_password', '비밀번호가 일치하지 않습니다.')
    return self.form_invalid(form)

  def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    user = self.get_object()
    context['user_id'] = user.user_id
    context['avatar'] = user.avatar
    return context

