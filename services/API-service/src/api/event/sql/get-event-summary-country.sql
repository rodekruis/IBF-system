select
  to_char(max("endDate") , 'yyyy-mm-dd') as "endDate",
  to_char(min("startDate"), 'yyyy-mm-dd') as "startDate",
  max("countryCodeISO3") as "countryCodeISO3",
  max("activeTrigger"::int)::boolean as "activeTrigger"
from
  (
  select
    e."placeCode" ,
    aa."countryCodeISO3",
    aa.population_affected,
    e."endDate",
    e."startDate",
    e."activeTrigger"
  from
    "IBF-app".event_place_code e
  left join (
  	select "countryCodeISO3"
		,"placeCode" 
		,value as population_affected
	from "IBF-app"."admin-area-dynamic-data"
	where date = current_date 
	and indicator = 'population_affected'
  ) aa
  	on e."placeCode" = aa."placeCode"
  	and aa."countryCodeISO3" is not null
  where
    closed = false
  group by
    e."placeCode",
    aa.population_affected,
    aa."countryCodeISO3",
    e."endDate",
    e."startDate",
    e."activeTrigger"
  order by
    population_affected desc ) as event_place_code_country where "countryCodeISO3" = $1