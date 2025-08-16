-- Create table for image suggestions
CREATE TABLE public.event_image_suggestion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  suggested_image_url TEXT NOT NULL,
  suggested_by UUID,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_image_suggestion ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can suggest images" 
ON public.event_image_suggestion 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view suggestions" 
ON public.event_image_suggestion 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can update suggestions" 
ON public.event_image_suggestion 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin can delete suggestions" 
ON public.event_image_suggestion 
FOR DELETE 
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_event_image_suggestion_updated_at
BEFORE UPDATE ON public.event_image_suggestion
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();