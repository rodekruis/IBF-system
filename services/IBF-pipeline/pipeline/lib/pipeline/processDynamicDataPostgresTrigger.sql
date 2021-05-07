-- DEBUG feature: to run this script for a date in the past instead of current date
-- DO: replace all 'current_date' by 'to_date('2020-10-22','yyyy-mm-dd')'
-- EXCEPT for this comment itself of course!
-- AND change back after

-- TEMP
drop table if exists "IBF-pipeline-output".triggers_rp_per_station;
SELECT t0.id
	, t0."stationCode"
	, "stationName"
	, "triggerLevel"
	, "threshold2Year"
	, "threshold5Year"
	, "threshold10Year"
	, "threshold20Year"
	, geom
	, t0."stationCode" as code
	, t1."forecastLevel" as fc
	, t1."forecastProbability" as fc_prob
	, t1."forecastTrigger" as fc_trigger
	, t1."forecastReturnPeriod" as fc_rp
	, t1."date" 
	, t1."countryCode" as country_code
	, t1."leadTime" as lead_time
into "IBF-pipeline-output".triggers_rp_per_station
FROM "IBF-app"."glofasStation" t0
LEFT JOIN "IBF-app"."glofasStationTrigger" t1 ON t0."stationCode" = t1."stationCode"
;

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
    fc_prob int8 NULL,
    geom geometry NULL
);
--drop table "IBF-pipeline-output".dashboard_forecast_per_station cascade;
truncate table "IBF-pipeline-output".dashboard_forecast_per_station;
insert into "IBF-pipeline-output".dashboard_forecast_per_station
SELECT t0."countryCode" as country_code,
    t0."stationCode" as station_code,
    t0."stationName" as station_name,
    t0."triggerLevel" as trigger_level,
    date,
    t1.lead_time as lead_time,
    fc,
    fc_trigger,
    fc_rp,
    fc_prob as fc_prob,
    st_astext(t0.geom)
FROM "IBF-app"."glofasStation" t0
    LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station t1 ON t0."stationCode" = t1."stationCode"
    AND t0."countryCode" = t1.country_code
where date >= current_date;
--select * from "IBF-pipeline-output".dashboard_forecast_per_station order by 1

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_forecast_per_district;
select t0."countryCode" as country_code,
    t0."placeCode" as pcode,
    t0."glofasStation" as station_code,
    lead_time,
    date,
    fc,
    fc_trigger,
    fc_rp,
    fc_prob INTO "IBF-pipeline-output".dashboard_forecast_per_district
FROM "IBF-app"."adminArea" t0
    LEFT JOIN "IBF-pipeline-output".dashboard_forecast_per_station t1 ON t0."glofasStation" = t1.station_code
    and t0."countryCode" = t1.country_code
where t1.lead_time is not null;
--select * from "IBF-pipeline-output".dashboard_forecast_per_district;
