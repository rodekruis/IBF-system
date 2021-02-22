
-- DEBUG feature: to run this script for a date in the past instead of current date
-- DO: replace all 'current_date' by 'to_date('2020-10-22','yyyy-mm-dd')'
-- EXCEPT for this comment itself of course!
-- AND change back after

CREATE TABLE if not exists "IBF-pipeline-output".dashboard_triggers_per_day (
	country_code text NULL,
	current_prev text NULL,
	"1" int8 NULL,
	"2" int8 NULL,
	"3" int8 NULL,
	"4" int8 NULL,
	"5" int8 NULL,
	"6" int8 NULL,
	"7" int8 NULL
);
truncate table "IBF-pipeline-output".dashboard_triggers_per_day;
insert into "IBF-pipeline-output".dashboard_triggers_per_day
select tpd.country_code 
	,'Current' as current_prev
--	,case when date_part('day',age(current_date,to_date(date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	,"1","2","3","4","5","6","7"--,"8","9","10"
--into "IBF-pipeline-output".dashboard_triggers_per_day
from "IBF-pipeline-output".triggers_per_day tpd
left join (select country_code, max(date) as max_date from "IBF-pipeline-output".triggers_per_day group by 1) max
	on tpd.country_code = max.country_code
	and tpd.date = max.max_date
--where to_date(date,'yyyy-mm-dd') >= current_date - 1
where tpd.date = max.max_date
;
--select * from "IBF-pipeline-output".dashboard_triggers_per_day
--select * from "IBF-pipeline-output".triggers_per_day where country_code = 'ZMB' order by date


    
CREATE TABLE if not exists "IBF-pipeline-output".dashboard_forecast_per_station (
	country_code varchar NULL,
	station_code text NULL,
	station_name text NULL,
	trigger_level float8 NULL,
	"date" text NULL,
	current_prev text NULL,
	lead_time text NULL,
	fc int8 NULL,
	fc_trigger int8 NULL,
	fc_rp float8 NULL,
	fc_perc float8 NULL,
	fc_prob int8 NULL,
	fc_trigger2 int4 NULL,
	geom geometry NULL,
	other_lead_time_trigger int8 NULL,
	station_used int4 NULL
);
truncate table "IBF-pipeline-output".dashboard_forecast_per_station;
insert into "IBF-pipeline-output".dashboard_forecast_per_station
SELECT t0.country_code
	,t0.station_code
	,t0.station_name
	,t0.trigger_level
	,date
	,case when date_part('day',age(current_date,to_date(date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	,'3-day' as lead_time
	,fc_short as fc,fc_short_trigger as fc_trigger,fc_short_rp as fc_rp
	,case when trigger_level = 0 then null else fc_short/trigger_level end as fc_perc
	,fc_short_prob as fc_prob
	,case when fc_short_prob >= 0.8 then 80 when fc_short_prob >=0.7 then 70 when fc_short_prob >=0.6 then 60 else 0 end as fc_trigger2
	,t0.geom
	,other_lead_time_trigger
	,case when t3.station is null then 0 else 1 end as station_used
--into "IBF-pipeline-output".dashboard_forecast_per_station
FROM "IBF-static-input".dashboard_glofas_stations t0
LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station_short t1
	ON t0.station_code = t1.station_code
	AND t0.country_code = t1.country_code
LEFT JOIN (select to_date(date,'yyyy-mm-dd') as current_prev, max(fc_long_trigger) as other_lead_time_trigger from "IBF-pipeline-output".triggers_rp_per_station_long group by 1) t2
	ON to_date(date,'yyyy-mm-dd') = t2.current_prev
LEFT JOIN (select "station_code_3day" as station from "IBF-static-input".waterstation_per_district group by 1) t3
	ON t3.station = t0.station_code
where to_date(date,'yyyy-mm-dd') >= current_date - 1

UNION ALL

SELECT t0.country_code
	,t0.station_code
	,t0.station_name
	,t0.trigger_level
	,date
	,case when date_part('day',age(current_date,to_date(date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	,'7-day' as lead_time
	,fc_long,fc_long_trigger,fc_long_rp
	,case when trigger_level = 0 then null else fc_long/trigger_level end as fc_perc
	,fc_long_prob as fc_prob
	,case when fc_long_prob >= 0.8 then 80 when fc_long_prob >=0.7 then 70 when fc_long_prob >=0.6 then 60 else 0 end as fc_trigger2
	,t0.geom
	,other_lead_time_trigger
	,case when t3.station is null then 0 else 1 end as station_used
FROM "IBF-static-input".dashboard_glofas_stations t0
LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station_long t1
	ON t0.station_code = t1.station_code
	AND t0.country_code = t1.country_code
LEFT JOIN (select to_date(date,'yyyy-mm-dd') as current_prev, max(fc_short_trigger) as other_lead_time_trigger from "IBF-pipeline-output".triggers_rp_per_station_short group by 1) t2
	ON to_date(date,'yyyy-mm-dd') = t2.current_prev
LEFT JOIN (select "station_code_7day" as station from "IBF-static-input".waterstation_per_district group by 1) t3
	ON t3.station = t0.station_code
where to_date(date,'yyyy-mm-dd') >= current_date - 1
;
--select * from "IBF-pipeline-output".dashboard_forecast_per_station order by 1
--select * from "IBF-pipeline-output".triggers_rp_per_station_long where country_code = 'KEN'
--select * FROM "IBF-static-input".dashboard_glofas_stations where country_code = 'KEN'

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_forecast_per_district;
select t0.country_code
	,pcode
	,case when lead_time = '3-day' then "station_code_3day" when lead_time = '7-day' then "station_code_7day" end as station_code
	,lead_time
	,date
	,current_prev
	,fc,fc_trigger,fc_rp,fc_perc,fc_prob,fc_trigger2
	,other_lead_time_trigger
INTO "IBF-pipeline-output".dashboard_forecast_per_district
FROM "IBF-static-input".waterstation_per_district t0
LEFT JOIN "IBF-pipeline-output".dashboard_forecast_per_station  t1
ON (t1.lead_time = '7-day' and t0."station_code_7day" = t1.station_code) OR (t1.lead_time = '3-day' and t0."station_code_3day" = t1.station_code)
where t1.lead_time is not null
;
--select * from "IBF-pipeline-output".dashboard_forecast_per_district where country_code = 'KEN' and fc_trigger = 1
