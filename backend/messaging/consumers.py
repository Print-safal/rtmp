import json
from messaging.serializers import MessageSerializer
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.db import database_sync_to_async
from conversations.models import Conversation

class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def is_conversation_member(self, user_id, conversation_id):

        return Conversation.objects.filter(
            id=conversation_id,
            participants__id=user_id,
        ).exists()
    
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close(code=4001)
            return
        print(self.scope["user"])
        is_member = await self.is_conversation_member(
        self.scope["user"].id,
        self.conversation_id,
)

        if not is_member:
            print("Unauthorized conversation access.")
            await self.close(code=4003)
            return
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]

        self.room_group_name = f"chat_{self.conversation_id}"

        print(f"Joining group: {self.room_group_name}")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        await self.send(
            text_data=json.dumps({
                "message": f"Connected to conversation {self.conversation_id}"
            })
        )

    async def disconnect(self, close_code):

        print(f"Leaving group: {self.room_group_name}")

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

        print(f"Disconnected ({close_code})")

    async def receive(self, text_data):

        data = json.loads(text_data)

        message = data["message"]

        print(f"Received: {message}")

        message = await self.save_message(
            user_id=self.scope["user"].id,
            conversation_id=self.conversation_id,
            content=message,
        )
        serialized = await self.serialize_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": serialized,
            }
        )
    
    async def chat_message(self, event):

        message = event["message"]

        await self.send(text_data=json.dumps(event["message"])
)

    @database_sync_to_async
    def save_message(self, user_id, conversation_id, content):

        from accounts.models import User
        from conversations.models import Conversation
        from messaging.models import Message

        user = User.objects.get(id=user_id)

        conversation = Conversation.objects.get(id=conversation_id)

        message = Message.objects.create(
            sender=user,
            conversation=conversation,
            content=content,
        )

        return message
    @database_sync_to_async
    def serialize_message(self, message):

        return MessageSerializer(message).data