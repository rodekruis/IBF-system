DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_glofas_stations_v2 CASCADE;
SELECT station_code
	, station_name
	, "10yr_threshold" as trigger_level
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
INTO "IBF-pipeline-output".dashboard_glofas_stations_v2
FROM "IBF-pipeline-output".glofas_stations
;
DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_redcross_branches CASCADE;
SELECT  "BRANCH" branch_name
	, "PROVINCE" province
	, "PRESIDENT" president
	, "TOTAL" as nr_volunteers
	, "LOCATION OF OFFICE" as address
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
INTO "IBF-pipeline-output".dashboard_redcross_branches
FROM "IBF-pipeline-output".redcross_branches
;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_poi_healthsites CASCADE;
SELECT name
			,type
			,st_SetSrid(st_MakePoint("Y", "X"), 4326) as geom
INTO "IBF-pipeline-output".dashboard_poi_healthsites
FROM "IBF-pipeline-output".healthsites;

DROP TABLE IF EXISTS "IBF-pipeline-output".dashboard_poi_waterpoints CASCADE;
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
