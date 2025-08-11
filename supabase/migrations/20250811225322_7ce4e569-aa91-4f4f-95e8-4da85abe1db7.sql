-- Create missing triggers for profile security and lifecycle

-- 1) Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) Prevent privilege escalation on profile updates
DROP TRIGGER IF EXISTS profile_prevent_priv_escalation ON public.profile;
CREATE TRIGGER profile_prevent_priv_escalation
  BEFORE UPDATE ON public.profile
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 3) Keep updated_at fresh on profile updates
DROP TRIGGER IF EXISTS profile_set_updated_at ON public.profile;
CREATE TRIGGER profile_set_updated_at
  BEFORE UPDATE ON public.profile
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
