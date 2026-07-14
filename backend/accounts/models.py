from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    display_name = models.CharField(max_length=100, blank=True)

    bio = models.TextField(blank=True)

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    last_seen = models.DateTimeField(
        blank=True,
        null=True,
    )

    #created_at = models.DateTimeField(auto_now_add=True)
    #might cause conflict so removed for futher testing
    def __str__(self):
        return self.username
