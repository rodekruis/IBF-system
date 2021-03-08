select
      e."placeCode",
      a.name,
      a.population_affected as "populationAffected",
      e."eventPlaceCodeId"
    from
      "IBF-pipeline-output".event_place_code e
    inner join (
    	select name,pcode,max(population_affected) as population_affected
    	from (
	    	select country_code,name,pcode,population_affected
	    	from "IBF-API"."Admin_area_data2"
	    	union all
	    	select country_code,name,pcode,population_affected
	    	from "IBF-API"."Admin_area_data2"
    	) sub
    	where country_code = $1
      	and population_affected > 0
    	group by name,pcode
    ) a
    	on e."placeCode" = a.pcode   
    where
      closed = false
    order by
      "populationAffected" desc 