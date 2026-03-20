from django.urls import path
from myapp.views import index, task_status

urlpatterns = [
    path("", index, name="index"),
    path("status/<str:task_id>/", task_status, name="task_status"),
]
