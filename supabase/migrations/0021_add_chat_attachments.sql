ALTER TABLE chat_messages
ADD COLUMN attachment_url text,
ADD COLUMN attachment_type text,
ADD COLUMN attachment_name text;

-- Add index for faster lookups if needed (though not critical for basic functionality)
-- CREATE INDEX idx_chat_messages_attachment ON chat_messages(attachment_url) WHERE attachment_url IS NOT NULL;