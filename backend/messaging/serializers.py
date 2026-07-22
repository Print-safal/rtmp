from rest_framework import serializers

from .models import Message


from accounts.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):

    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "sender",
            "content",
            "message_type",
            "created_at",
            "updated_at",
            "is_edited",
        )


class SendMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = (
            "conversation",
            "content",
        )

    def create(self, validated_data):

        request = self.context["request"]

        conversation = validated_data["conversation"]

        if not conversation.participants.filter(
            id=request.user.id
        ).exists():
            raise serializers.ValidationError(
                "You are not a participant of this conversation."
            )

        return Message.objects.create(
            sender=request.user,
            **validated_data,
        )
    def validate_content(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        return value
