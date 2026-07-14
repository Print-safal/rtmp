from django.contrib import admin

# Register your models here.


from .models import Conversation, ConversationParticipant


admin.site.register(Conversation)
admin.site.register(ConversationParticipant)