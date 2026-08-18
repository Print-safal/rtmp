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
    unread = serializers.SerializerMethodField()
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
            "unread",
        )

    def get_participant_count(self, obj):
        return obj.participants.count()
    def get_unread(self, obj):

        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        try:
            membership = obj.conversation_participants.get(
                user=request.user
            )
        except ConversationParticipant.DoesNotExist:
            return False

        if membership.last_read_message is None:
            return obj.messages.exists()

        return obj.messages.filter(
            created_at__gt=membership.last_read_message.created_at
        ).exists()


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
        current_user = request.user

        # For private conversations, reuse an existing conversation
        if validated_data.get("conversation_type") == "PRIVATE":

            other_user_ids = set(participant_ids)
            other_user_ids.discard(current_user.id)

            if len(other_user_ids) == 1:

                other_user_id = next(iter(other_user_ids))

                existing_conversation = (
                    Conversation.objects
                    .filter(
                        conversation_type="PRIVATE",
                        participants=current_user,
                    )
                    .filter(
                        participants__id=other_user_id,
                    )
                    .distinct()
                    .first()
                )

                if existing_conversation:
                    return existing_conversation

        # Create a new conversation
        conversation = Conversation.objects.create(
            created_by=current_user,
            **validated_data,
        )

        # Add creator
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=current_user,
            role=ConversationParticipant.Role.OWNER,
        )

        # Add other participants
        from accounts.models import User

        participants = User.objects.filter(
            id__in=participant_ids
        )

        for user in participants:

            if user == current_user:
                continue

            ConversationParticipant.objects.create(
                conversation=conversation,
                user=user,
            )

        return conversation