from django.http import JsonResponse

def custom_404(request, exception=None):
    return JsonResponse({
        "error": "Not Found",
        "detail": "The requested API endpoint does not exist."
    }, status=404)

def custom_500(request):
    return JsonResponse({
        "error": "Internal Server Error",
        "detail": "An unexpected error occurred on the server."
    }, status=500)
