from rest_framework import serializers
from .models import Task,Note,Habit,HabitEntry
class TaskSerializer(serializers.ModelSerializer):
 class Meta: model=Task;fields=['id','title','category','done','due_date','created_at'];read_only_fields=['id','created_at']
class NoteSerializer(serializers.ModelSerializer):
 class Meta: model=Note;fields=['id','title','content','created_at'];read_only_fields=['id','created_at']
class HabitSerializer(serializers.ModelSerializer):
 class Meta: model=Habit;fields=['id','title','created_at'];read_only_fields=['id','created_at']
class HabitEntrySerializer(serializers.ModelSerializer):
 class Meta: model=HabitEntry;fields=['id','habit','date','completed']
