// Run this script with: node ./_generate-geoserver-layers.js <tiff-filename.tif>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Creates GeoServer layer structure and configuration files for a GeoTIFF file
 * @param {string} filename - The GeoTIFF filename (e.g., 'flood_extent_24-hour_ETH.tif')
 * @param {string} outputDir - Directory where the layer structure will be created
 */
function createGeoServerLayer(filename, outputDir = './') {
  // Extract the layer name from the filename (remove extension)
  const layerName = filename.replace(/\.tif$/, '');

  // Create main directory and subdirectory structure
  const mainDir = path.join(outputDir, layerName);
  const subDir = path.join(mainDir, layerName);

  console.log(`Creating directory structure for ${layerName}...`);

  // Create directories if they don't exist
  if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir, { recursive: true });
  }
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }

  // Generate IDs for coverage and store using a simple hash function
  const randomHex = () => crypto.randomBytes(4).toString('hex');
  const coverageId = `CoverageInfoImpl-${randomHex()}:${randomHex()}:-${Math.floor(Math.random() * 10000)}`;
  const storeId = `CoverageStoreInfoImpl-${randomHex()}:${randomHex()}:-${Math.floor(Math.random() * 10000)}`;
  const layerId = `LayerInfoImpl-${randomHex()}:${randomHex()}:-${Math.floor(Math.random() * 10000)}`;
  const styleId = 'StyleInfoImpl-671146cb:189bf732cb3:-7e1e'; // FILL IN: RIGHT STYLE ID
  const namespaceId = 'NamespaceInfoImpl-48cab08a:175ace47603:-7ffa'; // Constant across all Geoserver layers
  const workspaceId = 'WorkspaceInfoImpl-48cab08a:175ace47603:-7ffb'; // Constant across all Geoserver layers

  // Create coverage.xml
  // FILL IN once per new country/disaster-type: <nativeBoundingBox>, <latLonBoundingBox>, and potentially more (<transform>?)
  const coverageXml = `<coverage>
  <id>${coverageId}</id>
  <name>${layerName}</name>
  <nativeName>${layerName}</nativeName>
  <namespace>
    <id>${namespaceId}</id>
  </namespace>
  <title>${layerName}</title>
  <description>Generated from GeoTIFF</description>
  <keywords>
    <string>${layerName}</string>
    <string>WCS</string>
    <string>GeoTIFF</string>
  </keywords>
  <nativeCRS>GEOGCS[&quot;WGS 84&quot;, 
  DATUM[&quot;World Geodetic System 1984&quot;, 
    SPHEROID[&quot;WGS 84&quot;, 6378137.0, 298.257223563, AUTHORITY[&quot;EPSG&quot;,&quot;7030&quot;]], 
    AUTHORITY[&quot;EPSG&quot;,&quot;6326&quot;]], 
  PRIMEM[&quot;Greenwich&quot;, 0.0, AUTHORITY[&quot;EPSG&quot;,&quot;8901&quot;]], 
  UNIT[&quot;degree&quot;, 0.017453292519943295], 
  AXIS[&quot;Geodetic longitude&quot;, EAST], 
  AXIS[&quot;Geodetic latitude&quot;, NORTH], 
  AUTHORITY[&quot;EPSG&quot;,&quot;4326&quot;]]</nativeCRS>
  <srs>EPSG:4326</srs>
  <nativeBoundingBox>
    <minx>32.89944</minx>
    <maxx>47.81006</maxx>
    <miny>3.4028799999999997</miny>
    <maxy>15.0</maxy>
    <crs>EPSG:4326</crs>
  </nativeBoundingBox>
  <latLonBoundingBox>
    <minx>32.89944</minx>
    <maxx>47.81006</maxx>
    <miny>3.4028799999999997</miny>
    <maxy>15.0</maxy>
    <crs>EPSG:4326</crs>
  </latLonBoundingBox>
  <projectionPolicy>REPROJECT_TO_DECLARED</projectionPolicy>
  <enabled>true</enabled>
  <metadata>
    <entry key="DirectDownload.Key">
      <directDownloadSettings>
        <directDownloadEnabled>false</directDownloadEnabled>
        <maxDownloadSize>0</maxDownloadSize>
      </directDownloadSettings>
    </entry>
    <entry key="cachingEnabled">false</entry>
    <entry key="dirName">${layerName}_${layerName}</entry>
  </metadata>
  <store class="coverageStore">
    <id>${storeId}</id>
  </store>
  <serviceConfiguration>false</serviceConfiguration>
  <simpleConversionEnabled>false</simpleConversionEnabled>
  <internationalTitle />
  <internationalAbstract />
  <nativeFormat>GeoTIFF</nativeFormat>
  <grid dimension="2">
    <range>
      <low>0 0</low>
      <high>157 124</high>
    </range>
    <transform>
      <scaleX>0.09497210191082804</scaleX>
      <scaleY>-0.09352516129032258</scaleY>
      <shearX>0.0</shearX>
      <shearY>0.0</shearY>
      <translateX>32.94692605095541</translateX>
      <translateY>14.953237419354839</translateY>
    </transform>
    <crs>EPSG:4326</crs>
  </grid>
  <supportedFormats>
    <string>GEOTIFF</string>
    <string>GIF</string>
    <string>PNG</string>
    <string>JPEG</string>
    <string>TIFF</string>
  </supportedFormats>
  <interpolationMethods>
    <string>nearest neighbor</string>
    <string>bilinear</string>
    <string>bicubic</string>
  </interpolationMethods>
  <defaultInterpolationMethod>nearest neighbor</defaultInterpolationMethod>
  <dimensions>
    <coverageDimension>
      <name>GRAY_INDEX</name>
      <description>GridSampleDimension[-Infinity,Infinity]</description>
      <range>
        <min>-inf</min>
        <max>inf</max>
      </range>
      <dimensionType>
        <name>REAL_64BITS</name>
      </dimensionType>
    </coverageDimension>
  </dimensions>
  <requestSRS>
    <string>EPSG:4326</string>
  </requestSRS>
  <responseSRS>
    <string>EPSG:4326</string>
  </responseSRS>
  <parameters>
    <entry>
      <string>InputTransparentColor</string>
      <null />
    </entry>
    <entry>
      <string>SUGGESTED_TILE_SIZE</string>
      <string>512,512</string>
    </entry>
    <entry>
      <string>Bands</string>
      <null />
    </entry>
    <entry>
      <string>RescalePixels</string>
      <boolean>true</boolean>
    </entry>
  </parameters>
  <nativeCoverageName>${layerName}</nativeCoverageName>
</coverage>`;

  // Create layer.xml
  const layerXml = `<layer>
  <name>${layerName}</name>
  <id>${layerId}</id>
  <type>RASTER</type>
  <defaultStyle>
    <id>${styleId}</id>
  </defaultStyle>
  <resource class="coverage">
    <id>${coverageId}</id>
  </resource>
  <attribution>
    <logoWidth>0</logoWidth>
    <logoHeight>0</logoHeight>
  </attribution>
</layer>`;

  // Create coveragestore.xml
  const coverageStoreXml = `<coverageStore>
  <id>${storeId}</id>
  <name>${layerName}</name>
  <description>${layerName}</description>
  <type>GeoTIFF</type>
  <enabled>true</enabled>
  <workspace>
    <id>${workspaceId}</id>
  </workspace>
  <__default>false</__default>
  <url>file:workspaces/ibf-system/ibf-pipeline/output/flood_extents/${filename}</url>
</coverageStore>`;

  // Write files
  console.log('Writing GeoServer configuration files...');
  fs.writeFileSync(path.join(subDir, 'coverage.xml'), coverageXml);
  fs.writeFileSync(path.join(subDir, 'layer.xml'), layerXml);
  fs.writeFileSync(path.join(mainDir, 'coveragestore.xml'), coverageStoreXml);

  console.log(
    `Successfully created GeoServer layer configuration for ${layerName}`,
  );
}

/**
 * Process a list of GeoTIFF files and create GeoServer configurations
 * @param {string[]} files - List of GeoTIFF filenames
 * @param {string} outputDir - Output directory
 */
function processFiles(files, outputDir = './') {
  if (!Array.isArray(files) || files.length === 0) {
    console.error('No files provided!');
    return;
  }

  console.log(`Processing ${files.length} GeoTIFF files...`);

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.tif')) {
      console.warn(`Skipping non-TIF file: ${file}`);
      continue;
    }

    try {
      createGeoServerLayer(file, outputDir);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  console.log('All files processed successfully!');
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      'Usage: node generate-geoserver-layers.js <tiff-filename> [<tiff-filename2> ...] [--output=<output-dir>]',
    );
    process.exit(1);
  }

  let outputDir = './';
  const files = [];

  // Parse arguments
  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      outputDir = arg.substring(9);
    } else {
      files.push(arg);
    }
  }

  processFiles(files, outputDir);
}

module.exports = {
  createGeoServerLayer,
  processFiles,
};
