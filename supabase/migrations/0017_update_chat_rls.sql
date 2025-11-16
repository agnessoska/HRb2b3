-- Allow participants to mark messages as read
CREATE POLICY "chat_participants_can_mark_as_read"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (
  chat_room_id IN (
    SELECT id FROM public.chat_rooms 
    WHERE hr_specialist_id = auth.uid() OR candidate_id = auth.uid()
  )
  AND sender_id != auth.uid()
  AND is_read = false
)
WITH CHECK (
  is_read = true
  AND read_at IS NOT NULL
);
