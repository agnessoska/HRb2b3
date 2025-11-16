-- For fast searching of chat messages
CREATE INDEX idx_chat_messages_room_created 
ON public.chat_messages(chat_room_id, created_at DESC);

-- For finding unread messages
CREATE INDEX idx_chat_messages_unread 
ON public.chat_messages(chat_room_id, is_read) 
WHERE is_read = false;

-- For sorting the chat list
CREATE INDEX idx_chat_rooms_last_message 
ON public.chat_rooms(last_message_at DESC);

-- For filtering chats by HR/Candidate
CREATE INDEX idx_chat_rooms_hr 
ON public.chat_rooms(hr_specialist_id, last_message_at DESC);

CREATE INDEX idx_chat_rooms_candidate 
ON public.chat_rooms(candidate_id, last_message_at DESC);
