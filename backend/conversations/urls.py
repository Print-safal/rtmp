from django.urls import path

from .views import ConversationDetailView, ConversationListCreateView, MarkConversationReadView

urlpatterns = [
    path("", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path(
    "<int:pk>/",
    ConversationDetailView.as_view(),
    name="conversation-detail",),
    path(
    "<int:pk>/mark-read/",
    MarkConversationReadView.as_view(),
    name="conversation-mark-read",
),
]