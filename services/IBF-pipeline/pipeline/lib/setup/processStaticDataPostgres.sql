DROP TABLE IF EXISTS zmb_fbf.dashboard_glofas_stations_v2;
SELECT station_code
	, station_name
	, "10yr_threshold" as trigger_level
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
INTO zmb_fbf.dashboard_glofas_stations_v2
FROM zmb_fbf.glofas_stations
;
DROP TABLE IF EXISTS zmb_fbf.dashboard_redcross_branches;
SELECT  "BRANCH" branch_name
	, "PROVINCE" province
	, "PRESIDENT" president
	, "TOTAL" as nr_volunteers
	, "LOCATION OF OFFICE" as address
			,st_SetSrid(st_MakePoint(lat, lon), 4326) as geom
INTO zmb_fbf.dashboard_redcross_branches
FROM zmb_fbf.redcross_branches
;

DROP TABLE IF EXISTS zmb_fbf.dashboard_poi_healthsites;
SELECT name
			,type
			,st_SetSrid(st_MakePoint("Y", "X"), 4326) as geom
INTO zmb_fbf.dashboard_poi_healthsites
FROM zmb_fbf.healthsites;

DROP TABLE IF EXISTS zmb_fbf.dashboard_poi_waterpoints;
SELECT water_tech
	,activity_id
			,st_SetSrid(st_MakePoint(lat_deg, lon_deg), 4326) as geom
INTO zmb_fbf.dashboard_poi_waterpoints
FROM zmb_fbf.waterpoints
;

DROP TABLE IF EXISTS zmb_fbf.dashboard_roads;
SELECT row_to_json(featcoll) as roads
into zmb_fbf.dashboard_roads
FROM (
	SELECT 'FeatureCollection' As type, array_to_json(array_agg(feat)) As features
	FROM (
		SELECT 'Feature' As type
			,ST_AsGeoJSON(tbl.geom)::json As geometry
			,row_to_json((SELECT l FROM (SELECT tbl.highway) As l)) As properties
		FROM zmb_fbf.hotosm_zmb_roads_lines_mapshaper As tbL
		WHERE highway in ('primary','secondary','tertiary')
		)  As feat 
	)  As featcoll
;


DROP FUNCTION IF EXISTS usp_fbf_geodata(varchar,varchar);
CREATE OR REPLACE FUNCTION usp_fbf_geodata(country varchar, table_name varchar, OUT result json) AS $func$
	BEGIN
	EXECUTE format('
		SELECT row_to_json(featcoll)
		FROM (
			SELECT ''FeatureCollection'' As type, array_to_json(array_agg(feat)) As features
			FROM (
				SELECT ''Feature'' As type
					,ST_AsGeoJSON(tbl.geom)::json As geometry
					,row_to_json((SELECT l FROM (SELECT tbl.*) As l)) As properties
				FROM %s_fbf.%s As tbL
				)  As feat 
			)  As featcoll
		;',country,table_name)
	INTO result;
	END
$func$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS usp_fbf_data(varchar, varchar);
CREATE OR REPLACE FUNCTION usp_fbf_data(country varchar, table_name varchar, OUT result json) AS $func$
	BEGIN
	EXECUTE format('select array_to_json(array_agg(tbl))
			from (
			select *
			from "%s_fbf".%s
			) tbl;',country,table_name)
	INTO result;
	END
$func$ LANGUAGE plpgsql;
