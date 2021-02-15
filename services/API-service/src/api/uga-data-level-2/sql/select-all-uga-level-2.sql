SELECT
   pcode,
   name,
   (ST_AsGeoJSON(g.geom))::jsonb as geom,
   covidrisk 
FROM
   "IBF-static-input"."UGA_Geo_level2" g 
   inner join
      "IBF-static-input"."UGA_Data_level2" d 
      on g.pcode_level2 = d.pcode