--This script is not connected explicitly to the rest of the repository
--These views/functions are stored in Postgres and called from
--They are kept explicitly here in the repository for documentation


--TO DO: transform to generic row-to-column pivot (but not worth it before completely moving all sql to typescript)
drop table if exists "IBF-app".admin_area_data_pivoted;
create table "IBF-app".admin_area_data_pivoted as
select aa."placeCode"
		,max(case when key = 'population_over65' then value end) as population_over65
		,max(case when key = 'female_head_hh' then value end) as female_head_hh
		,max(case when key = 'population_u8' then value end) as population_u8
		,max(case when key = 'poverty_incidence' then value end) as poverty_incidence
		,max(case when key = 'roof_type' then value end) as roof_type
		,max(case when key = 'wall_type' then value end) as wall_type
		,max(case when key = 'Weighted Vulnerability Index' then value end) as vulnerability_index
		,max(case when key = 'covid_risk' then value end) as covid_risk
		,max(case when key = 'population_u9' then value end) as population_u9
		,max(case when key = 'dengue_incidence_average' then value end) as dengue_incidence_average
		,max(case when key = 'dengue_cases_average' then value end) as dengue_cases_average
from "IBF-app"."adminArea" aa
left join "IBF-app"."adminAreaData" aad
	on aa."placeCode" = aad."placeCode"
group by 1
;
--select * from "IBF-app".admin_area_data_pivoted