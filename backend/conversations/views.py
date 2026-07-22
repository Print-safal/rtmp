from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Conversation
from .serializers import (
    ConversationSerializer,
    CreateConversationSerializer,
)
from rest_framework.views import APIView

from messaging.models import Message
from .models import ConversationParticipant

class ConversationListCreateView(generics.ListCreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(
                participants=self.request.user
            )
            .distinct()
            .order_by("-updated_at")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateConversationSerializer
        return ConversationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation = serializer.save()

        response_serializer = ConversationSerializer(conversation)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )
class ConversationDetailView(generics.RetrieveAPIView):

    serializer_class = ConversationSerializer

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(
                participants=self.request.user
            )
            .distinct()
        )
class MarkConversationReadView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):

        try:
            membership = ConversationParticipant.objects.get(
                conversation_id=pk,
                user=request.user,
            )

        except ConversationParticipant.DoesNotExist:

            return Response(
                {"detail": "Conversation not found."},
                status=404,
            )

        latest_message = Message.objects.filter(
            conversation_id=pk
        ).order_by("-created_at").first()

        membership.last_read_message = latest_message
        membership.save()

        return Response(
            {
                "detail": "Conversation marked as read."
            }
        )