<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
    xmlns="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <!-- a named layer is the basic building block of an sld document -->

  <NamedLayer>
    <Name>Default Polygon</Name>
    <UserStyle>
        <!-- they have names, titles and abstracts -->

      <Title>Grey Polygon</Title>
      <Abstract>A sample style that just prints out a grey interior with a black outline</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->
      <!-- a feature type for polygons -->

      <FeatureTypeStyle>
        <!--FeatureTypeName>Feature</FeatureTypeName-->
        <Rule>
          <Name>Exposed</Name>
          <Title>Exposed</Title>

          <!-- like a linesymbolizer but with a fill too -->
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#0096FF</CssParameter>
              <CssParameter name="fill-opacity">1</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#0096FF</CssParameter>
              <CssParameter name="stroke-width">0.1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>