--This script is not connected explicitly to the rest of the repository
--These views/functions are stored in Postgres and called from
--They are kept explicitly here in the repository for documentation 

--Combine CRA data in one table (input used in processDynamicDataPostgresExposure.sql)
drop view if exists "IBF-static-input"."CRA_data_2";
create or replace view "IBF-static-input"."CRA_data_2" as 
select cast('ZMB' as varchar) as country_code
	, pcode
	, row_to_json(zmb.*) as indicators
from "IBF-static-input"."ZMB_CRA_Indicators_2" zmb
union all
select cast('ETH' as varchar) as country_code
	, pcode
	, row_to_json(
		ken.*
		) as indicators
from "IBF-static-input"."ETH_CRA_Indicators_2" ken
union all
select cast('UGA' as varchar) as country_code
	, total.pcode
	, row_to_json(total.*) as indicators
from (
	select uga.*
		, fl."Weighted Vulnerability Index" as vulnerability_index
	from "IBF-static-input"."UGA_CRA_Indicators_2" uga
	left join "IBF-static-input"."UGA_flood_vulnerability" fl on uga.pcode_level2 = fl."pointsADM2_PCODE"
) total
;
--select * from "IBF-static-input"."CRA_data_2" where country_code = 'UGA'

--Combine CRA data in one table (input used in processDynamicDataPostgresExposure.sql)
drop view if exists "IBF-static-input"."CRA_data_1";
create or replace view "IBF-static-input"."CRA_data_1" as 
select cast('KEN' as varchar) as country_code
	, pcode
	, row_to_json(ken.*) as indicators
from "IBF-static-input"."KEN_CRA_Indicators_1" ken
union all 
select cast('EGY' as varchar) as country_code
	, pcode
	, null as indicators
from "IBF-app"."adminArea" 
where "countryCode" = 'EGY'
;
--select * from "IBF-static-input"."CRA_data_1" where country_code = 'UGA'

--create API view for Glofas stations
drop view if exists "IBF-API"."Glofas_stations";
create or replace view "IBF-API"."Glofas_stations" as
select dfps.country_code
		,dfps.lead_time
		,dgsv.station_code
		,dgsv.station_name
		,dgsv.trigger_level
		,dgsv.geom
	  , dfps.fc
      , dfps.fc_trigger
      , dfps.fc_perc
      , dfps.fc_prob
from (
	select country_code
		,station_code 
		,station_name 
		,trigger_level 
		,ST_AsGeoJSON(ST_FlipCoordinates(geom))::json As geom
	from "IBF-static-input".dashboard_glofas_stations
	where country_code <> 'ETH'
	
	-- TEMPORARY FIX TO JOIN 'OLD' and 'NEW' 
	union all
	
	select "countryCode"
		,"stationCode"
		,"stationName"
		,"triggerLevel"
		,ST_AsGeoJSON(geom)::json As geom
	from "IBF-app"."glofasStation" gs 
	where "countryCode" = 'ETH'
	) dgsv
left join "IBF-pipeline-output".dashboard_forecast_per_station dfps on dgsv.station_code = dfps.station_code and dgsv.country_code = dfps.country_code
;
--select * from "IBF-API"."Glofas_stations" where lead_time = '3-day' and country_code = 'ZMB'

drop view if exists "IBF-API"."Trigger_per_lead_time";
create or replace view "IBF-API"."Trigger_per_lead_time" as 
select *
from "IBF-pipeline-output".dashboard_triggers_per_day
;
--select * from "IBF-API"."Trigger_per_lead_time"


--drop view if exists "IBF-API"."Admin_area_data2" cascade;
--create or replace view "IBF-API"."Admin_area_data2" as 
--select geo.pcode_level2
--	,geo."name"
--	,geo.pcode_level1
--	,ST_AsGeoJSON(geo.geom)::json As geom
--	,d2.*
--from (
--	select cast('ZMB' as varchar) as country_code
--			,pcode_level2 
--			,name
--			,pcode_level1
--			,st_geometryfromtext(geom) as geom
--	from "IBF-static-input"."ZMB_Geo_level2" zmb
--	union all
--	select cast('UGA' as varchar) as country_code
--			,*
--	from "IBF-static-input"."UGA_Geo_level2" uga
--	union all
--	select cast('ETH' as varchar) as country_code
--			,pcode_level2 
--			,name
--			,pcode_level1
--			,st_geometryfromtext(geom) as geom
----	select *
--	from "IBF-static-input"."ETH_Geo_level2" eth
--	union all
--	select "countryCode" 
--			,pcode
--			,"name" 
--			,"pcodeParent"
--			,st_geom
----	select * 
--	from "IBF-app"."adminArea"
--	where "countryCode" = 'EGY'
--) geo
--left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode_level2 = d2.pcode
--;
drop view if exists "IBF-API"."Admin_area_data2" cascade;
create or replace view "IBF-API"."Admin_area_data2" as 
select geo.pcode as pcode_level2
	,geo."name"
	,geo."pcodeParent" as pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCode" as country_code
	,d2.pcode, "date", lead_time, fc, fc_trigger, fc_rp, fc_perc, fc_prob, population_affected, indicators
from "IBF-app"."adminArea" geo
left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode = d2.pcode
where "adminLevel" = 2
;
--select * from "IBF-API"."Admin_area_data2" where country_code = 'ZMB'
--select * from "IBF-app"."adminArea" geo where "cou

drop view if exists "IBF-API"."Admin_area_data1" cascade;
create or replace view "IBF-API"."Admin_area_data1" as 
select geo.pcode as pcode_level1
	,geo."name"
	,geo."pcodeParent" as pcode_level0
	,ST_AsGeoJSON(geo.geom)::json As geom
	,"countryCode" as country_code
--	,d2.*
	,d2.pcode, "date", lead_time, fc, fc_trigger, fc_rp, fc_perc, fc_prob, population_affected, indicators
from "IBF-app"."adminArea" geo
left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode = d2.pcode
where "adminLevel" = 1
;
--select * from "IBF-API"."Admin_area_data1" where country_code = 'EGY'

--drop view if exists "IBF-API"."Admin_area_data1" cascade;
--create or replace view "IBF-API"."Admin_area_data1" as 
--select geo.pcode_level1
--	,geo."name"
--	,geo.pcode_level0
--	,ST_AsGeoJSON(geo.geom)::json As geom
--	,d2.*
--from (
--	select cast('KEN' as varchar) as country_code
--			,pcode_level1
--			,name
--			,pcode_level0
--			,st_geometryfromtext(geom) as geom
--	from "IBF-static-input"."KEN_Geo_level1" ken
--) geo
--left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode_level1 = d2.pcode
--;
--select * from "IBF-API"."Admin_area_data1" where country_code = 'KEN'

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

