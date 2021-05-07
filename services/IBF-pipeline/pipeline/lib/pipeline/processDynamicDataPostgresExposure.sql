DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_calculated_affected;
select country_code
	,pcode
    ,date
    ,lead_time
    ,sum(case when exposure_class = 'population' then affected end) as population_affected
INTO "IBF-pipeline-output".dashboard_calculated_affected
from (
    SELECT t0.country_code
    , source as exposure_class
	, district as pcode
	, t0.date
	, t0.lead_time as lead_time
	, case when sum = '--' then 0
	    else cast(sum as float)
	    end as affected
    FROM "IBF-pipeline-output".calculated_affected t0
	where t0.date = current_date
    ) aa
group by 1,2,3,4
;
--select * from "IBF-pipeline-output".dashboard_calculated_affected
--select * from "IBF-pipeline-output".calculated_affected


drop table if exists "IBF-pipeline-output".help_table;
create table "IBF-pipeline-output".help_table as
select '3-day' as lead_time
union all
select '5-day' as lead_time
union all
select '7-day' as lead_time
union all
select '1-month' as lead_time
union all
select '2-month' as lead_time
union all
select '3-month' as lead_time
;
--select * from "IBF-pipeline-output".help_table;

CREATE TABLE IF NOT EXISTS "IBF-pipeline-output".data_adm2 (
	country_code text NULL,
	pcode varchar NULL,
	"date" date NULL,
	lead_time text NULL,
	fc float8 NULL,
	fc_trigger int8 NULL,
	fc_rp float8 NULL,
	fc_prob int8 NULL,
	population_affected float8 NULL,
	indicators json NULL
);
--drop table "IBF-pipeline-output".data_adm2 cascade;
TRUNCATE TABLE "IBF-pipeline-output".data_adm2;
insert into "IBF-pipeline-output".data_adm2
select t3.country_code
	,t0.pcode
	,t3.date
	,t0a.lead_time
	,fc,fc_trigger,fc_rp,fc_prob
	,population_affected
	,row_to_json(t0.*) as indicators
--into "IBF-pipeline-output".data_adm2
from "IBF-pipeline-output".dashboard_admin_area_data t0
left join "IBF-pipeline-output".help_table t0a
on 1=1
left join "IBF-app"."adminArea" t1
on t0.pcode = t1."placeCode" 
left join "IBF-pipeline-output".dashboard_forecast_per_station  t2
ON t1."glofasStation" = t2.station_code 
	and t1."countryCode" = t2.country_code 
	and t0a.lead_time = t2.lead_time
left join (
	select pcode as pcode_level2
		, * 
	from "IBF-pipeline-output".dashboard_calculated_affected
) t3
ON t0.pcode = t3.pcode_level2 and t0a.lead_time = t3.lead_time
where t3.country_code is not null
;
--select * from "IBF-pipeline-output".data_adm2
