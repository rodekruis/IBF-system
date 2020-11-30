<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld
http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd" version="1.0.0">
  <NamedLayer>
    <Name>ESA</Name>
    <UserStyle>
      <Title>A raster style</Title>
       <FeatureTypeStyle>
         <Rule>
           <RasterSymbolizer>
             <Opacity>0.5</Opacity>
             <ColorMap>
               <ColorMapEntry color="#000000" quantity="0" opacity="0"/>
               <ColorMapEntry color="#DCF064" quantity="1" label="Cropland" />
             </ColorMap>
             <ImageOutline>
              <LineSymbolizer>
              <Stroke>
                              <CssParameter name="stroke">#0000ff</CssParameter>
              </Stroke>
              </LineSymbolizer>
			</ImageOutline>
           </RasterSymbolizer>
         </Rule>
       </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>