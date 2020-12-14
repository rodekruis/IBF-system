DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_calculated_affected_adm2;
select *
	,cattle_affected * 1 +
	goat_affected * 0.1 +
	sheep_affected * 0.1 +
	pig_affected * 0.28 +
	chicken_affected * 0.01
	as livestock_affected
INTO "IBF-pipeline-output".dashboard_calculated_affected_adm2
from (
select country_code
	,pcode
    ,date
    ,current_prev
    ,lead_time
    ,sum(case when exposure_class = 'population' then affected end) as population_affected
    ,sum(case when exposure_class = 'chicken' then affected end) as chicken_affected
    ,sum(case when exposure_class = 'cattle' then affected end) as cattle_affected
    ,sum(case when exposure_class = 'goat' then affected end) as goat_affected
    ,sum(case when exposure_class = 'pig' then affected end) as pig_affected
    ,sum(case when exposure_class = 'sheep' then affected end) as sheep_affected
    ,sum(case when exposure_class = 'cropland' then affected end) as cropland_affected
from (
    SELECT t0.country_code
    , source as exposure_class
	, pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '3-day' as lead_time
	, case when sum = '--' then 0
	    when t1.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_short t0
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1
	on t0.district = t1.pcode
	and t1.lead_time = '3-day'
	and t0.date = t1.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1

    UNION ALL

    SELECT t0.country_code
    , source as exposure_class
	, district as pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '7-day' as lead_time
	, case when sum = '--' then 0
	    when t1.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_long t0
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1
	on t0.district = t1.pcode
	and t1.lead_time = '7-day'
	and t0.date = t1.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1
    ) aa
group by 1,2,3,4,5
) bb
;
--select * from "IBF-pipeline-output".dashboard_calculated_affected_adm2 where country_code = 'KEN' order by population_affected
--select * FROM "IBF-pipeline-output".calculated_affected_long where country_code = 'ZMB'
--select * From  "IBF-pipeline-output".dashboard_forecast_per_district where country_code = 'ZMB'


drop table if exists "IBF-pipeline-output".help_table;
select 'Current' as current_prev
,'3-day' as lead_time
into "IBF-pipeline-output".help_table
union all
select 'Previous' as current_prev
,'3-day' as lead_time
union all
select 'Current' as current_prev
,'7-day' as lead_time
union all
select 'Previous' as current_prev
,'7-day' as lead_time
;

--drop table if exists "IBF-pipeline-output".data_adm2 cascade;
TRUNCATE TABLE "IBF-pipeline-output".data_adm2;
insert into "IBF-pipeline-output".data_adm2
select t3.country_code
	,t0.pcode
	,t3.date
	,t0a.current_prev
	,t0a.lead_time
	,fc,fc_trigger,fc_rp,fc_perc,fc_prob,fc_trigger2
	,other_lead_time_trigger
	,case when fc_trigger = 1 then coalesce(population_affected,0) else 0 end as population_affected
	,coalesce(livestock_affected,0) as livestock_affected
	,chicken_affected,cattle_affected,goat_affected,pig_affected,sheep_affected
	,coalesce(cropland_affected,0) as cropland_affected
	,t0.indicators
--into "IBF-pipeline-output".data_adm2
from (
	select * 
	from "IBF-static-input"."CRA_data_2"
	union all
	select *
	from "IBF-static-input"."CRA_data_1"
) t0
left join "IBF-pipeline-output".help_table t0a
on 1=1
left join "IBF-static-input".waterstation_per_district t1
on t0.pcode = t1.pcode
left join "IBF-pipeline-output".dashboard_forecast_per_station  t2
ON ((t2.lead_time = '7-day' and t0a.lead_time = t2.lead_time and t1."station_code_7day" = t2.station_code) OR (t2.lead_time = '3-day' and t0a.lead_time = t2.lead_time and t1."station_code_3day" = t2.station_code))
and t0a.current_prev = t2.current_prev
and t0a.lead_time = t2.lead_time
left join (
	select pcode as pcode_level2
		, * 
	from "IBF-pipeline-output".dashboard_calculated_affected_adm2
) t3
ON t0.pcode = t3.pcode_level2 and t0a.lead_time = t3.lead_time and t0a.current_prev = t3.current_prev
;
--select * from "IBF-pipeline-output".data_adm2 where country_code = 'KEN'
