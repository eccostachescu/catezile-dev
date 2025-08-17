-- Insert some sample metric data to test the admin metrics page
INSERT INTO metric_daily (day, source, metric, value, labels) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'plausible', 'pageviews', 1250, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'plausible', 'visitors', 890, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'plausible', 'pageviews', 1380, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'plausible', 'visitors', 920, '{}'),
  (CURRENT_DATE - INTERVAL '3 days', 'plausible', 'pageviews', 1100, '{}'),
  (CURRENT_DATE - INTERVAL '3 days', 'plausible', 'visitors', 750, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'ads', 'ad_views', 45, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'ads', 'revenue_est', 12.50, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'ads', 'ad_views', 52, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'ads', 'revenue_est', 15.20, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'internal', 'reminders_sent', 23, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'internal', 'reminders_sent', 31, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'affiliate', 'affiliate_clicks', 8, '{}'),
  (CURRENT_DATE - INTERVAL '1 day', 'affiliate', 'revenue_est', 5.80, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'affiliate', 'affiliate_clicks', 12, '{}'),
  (CURRENT_DATE - INTERVAL '2 days', 'affiliate', 'revenue_est', 8.40, '{}')
ON CONFLICT DO NOTHING;