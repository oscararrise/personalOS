from rest_framework import viewsets,permissions
from rest_framework.exceptions import ValidationError
from .models import Task,Note,Habit,HabitEntry
from .serializers import TaskSerializer,NoteSerializer,HabitSerializer,HabitEntrySerializer
class OwnerViewSet(viewsets.ModelViewSet):
 permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self): return self.queryset.filter(owner=self.request.user)
 def perform_create(self,serializer): serializer.save(owner=self.request.user)
class TaskViewSet(OwnerViewSet):
 queryset=Task.objects.all();serializer_class=TaskSerializer
class NoteViewSet(OwnerViewSet):
 queryset=Note.objects.all();serializer_class=NoteSerializer
class HabitViewSet(OwnerViewSet):
 queryset=Habit.objects.all();serializer_class=HabitSerializer
class HabitEntryViewSet(viewsets.ModelViewSet):
 permission_classes=[permissions.IsAuthenticated]
 serializer_class=HabitEntrySerializer
 def get_queryset(self): return HabitEntry.objects.filter(habit__owner=self.request.user)
 def perform_create(self,serializer):
  habit=serializer.validated_data['habit']
  if habit.owner_id!=self.request.user.id: raise ValidationError('Hábito no autorizado')
  serializer.save()
