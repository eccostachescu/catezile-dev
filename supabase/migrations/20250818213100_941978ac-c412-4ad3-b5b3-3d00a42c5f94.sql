-- Update the constraint to include APPROVED and REJECTED statuses
ALTER TABLE public.event
DROP CONSTRAINT IF EXISTS event_editorial_status_check;

ALTER TABLE public.event
ADD CONSTRAINT event_editorial_status_check 
CHECK (editorial_status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'APPROVED', 'REJECTED'));