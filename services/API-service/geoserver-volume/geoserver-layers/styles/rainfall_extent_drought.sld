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
             <ColorMap type="intervals" extended="true">
               <ColorMapEntry color="#000000" quantity="10" opacity="0"/>
               <ColorMapEntry color="#ffff7f" quantity="10" />
               <ColorMapEntry color="#ffe200" quantity="20" />
               <ColorMapEntry color="#ffaa00" quantity="30" />
               <ColorMapEntry color="#ff8d00" quantity="40" />
               <ColorMapEntry color="#ff7100" quantity="50" />
               <ColorMapEntry color="#ff3800" quantity="60" />
               <ColorMapEntry color="#ff0000" quantity="1000" />
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