select
      e."placeCode",
      a.name,
      e."populationAffected",
      e."eventPlaceCodeId",
      e."activeTrigger"
    from
      "IBF-pipeline-output".event_place_code e
    inner join (
    	select name,pcode
    	from (
	    	select country_code,name,pcode
	    	from "IBF-API"."Admin_area_data2"
	    	union all
	    	select country_code,name,pcode
	    	from "IBF-API"."Admin_area_data1"
    	) sub
    	where country_code = $1
    	group by name,pcode
    ) a
    	on e."placeCode" = a.pcode   
    where
      closed = false
    order by
      "populationAffected" desc 