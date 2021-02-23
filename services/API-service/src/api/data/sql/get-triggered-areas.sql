select
    *
  from
    (
    select
      e.pcode,
      coalesce(a2.name, a1.name) as name,
      coalesce(a2.population_affected, a1.population_affected) as population_affected,
      e.id
    from
      "IBF-pipeline-output".event_pcode e
    left join "IBF-API"."Admin_area_data2" a2 on
      a2.pcode = e.pcode
      and a2.country_code = $1
      and a2.name is not null
      and a2.current_prev = 'Current'
    left join "IBF-API"."Admin_area_data1" a1 on
      a1.pcode = e.pcode
      and a1.current_prev = 'Current'
      and a1.name is not null
      and a1.country_code = $2
    where
      closed = false
    group by
      e.pcode,
      a2.population_affected,
      a1.population_affected,
      a2.name,
      a1.name,
      e.id
    order by
      population_affected desc ) as ec
  where
    name is not null