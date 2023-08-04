<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml">
  <UserLayer>
    <sld:LayerFeatureConstraints>
      <sld:FeatureTypeConstraint/>
    </sld:LayerFeatureConstraints>
    <sld:UserStyle>
      <sld:Name>depth</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Rule>
          <sld:RasterSymbolizer>
            <sld:ChannelSelection>
              <sld:GrayChannel>
                <sld:SourceChannelName>1</sld:SourceChannelName>
              </sld:GrayChannel>
            </sld:ChannelSelection>
            <sld:ColorMap type="ramp">
              <sld:ColorMapEntry label="0.1000" quantity="0.099975599999999998" color="#ffff00" opacity="0"/>
              <sld:ColorMapEntry label="0.7370" quantity="0.73697877200000006" color="#ffff00"/>
              <sld:ColorMapEntry label="1.3740" quantity="1.3739819440000003" color="#ffe200"/>
              <sld:ColorMapEntry label="2.0110" quantity="2.0109851160000001" color="#ffc500"/>
              <sld:ColorMapEntry label="2.6480" quantity="2.6479882880000005" color="#ffa900"/>
              <sld:ColorMapEntry label="3.2850" quantity="3.2849914600000005" color="#fc8c00"/>
              <sld:ColorMapEntry label="3.9220" quantity="3.9219946320000005" color="#f36f00"/>
              <sld:ColorMapEntry label="4.5100" quantity="4.5099975600000004" color="#e65113"/>
              <sld:ColorMapEntry label="5.0000" quantity="5" color="#d7301f"/>
            </sld:ColorMap>
          </sld:RasterSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </UserLayer>
</StyledLayerDescriptor>