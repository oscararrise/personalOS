from django.conf import settings
from django.db import models
class Owned(models.Model):
 owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
 created_at=models.DateTimeField(auto_now_add=True)
 class Meta: abstract=True
class Task(Owned):
 title=models.CharField(max_length=240)
 category=models.CharField(max_length=20,choices=[(x,x) for x in ['urgente','importante','hogar','algun_dia']],default='importante')
 done=models.BooleanField(default=False)
 due_date=models.DateField(null=True,blank=True)
class Note(Owned):
 title=models.CharField(max_length=240)
 content=models.TextField(blank=True)
class Habit(Owned):
 title=models.CharField(max_length=240)
class HabitEntry(models.Model):
 habit=models.ForeignKey(Habit,on_delete=models.CASCADE,related_name='entries')
 date=models.DateField()
 completed=models.BooleanField(default=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['habit','date'],name='unique_habit_date')]
