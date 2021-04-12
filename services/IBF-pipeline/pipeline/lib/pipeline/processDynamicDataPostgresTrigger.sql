-- DEBUG feature: to run this script for a date in the past instead of current date
-- DO: replace all 'current_date' by 'to_date('2020-10-22','yyyy-mm-dd')'
-- EXCEPT for this comment itself of course!
-- AND change back after
--drop table "IBF-pipeline-output".dashboard_triggers_per_day cascade;
CREATE TABLE if not exists "IBF-pipeline-output".dashboard_triggers_per_day (
    country_code text NULL,
    "date" text null,
    "1" int8 NULL,
    "2" int8 NULL,
    "3" int8 NULL,
    "4" int8 NULL,
    "5" int8 NULL,
    "6" int8 NULL,
    "7" int8 NULL,
    "1-m" int8 NULL,
    "2-m" int8 NULL,
    "3-m" int8 NULL
);
truncate table "IBF-pipeline-output".dashboard_triggers_per_day;
delete from "IBF-pipeline-output".triggers_per_day
where country_code = 'EGY'
    and to_date(cast(date as TEXT), 'yyyy-mm-dd') = current_date;
insert into "IBF-pipeline-output".triggers_per_day
select 0,
    0 --day1
,
    0 --day2
,
    (
        select max(
                case
                    when sum <> '--'
                    and sum <> '0' then 1
                    else 0
                end
            ) as trigger
        from "IBF-pipeline-output".calculated_affected
        where country_code = 'EGY'
            and source = 'population'
            and lead_time = '3-day'
        group by date
        order by date desc
        limit 1
    ) day3, 0 --day4
, (
        select max(
                case
                    when sum <> '--'
                    and sum <> '0' then 1
                    else 0
                end
            ) as trigger
        from "IBF-pipeline-output".calculated_affected
        where country_code = 'EGY'
            and source = 'population'
            and lead_time = '5-day'
        group by date
        order by date desc
        limit 1
    ) day5, 0 --day6
, (
        select max(
                case
                    when sum <> '--'
                    and sum <> '0' then 1
                    else 0
                end
            ) as trigger
        from "IBF-pipeline-output".calculated_affected
        where country_code = 'EGY'
            and source = 'population'
            and lead_time = '7-day'
        group by date
        order by date desc
        limit 1
    ) day7, (
        select date
        from "IBF-pipeline-output".calculated_affected
        where country_code = 'EGY'
        group by date
        order by date desc
        limit 1
    ) date, 'EGY';
truncate table "IBF-pipeline-output".dashboard_triggers_per_day;
insert into "IBF-pipeline-output".dashboard_triggers_per_day
select tpd.country_code,
    tpd.date,
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7"
from "IBF-pipeline-output".triggers_per_day tpd
    left join (
        select country_code,
            max(date) as max_date
        from "IBF-pipeline-output".triggers_per_day
        group by 1
    ) max on tpd.country_code = max.country_code
    and tpd.date = max.max_date
where tpd.date = max.max_date;
--select * from "IBF-pipeline-output".dashboard_triggers_per_day
CREATE TABLE if not exists "IBF-pipeline-output".dashboard_forecast_per_station (
    country_code varchar NULL,
    station_code text NULL,
    station_name text NULL,
    trigger_level float8 NULL,
    "date" date NULL,
    lead_time text NULL,
    fc float8 NULL,
    fc_trigger int8 NULL,
    fc_rp float8 NULL,
    fc_perc float8 NULL,
    fc_prob int8 NULL,
    geom geometry NULL
);
--drop table "IBF-pipeline-output".dashboard_forecast_per_station cascade;
truncate table "IBF-pipeline-output".dashboard_forecast_per_station;
insert into "IBF-pipeline-output".dashboard_forecast_per_station
SELECT t0.country_code,
    t0.station_code,
    t0.station_name,
    t0.trigger_level,
    date,
    t1.lead_time as lead_time,
    fc,
    fc_trigger,
    fc_rp,
    case
        when t0.trigger_level = 0 then null
        else fc / t0.trigger_level
    end as fc_perc,
    fc_prob as fc_prob,
    t0.geom --into "IBF-pipeline-output".dashboard_forecast_per_station
FROM "IBF-static-input".dashboard_glofas_stations t0
    LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station t1 ON t0.station_code = t1.station_code
    AND t0.country_code = t1.country_code
where date >= current_date;
--select * from "IBF-pipeline-output".dashboard_forecast_per_station order by 1
DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_forecast_per_district;
select t0.country_code,
    pcode,
    t0.station_code,
    lead_time,
    date,
    fc,
    fc_trigger,
    fc_rp,
    fc_perc,
    fc_prob INTO "IBF-pipeline-output".dashboard_forecast_per_district
FROM "IBF-static-input".waterstation_per_district t0
    LEFT JOIN "IBF-pipeline-output".dashboard_forecast_per_station t1 ON t0.station_code = t1.station_code
    and t0.country_code = t1.country_code
where t1.lead_time is not null;
--select * from "IBF-pipeline-output".dashboard_forecast_per_district;
