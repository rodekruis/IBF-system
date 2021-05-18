select
      e."placeCode",
      a.name,
      e."populationAffected",
      e."eventPlaceCodeId",
      e."activeTrigger"
    from
      "IBF-app".event_place_code e
    inner join (
    	select name,"placeCode"
    	from (
	    	select countryCodeISO3,name,"placeCode"
	    	from "IBF-API"."Admin_area_data2"
	    	union all
	    	select countryCodeISO3,name,"placeCode"
	    	from "IBF-API"."Admin_area_data1"
    	) sub
    	where countryCodeISO3 = $1
    	group by name,"placeCode"
    ) a
    	on e."placeCode" = a."placeCode"   
    where
      closed = false
    order by
      "populationAffected" desc 