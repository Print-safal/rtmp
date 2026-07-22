from rest_framework import serializers

from .models import Conversation, ConversationParticipant
from accounts.serializers import UserSerializer


class ParticipantSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = ConversationParticipant
        fields = (
            "id",
            "role",
            "joined_at",
            "user",
        )

class ConversationSerializer(serializers.ModelSerializer):

    participant_count = serializers.SerializerMethodField()

    participants = ParticipantSerializer(
        source="conversation_participants",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Conversation
        fields = (
            "id",
            "conversation_type",
            "name",
            "description",
            "participant_count",
            "participants",
            "created_at",
            "updated_at",
        )

    def get_participant_count(self, obj):
        return obj.participants.count()


class CreateConversationSerializer(serializers.ModelSerializer):

    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
    )

    class Meta:
        model = Conversation
        fields = (
            "conversation_type",
            "name",
            "description",
            "participant_ids",
        )
    def create(self, validated_data):

        participant_ids = validated_data.pop("participant_ids")

        request = self.context["request"]

        conversation = Conversation.objects.create(
            created_by=request.user,
            **validated_data,
        )

        ConversationParticipant.objects.create(
            conversation=conversation,
            user=request.user,
            role=ConversationParticipant.Role.OWNER,
        )

        from accounts.models import User

        participants = User.objects.filter(
            id__in=participant_ids
        )

        for user in participants:

            if user == request.user:
                continue

            ConversationParticipant.objects.create(
                conversation=conversation,
                user=user,
            )

        return conversation
