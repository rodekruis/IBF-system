--DROP TABLE IF EXISTS "IBF-static-input".dashboard_glofas_stations;
truncate TABLE "IBF-static-input".dashboard_glofas_stations;
insert into "IBF-static-input".dashboard_glofas_stations
SELECT cast('ZMB' as varchar) as country_code 
	, station_code
	, station_name
	, "10yr_threshold" as trigger_level
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
--INTO "IBF-static-input".dashboard_glofas_stations
FROM "IBF-static-input"."ZMB_glofas_stations"
union all
SELECT 'UGA' as country_code
	, station_code
	, station_name
	, "5yr_threshold" as trigger_level
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."UGA_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."UGA_waterstation_per_district" group by 1)
union all
SELECT 'KEN' as country_code
	, station_code
	, station_name
	, "5yr_threshold" as trigger_level
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."KEN_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."KEN_waterstation_per_district" group by 1)
union all
SELECT 'ETH' as country_code
	, station_code
	, station_name
	, "5yr_threshold" as trigger_level
	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
FROM "IBF-static-input"."ETH_glofas_stations"
where station_code in (select station_code_7day from "IBF-static-input"."ETH_waterstation_per_district" group by 1)
--union all
--SELECT 'EGY' as country_code
--	, station_code
--	, station_name
--	, "5yr_threshold" as trigger_level
--	,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
--FROM "IBF-static-input"."EGY_glofas_stations"
--where station_code in (select station_code_7day from "IBF-static-input"."EGY_waterstation_per_district" group by 1)
;
--select * from "IBF-pipeline-output".dashboard_glofas_stations

DROP TABLE IF EXISTS "IBF-static-input".waterstation_per_district;
SELECT cast('ZMB' as varchar) as country_code 
	, "distName"
	, cast(pcode as varchar)
	, station_code_3day
	, station_code_7day
INTO "IBF-static-input".waterstation_per_district
FROM "IBF-static-input"."ZMB_waterstation_per_district"
union all 
SELECT cast('UGA' as varchar) as country_code 
	, "distName"
	, cast(pcode as varchar)
	, station_code_3day
	, station_code_7day
FROM "IBF-static-input"."UGA_waterstation_per_district"
union all
SELECT cast('KEN' as varchar) as country_code 
	, "County"
	, cast(pcode as varchar)
	, null
	, station_code_7day
FROM "IBF-static-input"."KEN_waterstation_per_district"
union all
SELECT cast('ETH' as varchar) as country_code 
	, zone
	, cast(pcode as varchar)
	, null
	, station_code_7day
FROM "IBF-static-input"."ETH_waterstation_per_district"
--union all
--SELECT cast('EGY' as varchar) as country_code
--	, "distName"
--	, cast(pcode as varchar)
--	, station_code_3day
--	, station_code_7day
--FROM "IBF-static-input"."EGY_waterstation_per_district"
;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_redcross_branches;
SELECT  "BRANCH" branch_name
	, "PROVINCE" province
	, "PRESIDENT" president
	, "TOTAL" as nr_volunteers
	, "LOCATION OF OFFICE" as address
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
INTO "IBF-pipeline-output".dashboard_redcross_branches
FROM "IBF-pipeline-output".redcross_branches
;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_poi_healthsites;
SELECT name
			,type
			,st_SetSrid(st_MakePoint("Y", "X"), 4326) as geom
INTO "IBF-pipeline-output".dashboard_poi_healthsites
FROM "IBF-pipeline-output".healthsites;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_poi_waterpoints;
SELECT water_tech
	,activity_id
			,st_SetSrid(st_MakePoint(lat_deg, lon_deg), 4326) as geom
INTO "IBF-pipeline-output".dashboard_poi_waterpoints
FROM "IBF-pipeline-output".waterpoints
;

--DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_roads;
--SELECT row_to_json(featcoll) as roads
--into "IBF-pipeline-output".dashboard_roads
--FROM (
--	SELECT 'FeatureCollection' As type, array_to_json(array_agg(feat)) As features
--	FROM (
--		SELECT 'Feature' As type
--			,ST_AsGeoJSON(tbl.geom)::json As geometry
--			,row_to_json((SELECT l FROM (SELECT tbl.highway) As l)) As properties
--		FROM "IBF-pipeline-output".hotosm_zmb_roads_lines_mapshaper As tbL
--		WHERE highway in ('primary','secondary','tertiary')
--		)  As feat 
--	)  As featcoll
--;

drop table if exists "IBF-API"."metadata";
--truncate table "IBF-API"."metadata";
--insert into "IBF-API"."metadata"
select cast('UGA' as varchar) as country_code
	, "name", "label", "group", icon, "weightedAvg", active, "numberFormat", "source", description
into "IBF-API"."metadata"
from "IBF-static-input"."metadata"
where country_code like '%UGA%'
union all 
select cast('ZMB' as varchar) as country_code
	, "name", "label", "group", icon, "weightedAvg", active, "numberFormat", "source", description
from "IBF-static-input"."metadata"
where country_code like '%ZMB%'
union all 
select cast('KEN' as varchar) as country_code
	, "name", "label", "group", icon, "weightedAvg", active, "numberFormat", "source", description
from "IBF-static-input"."metadata"
where country_code like '%KEN%'
union all 
select cast('ETH' as varchar) as country_code
	, "name", "label", "group", icon, "weightedAvg", active, "numberFormat", "source", description
from "IBF-static-input"."metadata"
where country_code like '%ETH%'
;
--select * from "IBF-API"."metadata"
--select * from "IBF-static-input"."metadata"




DROP FUNCTION IF EXISTS "IBF-pipeline-output".usp_fbf_geodata(varchar, varchar, varchar);
CREATE OR REPLACE FUNCTION "IBF-pipeline-output".usp_fbf_geodata(country varchar, schema_name varchar, table_name varchar, OUT result json) AS $func$
	BEGIN
	EXECUTE format('
		SELECT row_to_json(featcoll)
		FROM (
			SELECT ''FeatureCollection'' As type, array_to_json(array_agg(feat)) As features
			FROM (
				SELECT ''Feature'' As type
					,ST_AsGeoJSON(tbl.geom)::json As geometry
					,row_to_json((SELECT l FROM (SELECT tbl.*) As l)) As properties
				FROM %s.%s As tbL
				)  As feat
			)  As featcoll
		;',schema_name, table_name)
	INTO result;
	END
$func$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS "IBF-pipeline-output".usp_fbf_data(varchar, varchar, varchar);
CREATE OR REPLACE FUNCTION "IBF-pipeline-output".usp_fbf_data(country varchar, schema_name varchar, table_name varchar, OUT result json) AS $func$
	BEGIN
	EXECUTE format('select array_to_json(array_agg(tbl))
			from (
			select *
			from %s.%s
			) tbl;',schema_name,table_name)
	INTO result;
	END
$func$ LANGUAGE plpgsql;
