-- File: 2025-06-24_add_downsample_temperature_readings_function.sql

-- Function: downsample_temperature_readings
-- Description:
--   Buckets temperature readings for a given transformer over a time range.
--   Returns average temp and a representative timestamp per bucket.
--
-- Parameters:
--   transformer_id (text)  : ID of the transformer (e.g., 'XFMR-0405')
--   start_time     (timestamptz) : Start of time range (inclusive)
--   end_time       (timestamptz) : End of time range (inclusive)
--   buckets        (int)   : Number of buckets to group readings into
--
-- Returns:
--   timestamp (timestamptz) : Representative timestamp (min in bucket)
--   tempC     (float8)      : Average temperature for the bucket

create or replace function downsample_temperature_readings(
  transformer_id text,
  start_time timestamptz,
  end_time timestamptz,
  buckets integer
)
returns table (
  timestamp timestamptz,
  tempC float8
)
language sql
as $$
  with bucketed as (
    select
      width_bucket(extract(epoch from timestamp), extract(epoch from start_time), extract(epoch from end_time), buckets) as bucket,
      avg(tempC) as tempC,
      min(timestamp) as timestamp
    from temperature_readings
    where transformer_id = downsample_temperature_readings.transformer_id
      and timestamp >= start_time
      and timestamp <= end_time
    group by bucket
    order by bucket
  )
  select timestamp, tempC from bucketed;
$$;
