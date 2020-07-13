--This script is not connected explicitly to the rest of the repository
--These views/functions are stored in Postgres and called from
--They are kept explicitly here in the repository for documentation 

--create view
drop view if exists "IBF-API"."Glofas_stations";
create or replace view "IBF-API"."Glofas_stations" as
select dfps.current_prev
		,dfps.lead_time
		,dgsv.station_code
		,dgsv.station_name
		,ST_AsGeoJSON(dgsv.geom)::json As geom
		,dgsv.trigger_level
	  , dfps.fc
      , dfps.fc_trigger
      , dfps.fc_perc
      , dfps.fc_prob
from "IBF-pipeline-output".dashboard_glofas_stations_v2 dgsv
left join "IBF-pipeline-output".dashboard_forecast_per_station dfps on dgsv.station_code = dfps.station_code
;
--select * from "IBF-API"."Glofas_stations"

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
