import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

@require_GET
@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({"ok": True})

@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON inválido"}, status=400)
    user = authenticate(request, username=data.get("username", ""), password=data.get("password", ""))
    if user is None or not user.is_active:
        return JsonResponse({"error": "Credenciales incorrectas"}, status=401)
    login(request, user)
    return JsonResponse({"username": user.get_username()})

@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})

@require_GET
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)
    return JsonResponse({"authenticated": True, "username": request.user.get_username()})
