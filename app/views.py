from django.urls import reverse, reverse_lazy
from django.views import generic
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import FileResponse
from accounts.views import OwnerOnlyMixin
from .models import ${Model}
from .forms import ${Model}Form

class ${Model}LV(generic.ListView):
  model = ${Model}
  template_name = '${model}_list.html'
  context_object_name = '${model}s'
  paginate_by = 10
    
  

class ${Model}DV(generic.DetailView):
  model = ${Model}
  template_name = '${model}_detail.html'
  context_object_name = '${model}'


class ${Model}CV(LoginRequiredMixin, generic.CreateView):
  model = ${Model}
  template_name = "${model}_form.html"
  # fields = ['title', 'category', 'content']
  form_class = ${Model}Form
  success_url = reverse_lazy('${app}:index')


class ${Model}UV(OwnerOnlyMixin, generic.UpdateView):
  model = ${Model}
  template_name = "${model}_form.html"
  # fields = ['title', 'category', 'content']
  form_class = ${Model}Form

  def get_success_url(self):
    ${model} = self.get_object()
    return reverse('${app}:detail', args=[str(${model}.id)])



class ${Model}DelV(OwnerOnlyMixin, generic.DeleteView):
  model = ${Model}
  success_url = reverse_lazy('${app}:index')

  def get(self, *args, **kwargs):
    return self.delete(*args, **kwargs)


