-- Create inquiries table to store contact messages
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for inquiries
CREATE POLICY "Users can view their received inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Authenticated users can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update inquiry status"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS inquiries_item_id_idx ON public.inquiries(item_id);
CREATE INDEX IF NOT EXISTS inquiries_recipient_id_idx ON public.inquiries(recipient_id);
CREATE INDEX IF NOT EXISTS inquiries_sender_id_idx ON public.inquiries(sender_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries(status);
