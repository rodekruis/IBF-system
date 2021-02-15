
-- NOTE: This code was put in a different file than 'processDynamicDataPostgresTrigger.sql', because it relies on the 'event' table being ready.

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
		left join (
			select *
			from "IBF-API"."Admin_area_data2"
			union all
			select *
			from "IBF-API"."Admin_area_data1"
		) t2
			on t1.pcode = t2.pcode
			and to_date(t2.date,'yyyy-mm-dd') = current_date
		where t1.fc_trigger=1
			and t1.current_prev = 'Current'
			and t2.lead_time = '7-day'
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
	left join (
		select *
		from "IBF-API"."Admin_area_data2"
		union all
		select *
		from "IBF-API"."Admin_area_data1"
	) t2
		on t1.pcode = t2.pcode
		and to_date(t2.date,'yyyy-mm-dd') = current_date
	where t1.fc_trigger=1
		and t1.current_prev = 'Current'
		and t2.lead_time = '7-day'
	) districtsToday
left join "IBF-pipeline-output".event_districts districtsExisting
	on districtsToday.event = districtsExisting.event
	and districtsToday.pcode = districtsExisting.pcode
where districtsExisting.pcode is null
;
--select * from "IBF-pipeline-output".event_districts where event = 91
--select * from "IBF-pipeline-output".events where country_code = 'ETH'

