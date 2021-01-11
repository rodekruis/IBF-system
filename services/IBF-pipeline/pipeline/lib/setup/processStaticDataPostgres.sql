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
--select * from "IBF-static-input".dashboard_glofas_stations

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
--select * from "IBF-static-input".waterstation_per_district

DROP TABLE IF EXISTS "IBF-static-input".dashboard_redcross_branches;
SELECT  'ZMB' as country_code
	, initcap("BRANCH") as name
	, "TOTAL" as nr_volunteers
	, "PRESIDENT" as contact_person
	, "LOCATION OF OFFICE" as contact_address
	, null as contact_number
	, ST_AsGeoJSON(st_SetSrid(st_MakePoint(lon, lat), 4326))::json as geom
INTO "IBF-static-input".dashboard_redcross_branches
FROM "IBF-static-input"."ZMB_redcross_branches"
union all
SELECT 'UGA' as country_code 
	, initcap("BranchName") as name 
	, null as nr_volunteers 
	, null as contact_person 
	, null as contact_address 
	, null as contact_number 
	, ST_AsGeoJSON(st_SetSrid(st_MakePoint(longitude, latitude), 4326))::json as geom
FROM "IBF-static-input"."UGA_redcross_branches";
;
--select * from "IBF-static-input".dashboard_redcross_branches

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
