from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer, SendMessageSerializer
from core.pagination import MessagePagination

class MessageListCreateView(generics.ListCreateAPIView):
    pagination_class = MessagePagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        conversation_id = self.request.query_params.get("conversation")

        queryset = Message.objects.filter(
            conversation__participants=self.request.user
        )

        if conversation_id:
            queryset = queryset.filter(
                conversation_id=conversation_id
            )

        return queryset.select_related(
            "sender",
            "conversation",
        ).order_by("created_at")

    def get_serializer_class(self):

        if self.request.method == "POST":
            return SendMessageSerializer

        return MessageSerializer

    def get_serializer_context(self):

        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.save()

        response_serializer = MessageSerializer(message)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )