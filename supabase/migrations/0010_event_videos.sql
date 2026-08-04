-- =============================================================================
-- ALA — Event videos (YouTube) for past-event galleries
-- Migration 0010
-- =============================================================================
alter table events add column if not exists video_urls text; -- newline-separated YouTube URLs
