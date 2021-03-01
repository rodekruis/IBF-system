
  select
    *
  from
    (
    select
      e."placeCode",
      coalesce(a2.name, a1.name) as name,
      coalesce(a2.population_affected, a1.population_affected) as "populationAffected",
      e.id
    from
      "IBF-pipeline-output".event_place_code e
    left join "IBF-API"."Admin_area_data2" a2 on
      a2.pcode = e."placeCode"
      and a2.country_code = $1
      and a2.name is not null
      and a2.current_prev = 'Current'
    left join "IBF-API"."Admin_area_data1" a1 on
      a1.pcode = e."placeCode"
      and a1.current_prev = 'Current'
      and a1.name is not null
      and a1.country_code = $2
    where
      closed = false
    group by
      e."placeCode",
      a2.population_affected,
      a1.population_affected,
      a2.name,
      a1.name,
      e.id
    order by
      "populationAffected" desc ) as ec
  where
    name is not null