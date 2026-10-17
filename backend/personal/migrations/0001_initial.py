from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name="Habit", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("title", models.CharField(max_length=240)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="Note", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("title", models.CharField(max_length=240)),
            ("content", models.TextField(blank=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="Task", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("title", models.CharField(max_length=240)),
            ("category", models.CharField(choices=[("urgente", "urgente"), ("importante", "importante"), ("hogar", "hogar"), ("algun_dia", "algun_dia")], default="importante", max_length=20)),
            ("done", models.BooleanField(default=False)),
            ("due_date", models.DateField(blank=True, null=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="HabitEntry", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("date", models.DateField()),
            ("completed", models.BooleanField(default=True)),
            ("habit", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="entries", to="personal.habit")),
        ]),
        migrations.AddConstraint(model_name="habitentry", constraint=models.UniqueConstraint(fields=("habit", "date"), name="unique_habit_date")),
    ]
