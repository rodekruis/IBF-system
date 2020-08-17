
DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_calculated_affected_adm3;
select cast('ZMB' as varchar) as country_code
	,*
	,cattle_affected * 1 +
	goat_affected * 0.1 +
	sheep_affected * 0.1 +
	pig_affected * 0.28 +
	chicken_affected * 0.01
	as livestock_affected
INTO "IBF-pipeline-output".dashboard_calculated_affected_adm3
from (
select pcode
    ,date
    ,current_prev
    ,lead_time
    ,sum(case when exposure_class = 'hrsl_zmb_pop_100_sum' then affected end) as population_affected
    ,sum(case when exposure_class = 'Chicken' then affected end) as chicken_affected
    ,sum(case when exposure_class = 'Cattle' then affected end) as cattle_affected
    ,sum(case when exposure_class = 'Goat' then affected end) as goat_affected
    ,sum(case when exposure_class = 'Pig' then affected end) as pig_affected
    ,sum(case when exposure_class = 'Sheep' then affected end) as sheep_affected
    ,sum(case when exposure_class = 'crop_resampled' then affected end) as cropland_affected
from (
    SELECT source as exposure_class
	, case when length(cast(district as varchar)) = 8 then '0' || cast(district as varchar) else cast(district as varchar) end as pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '3-day' as lead_time
	, case when sum = '--' then 0
	    when t1b.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1b.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_short t0
    left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1a
	on t0.district = t1a.pcode
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1b
	on case when length(cast(t1a.pcode_level2_new as varchar)) = 3 then '0' || cast(t1a.pcode_level2_new as varchar) else cast(t1a.pcode_level2_new as varchar) end = t1b.pcode
	and t1b.lead_time = '3-day'
	and t0.date = t1b.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1

    UNION ALL

    SELECT source as exposure_class
	, case when length(cast(district as varchar)) = 8 then '0' || cast(district as varchar) else cast(district as varchar) end as pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '7-day' as lead_time
	, case when sum = '--' then 0
	    when t1b.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1b.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_long t0
    left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1a
	on t0.district = t1a.pcode
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1b
	on case when length(cast(t1a.pcode_level2_new as varchar)) = 3 then '0' || cast(t1a.pcode_level2_new as varchar) else cast(t1a.pcode_level2_new as varchar) end = t1b.pcode
	and t1b.lead_time = '7-day'
	and t0.date = t1b.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1
    ) aa
group by 1,2,3,4
) bb
;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_calculated_affected_adm2;
select cast('ZMB' as varchar) as country_code
	,*
	,cattle_affected * 1 +
	goat_affected * 0.1 +
	sheep_affected * 0.1 +
	pig_affected * 0.28 +
	chicken_affected * 0.01
	as livestock_affected
INTO "IBF-pipeline-output".dashboard_calculated_affected_adm2
from (
select pcode
    ,date
    ,current_prev
    ,lead_time
    ,sum(case when exposure_class = 'hrsl_zmb_pop_100_sum' then affected end) as population_affected
    ,sum(case when exposure_class = 'Chicken' then affected end) as chicken_affected
    ,sum(case when exposure_class = 'Cattle' then affected end) as cattle_affected
    ,sum(case when exposure_class = 'Goat' then affected end) as goat_affected
    ,sum(case when exposure_class = 'Pig' then affected end) as pig_affected
    ,sum(case when exposure_class = 'Sheep' then affected end) as sheep_affected
    ,sum(case when exposure_class = 'crop_resampled' then affected end) as cropland_affected
from (
    SELECT source as exposure_class
	, case when length(cast(district as varchar)) = 8 then '0' || cast(district as varchar) else cast(district as varchar) end as pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '3-day' as lead_time
	, case when sum = '--' then 0
	    when t1.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_short t0
--    left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1a
--	on t0.district = t1a.pcode
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1
	on case when length(cast(t0.district as varchar)) = 3 then '0' || cast(t0.district as varchar) else cast(t0.district as varchar) end = t1.pcode
	and t1.lead_time = '3-day'
	and t0.date = t1.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1

    UNION ALL

    SELECT source as exposure_class
	, case when length(cast(district as varchar)) = 8 then '0' || cast(district as varchar) else cast(district as varchar) end as pcode
	, t0.date
	, case when date_part('day',age(current_date,to_date(t0.date,'yyyy-mm-dd'))) = 1 then 'Previous' else 'Current' end as current_prev
	, '7-day' as lead_time
	, case when sum = '--' then 0
	    when t1.fc_trigger = 0 then 0
	    else cast(sum as float)
	    end as affected
	, t1.fc_trigger
    FROM "IBF-pipeline-output".calculated_affected_long t0
--    left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1a
--	on t0.district = t1a.pcode
    left join "IBF-pipeline-output".dashboard_forecast_per_district t1
	on case when length(cast(t0.district as varchar)) = 3 then '0' || cast(t0.district as varchar) else cast(t0.district as varchar) end = t1.pcode
	and t1.lead_time = '7-day'
	and t0.date = t1.date
	where to_date(t0.date,'yyyy-mm-dd') >= current_date - 1
    ) aa
group by 1,2,3,4
) bb
;
--select * from "IBF-pipeline-output".dashboard_calculated_affected_adm2

--truncate TABLE "IBF-pipeline-output".data_adm3;
--insert into "IBF-pipeline-output".data_adm3
--select t1.*
--	,fc_trigger
--	,fc_trigger2
----into "IBF-pipeline-output".data_adm3
--from {} t0
--left join "IBF-pipeline-output".dashboard_calculated_affected_adm3 t1
--	ON t0.pcode = t1.pcode
--left join "IBF-pipeline-output".dashboard_forecast_per_district t2
--	ON t0.pcode_parent = t2.pcode and t1.current_prev = t2.current_prev and t1.lead_time = t2.lead_time
--;

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
	,coalesce(population_affected,0) as population_affected
	,coalesce(livestock_affected,0) as livestock_affected
	,chicken_affected,cattle_affected,goat_affected,pig_affected,sheep_affected
	,coalesce(cropland_affected,0) as cropland_affected
--into "IBF-pipeline-output".data_adm2
from {} t0
left join "IBF-pipeline-output".help_table t0a
on 1=1
left join "IBF-pipeline-output".waterstation_per_district t1
on t0.pcode = case when length(cast(t1.pcode as varchar)) = 3 then '0' || cast(t1.pcode as varchar) else cast(t1.pcode as varchar) end
left join "IBF-pipeline-output".dashboard_forecast_per_station  t2
ON ((t2.lead_time = '7-day' and t0a.lead_time = t2.lead_time and t1."station_code_7day" = t2.station_code) OR (t2.lead_time = '3-day' and t0a.lead_time = t2.lead_time and t1."station_code_3day" = t2.station_code))
and t0a.current_prev = t2.current_prev
and t0a.lead_time = t2.lead_time
left join (
	select case when length(cast(pcode as varchar)) = 3 then '0' || cast(pcode as varchar) else cast(pcode as varchar) end as pcode_level2
		, * 
	from "IBF-pipeline-output".dashboard_calculated_affected_adm2
--select
--    case when length(cast(t1.pcode_level2_new as varchar)) = 3 then '0' || cast(t1.pcode_level2_new as varchar) else cast(t1.pcode_level2_new as varchar) end as pcode_level2
--    ,lead_time
--    ,current_prev
--    ,date
--    ,sum(population_affected) as population_affected
--    ,sum(chicken_affected) as chicken_affected
--    ,sum(cattle_affected) as cattle_affected
--    ,sum(goat_affected) as goat_affected
--    ,sum(pig_affected) as pig_affected
--    ,sum(sheep_affected) as sheep_affected
--    ,sum(livestock_affected) as livestock_affected
--    ,sum(cropland_affected) as cropland_affected
--from "IBF-pipeline-output".dashboard_calculated_affected_adm3 t0
--left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1
--    on t0.pcode = case when length(cast(t1.pcode as varchar)) = 8 then '0' || cast(t1.pcode as varchar) else cast(t1.pcode as varchar) end
--group by 1,2,3,4
) t3
ON t0.pcode = t3.pcode_level2 and t0a.lead_time = t3.lead_time and t0a.current_prev = t3.current_prev
;
--select * from "IBF-pipeline-output".data_adm2

--truncate TABLE "IBF-pipeline-output".data_adm1;
--insert into "IBF-pipeline-output".data_adm1
--select t1.fc_trigger,t1.fc_trigger2
--	,t2.*
----into "IBF-pipeline-output".data_adm1
--from {} t0
--left join (
--select
--    substring(case when length(cast(t1.pcode_level2_new as varchar)) = 3 then '0' || cast(t1.pcode_level2_new as varchar) else cast(t1.pcode_level2_new as varchar) end,1,2) as pcode
--    ,lead_time
--    ,current_prev
--    ,date
--    ,sum(population_affected) as population_affected
--    ,sum(chicken_affected) as chicken_affected
--    ,sum(cattle_affected) as cattle_affected
--    ,sum(goat_affected) as goat_affected
--    ,sum(pig_affected) as pig_affected
--    ,sum(sheep_affected) as sheep_affected
--    ,sum(livestock_affected) as livestock_affected
--    ,sum(cropland_affected) as cropland_affected
--from "IBF-pipeline-output".dashboard_calculated_affected_adm3 t0
--left join "IBF-pipeline-output".pcode_mapping_wards_new_distcode t1
--    on t0.pcode = case when length(cast(t1.pcode as varchar)) = 8 then '0' || cast(t1.pcode as varchar) else cast(t1.pcode as varchar) end
--group by 1,2,3,4
--) t2
--ON t0.pcode = t2.pcode
--left join (
--select substring(pcode,1,2) as pcode
--    ,lead_time
--    ,current_prev
--    ,date
--    ,max(fc_trigger) as fc_trigger
--    ,max(fc_trigger2) as fc_trigger2
--from "IBF-pipeline-output".data_adm2
--group by 1,2,3,4
--) t1
--on t2.pcode = t1.pcode and t2.lead_time = t1.lead_time and t2.date = t1.date
--;