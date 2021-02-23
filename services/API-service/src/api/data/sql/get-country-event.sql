select
  to_char(max(end_date) , 'yyyy-mm-dd') as end_date,
  to_char(min(start_date), 'yyyy-mm-dd') as start_date,
  max(country_code) as country_code,
  max(active_trigger::int)::boolean as active_trigger
from
  (
  select
    e.pcode,
    coalesce(a2.country_code , a1.country_code) as country_code,
    coalesce(a2.population_affected, a1.population_affected) as population_affected,
    e.end_date,
    e.start_date,
    e.active_trigger
  from
    "IBF-pipeline-output".event_pcode e
  left join "IBF-API"."Admin_area_data2" a2 on
    a2.pcode = e.pcode
    and a2.current_prev = 'Current'
    and a2.country_code is not null
  left join "IBF-API"."Admin_area_data1" a1 on
    a1.pcode = e.pcode
    and a1.current_prev = 'Current'
    and a1.country_code is not null
  where
    closed = false
  group by
    e.pcode,
    a2.population_affected,
    a1.population_affected,
    a2.country_code,
    a1.country_code,
    e.end_date,
    e.start_date,
    e."active_trigger"
  order by
    population_affected desc ) as event_pcode_country where country_code = $1