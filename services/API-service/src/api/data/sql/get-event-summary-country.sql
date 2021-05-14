


select
  to_char(max("endDate") , 'yyyy-mm-dd') as "endDate",
  to_char(min("startDate"), 'yyyy-mm-dd') as "startDate",
  max(country_code) as "countryCode",
  max("activeTrigger"::int)::boolean as "activeTrigger"
from
  (
  select
    e."placeCode" ,
    coalesce(a2.country_code , a1.country_code) as country_code,
    coalesce(a2.population_affected, a1.population_affected) as population_affected,
    e."endDate",
    e."startDate",
    e."activeTrigger"
  from
    "IBF-app".event_place_code e
  left join "IBF-API"."Admin_area_data2" a2 on
    a2."placeCode" = e."placeCode"
    and a2.country_code is not null
  left join "IBF-API"."Admin_area_data1" a1 on
    a1."placeCode" = e."placeCode"
    and a1.country_code is not null
  where
    closed = false
  group by
    e."placeCode",
    a2.population_affected,
    a1.population_affected,
    a2.country_code,
    a1.country_code,
    e."endDate",
    e."startDate",
    e."activeTrigger"
  order by
    population_affected desc ) as event_place_code_country where country_code = $1