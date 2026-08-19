from django.http import JsonResponse

def error_400(request, exception=None):
    return JsonResponse({"detail": "Bad request."}, status=400)


def error_403(request, exception=None):
    return JsonResponse({"detail": "Forbidden."}, status=403)


def error_404(request, exception=None):
    return JsonResponse({"detail": "Not found."}, status=404)


def error_500(request):
    return JsonResponse({"detail": "Internal server error."}, status=500)
