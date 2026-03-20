from django.http import JsonResponse
from celery.result import AsyncResult
from .tasks import add


def index(request):
    """Submit a Celery task and return the task ID."""
    task = add.delay(4, 6)
    return JsonResponse(
        {
            "message": "Task submitted to Celery worker!",
            "task_id": task.id,
            "check_status": f"/status/{task.id}/",
        }
    )


def task_status(request, task_id):
    """Poll the status of a previously submitted task."""
    result = AsyncResult(task_id)
    return JsonResponse(
        {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None,
        }
    )
