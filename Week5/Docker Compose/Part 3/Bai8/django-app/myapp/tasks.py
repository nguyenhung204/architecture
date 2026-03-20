from celery import shared_task
import time


@shared_task
def add(x, y):
    """Simulate a long-running task (3 seconds)."""
    time.sleep(3)
    return x + y


@shared_task
def multiply(x, y):
    return x * y
