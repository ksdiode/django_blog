from django.db import models

from django.db import models
from django.utils import timezone

class BaseDateModel(models.Model):
  created = models.DateTimeField('생성일', null=True, blank=True)
  updated = models.DateTimeField('수정일', null=True, blank=True)
  
  class Meta:
    abstract = True

  def save(self, *args, **kwargs):
    if not self.id : # 생성
      self.created = timezone.now()
    
    self.updated = timezone.now()
    return super().save(*args, **kwargs)
