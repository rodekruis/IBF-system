--
--create API view for Glofas stations
DROP TABLE IF EXISTS "IBF-API".redcross_branches;
create table "IBF-API".redcross_branches as
select "countryCode"
		,"name"
		,"numberOfVolunteers"
		,"contactPerson"
		,"contactAddress"
		,"contactNumber"
		, ST_AsGeoJSON(st_astext(geom))::json as geom
from "IBF-app"."redcrossBranch"
;
--select * from "IBF-API".redcross_branches
--
--create API view for Glofas stations
drop view if exists "IBF-API"."Glofas_stations";
create or replace view "IBF-API"."Glofas_stations" as
select gst."countryCode" as country_code
		,gst."leadTime" as lead_time
		,dgsv.station_code
		,dgsv.station_name
		,dgsv.trigger_level
		,dgsv.geom
	  , gst."forecastLevel" as fc
      , gst."forecastTrigger" as fc_trigger
      , gst."forecastProbability" as fc_prob
from (
	select "countryCode" as country_code
		,"stationCode" as station_code
		,"stationName" as station_name
		,"triggerLevel" as trigger_level
		,ST_AsGeoJSON(geom)::json As geom
	from "IBF-app"."glofasStation" gs
	) dgsv
left join "IBF-app"."glofasStationTrigger" gst
	on dgsv.station_code = gst."stationCode" 
	and dgsv.country_code = gst."countryCode" 
	and gst.date = current_date
;
--select * from "IBF-API"."Glofas_stations" where lead_time = '3-day' and country_code = 'ZMB'

drop view if exists "IBF-API"."Admin_area_data2" cascade;
create or replace view "IBF-API"."Admin_area_data2" as
select geo."placeCode"
	,geo."name"
	,geo."placeCodeParent" as pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCode" as country_code
	, date
	, lead_time
	, population_affected
	, row_to_json(daad.*) as indicators
from "IBF-app"."adminArea" geo
left join (
	select country_code 
		,lead_time
		,date
		,district as "placeCode" 
		,cast("sum" as float) as population_affected
	from "IBF-pipeline-output".calculated_affected
	where date = current_date 
	and source = 'population'
) ca
	on geo."placeCode" = ca."placeCode"  
	and geo."countryCode" = ca.country_code 
left join "IBF-pipeline-output".dashboard_admin_area_data daad 
	on geo."placeCode" = daad."placeCode"
where "adminLevel" = 2
;
--select * from "IBF-API"."Admin_area_data2" where country_code = 'UGA'

drop view if exists "IBF-API"."Admin_area_data1" cascade;
create or replace view "IBF-API"."Admin_area_data1" as
select geo."placeCode"
	,geo."name"
	,geo."placeCodeParent" as pcode_level0
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCode" as country_code
	, date
	, lead_time
	, population_affected
	, row_to_json(daad.*) as indicators
from "IBF-app"."adminArea" geo
left join (
	select country_code 
		,lead_time
		,date
		,district as "placeCode" 
		,cast("sum" as float) as population_affected
	from "IBF-pipeline-output".calculated_affected
	where date = current_date 
	and source = 'population'
) ca
	on geo."placeCode" = ca."placeCode"  
	and geo."countryCode" = ca.country_code 
left join "IBF-pipeline-output".dashboard_admin_area_data daad 
	on geo."placeCode" = daad."placeCode"
where "adminLevel" = 1
;
--select * from "IBF-API"."Admin_area_data1" where country_code = 'EGY'

drop view if exists "IBF-API"."Matrix_aggregates2";
create or replace view "IBF-API"."Matrix_aggregates2" as
select country_code
	,lead_time
	,sum(population_affected) as population_affected
from "IBF-API"."Admin_area_data2"
where country_code is not null
group by 1,2
;
--select * from "IBF-API"."Matrix_aggregates2"

drop view if exists "IBF-API"."Matrix_aggregates1";
create or replace view "IBF-API"."Matrix_aggregates1" as
select country_code
	,lead_time
	,sum(population_affected) as population_affected
from "IBF-API"."Admin_area_data1"
where country_code is not null
group by 1,2
;
--select * from "IBF-API"."Matrix_aggregates1"
