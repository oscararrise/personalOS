from rest_framework.routers import DefaultRouter
from .views import TaskViewSet,NoteViewSet,HabitViewSet,HabitEntryViewSet
router=DefaultRouter()
for name,view in [('tasks',TaskViewSet),('notes',NoteViewSet),('habits',HabitViewSet),('habit-entries',HabitEntryViewSet)]:router.register(name,view,basename=name)
urlpatterns=router.urls
