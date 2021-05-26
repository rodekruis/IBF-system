 select
      e."placeCode",
      aa.name,
      e."populationAffected",
      e."eventPlaceCodeId",
      e."activeTrigger"
    from
      "IBF-app".event_place_code e
    inner join (
    	select "placeCode"
    	from (
			select "countryCodeISO3"
				,"placeCode" 
				,value as population_affected
			from "IBF-app"."admin-area-dynamic-data"
			where date = current_date 
			and indicator = 'population_affected'
    	) sub
    	where "countryCodeISO3" = $1
    	group by "placeCode"
    ) a
    	on e."placeCode" = a."placeCode"   
    left join "IBF-app"."admin-area" aa
    	on e."placeCode" = aa."placeCode"
    where
      closed = false
    order by
      "populationAffected" desc 