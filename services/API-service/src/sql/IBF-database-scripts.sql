--This script is not connected explicitly to the rest of the repository
--These views/functions are stored in Postgres and called from
--They are kept explicitly here in the repository for documentation 

--create view
drop view if exists "IBF-API"."Glofas_stations";
create or replace view "IBF-API"."Glofas_stations" as
select dfps.country_code
		,dfps.lead_time
		,dgsv.station_code
		,dgsv.station_name
		,ST_AsGeoJSON(ST_FlipCoordinates(dgsv.geom))::json As geom
		,dgsv.trigger_level
	  , dfps.fc
      , dfps.fc_trigger
      , dfps.fc_perc
      , dfps.fc_prob
from "IBF-pipeline-output".dashboard_glofas_stations dgsv
left join "IBF-pipeline-output".dashboard_forecast_per_station dfps on dgsv.station_code = dfps.station_code and dgsv.country_code = dfps.country_code
where current_prev = 'Current'
;
--select * from "IBF-API"."Glofas_stations"

drop view if exists "IBF-API"."Trigger_per_lead_time";
create or replace view "IBF-API"."Trigger_per_lead_time" as 
select country_code
		,lead_time
		,max(fc_trigger) as fc_trigger
from "IBF-pipeline-output".dashboard_forecast_per_station
where current_prev = 'Current'
group by 1,2
;
--select * from "IBF-API"."Trigger_per_lead_time"


drop view if exists "IBF-API"."Admin_area_data1";
create or replace view "IBF-API"."Admin_area_data1" as 
select zgl.pcode_level1
	,zgl."name"
	,zgl.pcode_level0
	,ST_AsGeoJSON(zgl.geom)::json As geom
	,d1.*
from "IBF-static-input"."ZMB_Geo_level1" zgl
left join "IBF-pipeline-output".data_adm1 d1 on zgl.pcode_level1 = d1.pcode
where d1.date is not null
;
--select * from "IBF-API"."Admin_area_data1"

drop view if exists "IBF-API"."Admin_area_data2";
create or replace view "IBF-API"."Admin_area_data2" as 
select country_code
	,geo.pcode_level2
	,geo."name"
	,geo.pcode_level1
	,ST_AsGeoJSON(geo.geom)::json As geom
	,d2.*
from (
	select cast('ZMB' as varchar) as country_code
			,*
	from "IBF-static-input"."ZMB_Geo_level2" zmb
	union all
	select cast('UGA' as varchar) as country_code
			,pcode as pcode_level2
			,name 
			,adm1pcode as pcode_level1
			,the_geom as geom
	from public.uga_admin2
) geo
left join "IBF-pipeline-output".data_adm2 d2 on geo.pcode_level2 = d2.pcode
where current_prev = 'Current'
--where d2.date is not null
;
--select * from "IBF-API"."Admin_area_data2" where country_code = 'UGA'

drop view if exists "IBF-API"."Admin_area_data3";
create or replace view "IBF-API"."Admin_area_data3" as 
select cast(3 as int) as admin_level 
	,zgl.pcode_level3
	,zgl."name"
	,zgl.pcode_level2
	,ST_AsGeoJSON(zgl.geom)::json As geom
	,d3.*
from "IBF-static-input"."ZMB_Geo_level3" zgl
left join "IBF-pipeline-output".data_adm3 d3 on zgl.pcode_level3 = d3.pcode
where d3.date is not null
;
--select * from "IBF-API"."Admin_area_data3"


--create function (not used for now)
CREATE OR REPLACE FUNCTION "IBF-API".get_stations(country character varying, current_prev character varying, lead_time character varying, OUT result json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
	BEGIN
	EXECUTE format('
		with data as (
		select * from "IBF-API"."Glofas_stations"
		where 0=0
		and current_prev = ''%s''
		and lead_time = ''%s''
		)
		SELECT row_to_json(featcoll)
		FROM (
			SELECT ''FeatureCollection'' As type, array_to_json(array_agg(feat)) As features
			FROM (
				SELECT ''Feature'' As type
					,ST_AsGeoJSON(tbl.geom)::json As geometry
					,row_to_json((SELECT l FROM (SELECT tbl.*) As l)) As properties
				FROM data As tbl
				)  As feat
			)  As featcoll
		;',current_prev, lead_time)
	INTO result;
	END
$function$
;
--select "IBF-API".get_stations('ZMB','Current','3-day')
