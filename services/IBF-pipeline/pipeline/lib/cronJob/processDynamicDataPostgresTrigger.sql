
-- DEBUG feature: to run this script for a date in the past instead of current date
-- DO: replace all 'current_date' by 'to_date('2020-10-22','yyyy-mm-dd')'
-- EXCEPT for this comment itself of course!
-- AND change back after

--drop table if exists "IBF-pipeline-output".dashboard_triggers_per_day;
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


    
--drop table "IBF-pipeline-output".dashboard_forecast_per_station cascade;
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
FROM "IBF-pipeline-output".dashboard_glofas_stations t0
LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station_short t1
	ON t0.station_code = t1.station_code
	AND t0.country_code = t1.country_code
LEFT JOIN (select to_date(date,'yyyy-mm-dd') as current_prev, max(fc_long_trigger) as other_lead_time_trigger from "IBF-pipeline-output".triggers_rp_per_station_long group by 1) t2
	ON to_date(date,'yyyy-mm-dd') = t2.current_prev
LEFT JOIN (select "station_code_3day" as station from "IBF-pipeline-output".waterstation_per_district group by 1) t3
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
FROM "IBF-pipeline-output".dashboard_glofas_stations t0
LEFT JOIN "IBF-pipeline-output".triggers_rp_per_station_long t1
	ON t0.station_code = t1.station_code
	AND t0.country_code = t1.country_code
LEFT JOIN (select to_date(date,'yyyy-mm-dd') as current_prev, max(fc_short_trigger) as other_lead_time_trigger from "IBF-pipeline-output".triggers_rp_per_station_short group by 1) t2
	ON to_date(date,'yyyy-mm-dd') = t2.current_prev
LEFT JOIN (select "station_code_7day" as station from "IBF-pipeline-output".waterstation_per_district group by 1) t3
	ON t3.station = t0.station_code
where to_date(date,'yyyy-mm-dd') >= current_date - 1
;
--select * from "IBF-pipeline-output".dashboard_forecast_per_station

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_forecast_per_district;
select t0.country_code
	,case when length(cast(pcode as varchar)) = 3 then '0' || cast(pcode as varchar) else cast(pcode as varchar) end as pcode
	,case when lead_time = '3-day' then "station_code_3day" when lead_time = '7-day' then "station_code_7day" end as station_code
	,lead_time
	,date
	,current_prev
	,fc,fc_trigger,fc_rp,fc_perc,fc_prob,fc_trigger2
	,other_lead_time_trigger
INTO "IBF-pipeline-output".dashboard_forecast_per_district
FROM "IBF-pipeline-output".waterstation_per_district t0
LEFT JOIN "IBF-pipeline-output".dashboard_forecast_per_station  t1
ON (t1.lead_time = '7-day' and t0."station_code_7day" = t1.station_code) OR (t1.lead_time = '3-day' and t0."station_code_3day" = t1.station_code)
;
--select * from "IBF-pipeline-output".dashboard_forecast_per_district where country_code = 'UGA' and fc_trigger = 1


-- NOTE: Determine events and save in events-table
update "IBF-pipeline-output".events set end_date = subquery.date
from (
	select today.country_code, to_date(today.date,'yyyy-mm-dd') - 1 as date
	from "IBF-pipeline-output".triggers_per_day today
	left join "IBF-pipeline-output".triggers_per_day yesterday 
		on today.country_code = yesterday.country_code
		and to_date(today.date,'yyyy-mm-dd') = to_date(yesterday.date,'yyyy-mm-dd') + 1
	where 1=1
		and to_date(today.date,'yyyy-mm-dd') = current_date
		and ((today."7" = 0 and yesterday."7" = 1) or (yesterday."7" is null))
) subquery
where end_date is null and events.country_code = subquery.country_code
;
insert into "IBF-pipeline-output".events
select today.country_code
	,today.date
	,null	
from "IBF-pipeline-output".triggers_per_day today
left join "IBF-pipeline-output".triggers_per_day yesterday 
	on today.country_code = yesterday.country_code
	and to_date(today.date,'yyyy-mm-dd') = to_date(yesterday.date,'yyyy-mm-dd') + 1
where 1=1
	and to_date(today.date,'yyyy-mm-dd') = current_date
	and today."7" = 1 
	and (yesterday."7" = 0 or yesterday."7" is null)
;
--select * from "IBF-pipeline-output".events

-- NOTE: Save districts to event. Each day check if there are new districts. Never delete any districts that are not triggered any more.
-- First, update (potentially) updated population-affected figures for existing districts
update "IBF-pipeline-output".event_districts set population_affected = subquery.population_affected
from (
	select districtsToday.*
	from (
		select id as event
			,t1.pcode
			,name
			,population_affected
		from "IBF-pipeline-output".events t0
		left join "IBF-pipeline-output".dashboard_forecast_per_district t1
			on t0.start_date <= t1.date and coalesce(t0.end_date,'9999-99-99') >= t1.date
			and t0.country_code = t1.country_code
		left join "IBF-API"."Admin_area_data2" t2
			on t1.pcode = t2.pcode
			and to_date(t2.date,'yyyy-mm-dd') = current_date
		where t1.fc_trigger=1
		) districtsToday
	left join "IBF-pipeline-output".event_districts districtsExisting
		on districtsToday.event = districtsExisting.event
		and districtsToday.pcode = districtsExisting.pcode
	where districtsExisting.pcode is not null
) subquery
where event_districts.event = subquery.event and event_districts.pcode = subquery.pcode
;
-- Second: add new districts (either within existing event, or completely new event)
--drop table if exists "IBF-pipeline-output".event_districts;
--create table "IBF-pipeline-output".event_districts as
insert into "IBF-pipeline-output".event_districts
select districtsToday.*
from (
	select id as event
		,t1.pcode
		,name
		,population_affected
	from "IBF-pipeline-output".events t0
	left join "IBF-pipeline-output".dashboard_forecast_per_district t1
		on t0.start_date <= t1.date and coalesce(t0.end_date,'9999-99-99') >= t1.date
		and t0.country_code = t1.country_code
	left join "IBF-API"."Admin_area_data2" t2
		on t1.pcode = t2.pcode
		and to_date(t2.date,'yyyy-mm-dd') = current_date
	where t1.fc_trigger=1
		and t2.lead_time = '7-day'
	) districtsToday
left join "IBF-pipeline-output".event_districts districtsExisting
	on districtsToday.event = districtsExisting.event
	and districtsToday.pcode = districtsExisting.pcode
where districtsExisting.pcode is null
;
--select * from "IBF-pipeline-output".event_districts where event = 14

