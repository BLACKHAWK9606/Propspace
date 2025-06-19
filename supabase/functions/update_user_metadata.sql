-- This function updates a user's metadata to set the user_type
-- It requires the service role to run

CREATE OR REPLACE FUNCTION update_user_metadata(user_id UUID, user_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's metadata
  UPDATE auth.users 
  SET raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object('user_type', user_type)
  WHERE id = user_id;
END;
$$; 