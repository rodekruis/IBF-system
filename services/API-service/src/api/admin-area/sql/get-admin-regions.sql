with pivot as (
	select aa."placeCode"
			,max(case when indicator = 'population_over65' then value end) as population_over65
			,max(case when indicator = 'female_head_hh' then value end) as female_head_hh
			,max(case when indicator = 'population_u8' then value end) as population_u8
			,max(case when indicator = 'poverty_incidence' then value end) as poverty_incidence
			,max(case when indicator = 'roof_type' then value end) as roof_type
			,max(case when indicator = 'wall_type' then value end) as wall_type
			,max(case when indicator = 'Weighted Vulnerability Index' then value end) as vulnerability_index
			,max(case when indicator = 'covid_risk' then value end) as covid_risk
			,max(case when indicator = 'population_u9' then value end) as population_u9
			,max(case when indicator = 'dengue_incidence_average' then value end) as dengue_incidence_average
			,max(case when indicator = 'dengue_cases_average' then value end) as dengue_cases_average
	from "IBF-app"."admin-area" aa
	left join "IBF-app"."admin-area-data" aad
		on aa."placeCode" = aad."placeCode"
	group by 1
)
select geo."placeCode"
	,geo."name"
	,ST_AsGeoJSON(geo.geom)::json As geom
	,geo."countryCodeISO3"
	, date
	, "leadTime"
	, population_affected
	, row_to_json(pivot.*) as indicators
from "IBF-app"."admin-area" geo
left join (
	select "countryCodeISO3"
		,"leadTime"
		,date
		,"placeCode" 
		,value as population_affected
	from "IBF-app"."admin-area-dynamic-data"
	where date = current_date 
	and indicator = 'population_affected'
) ca
	on geo."placeCode" = ca."placeCode"  
	and geo."countryCodeISO3" = ca."countryCodeISO3"
left join pivot
	on geo."placeCode" = pivot."placeCode"
where geo."countryCodeISO3" = $1
and "leadTime" = $2
and "adminLevel" = $3
