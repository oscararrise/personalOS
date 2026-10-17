from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Task, Habit

class ApiIsolationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.a = User.objects.create_user(username="alice", password="long-test-password-456")
        self.b = User.objects.create_user(username="bob", password="long-test-password-789")
        self.client_a = APIClient()
        self.client_a.force_authenticate(user=self.a)
        self.client_b = APIClient()
        self.client_b.force_authenticate(user=self.b)

    def test_unauthenticated_denied(self):
        response = APIClient().get("/api/tasks/")
        self.assertIn(response.status_code, [401, 403])

    def test_tasks_isolated_by_owner(self):
        Task.objects.create(owner=self.a, title="Private task")
        self.assertEqual(len(self.client_a.get("/api/tasks/").data), 1)
        self.assertEqual(len(self.client_b.get("/api/tasks/").data), 0)

    def test_create_task_assigns_owner(self):
        response = self.client_a.post("/api/tasks/", {"title": "Nueva tarea", "category": "hogar"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.get(pk=response.data["id"]).owner, self.a)

    def test_cannot_register_entry_for_other_users_habit(self):
        habit = Habit.objects.create(owner=self.b, title="Privado")
        response = self.client_a.post("/api/habit-entries/", {"habit": habit.id, "date": "2026-10-17"})
        self.assertEqual(response.status_code, 400)
