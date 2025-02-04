-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Add indexes for common queries
  CONSTRAINT activity_logs_user_id_idx UNIQUE (id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS activity_logs_user_id_created_at_idx ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
  DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
  DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;
  DROP POLICY IF EXISTS "System can delete activity logs" ON activity_logs;

  -- Create new policies
  CREATE POLICY "Users can view their own activity logs"
    ON activity_logs
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = user_id
    );

  CREATE POLICY "Admins can view all activity logs"
    ON activity_logs
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    );

  CREATE POLICY "System can insert activity logs"
    ON activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "System can delete activity logs"
    ON activity_logs
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    );
END $$;

-- Create function to get activity logs with timeframe filter
CREATE OR REPLACE FUNCTION get_activity_logs(
  p_timeframe TEXT DEFAULT '24h',
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  action TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on timeframe
  CASE p_timeframe
    WHEN '24h' THEN
      v_start_date := NOW() - INTERVAL '24 hours';
    WHEN '7d' THEN
      v_start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN
      v_start_date := NOW() - INTERVAL '30 days';
    ELSE
      v_start_date := NULL;
  END CASE;

  RETURN QUERY
  SELECT al.*
  FROM activity_logs al
  WHERE
    (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (v_start_date IS NULL OR al.created_at >= v_start_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to delete old activity logs
CREATE OR REPLACE FUNCTION delete_old_activity_logs(
  p_days INTEGER DEFAULT 90,
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM activity_logs
    WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
    AND (p_user_id IS NULL OR user_id = p_user_id)
    RETURNING *
  )
  SELECT COUNT(*) INTO v_deleted FROM deleted;

  RETURN v_deleted;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON activity_logs TO anon;
GRANT EXECUTE ON FUNCTION get_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION delete_old_activity_logs TO authenticated;
