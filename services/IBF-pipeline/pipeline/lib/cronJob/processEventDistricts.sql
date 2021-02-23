-- NOTE: Save districts to event. Each day check if there are new districts. Never delete any districts that are not triggered any more.

-- First set all events as inactive
update
	"IBF-pipeline-output".event_pcode
set
	active_trigger = false;

-- Second, update (potentially) updated population-affected figures for existing pcodes and set active_trigger events active_trigger again
update
	"IBF-pipeline-output".event_pcode
set
	end_date = (now() + interval '7 DAY')::date, 
	active_trigger = true
from
	(
	select
		districtsToday.*
	from
		(
		select
			t1.pcode ,
			population_affected,
			t2.date
		from
			"IBF-pipeline-output".dashboard_forecast_per_district t1
		left join (
			select
				*
			from
				"IBF-API"."Admin_area_data2"
		union all
			select
				*
			from
				"IBF-API"."Admin_area_data1" ) t2 on
			t1.pcode = t2.pcode
			and to_date(t2.date, 'yyyy-mm-dd') = current_date
		where
			t1.fc_trigger = 1
			and t1.current_prev = 'Current'
			and t2.lead_time = '7-day' ) districtsToday
	left join "IBF-pipeline-output".event_pcode eventPcodeExisting on
		districtsToday.pcode = eventPcodeExisting.pcode
	where
		eventPcodeExisting.pcode is not null
		and eventPcodeExisting.closed is false ) subquery
where
	event_pcode.pcode = subquery.pcode
	and event_pcode.closed = false 
;


-- Third: add new districts (either within existing event, or completely new event)
insert into "IBF-pipeline-output".event_pcode(pcode,  start_date, end_date)
select  districtsToday.*
from (
	select t1.pcode
		,now()::date as start_date
		,(now() + interval '7 DAY')::date as end_date 		
    from "IBF-pipeline-output".dashboard_forecast_per_district t1
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
left join "IBF-pipeline-output".event_pcode districtsExisting
	on districtsToday.pcode = districtsExisting.pcode
	and districtsExisting.closed = false
where districtsExisting.pcode is null
;
--select * from "IBF-pipeline-output".event_districts where event = 91
--select * from "IBF-pipeline-output".events where country_code = 'ETH'

-- Lastly Close events older than 7 days
update
	"IBF-pipeline-output".event_pcode
set
	closed = true
where 
	end_date < now()::date
	;