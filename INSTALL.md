;Installation
============


### Aquiring ncWMS

eWaterLeaf depends on [ncWMS](http://www.resc.rdg.ac.uk/trac/ncWMS/). Instruction on how to install ncWMS can be found [at the ncWMS project site](http://www.resc.rdg.ac.uk/trac/ncWMS/wiki/DownloadPage) or for a more step-by-step installation see [here](http://hdfeos.org/software/ncwms.php).

eWaterLeaf will work just fine with the stable version of ncWMS (at the time of writing version 1.1.1). It can also make use of the ABOVEMAXCOLOR and BELOWMINCOLOR features of ncWMS, only found in the svn version of ncWMS. A pre-compiled version of ncWMS (svn revision 1069) is included in the ncwms folder of this project. This custom version also includes about 20 additional color maps sourced from the eSalsa viewer.

In the end, ncWMS should be available at some address, e.g. www.mydomain.org/ncWMS.

### Natural Earth Country Border

The country borders in eWaterLeaf are taken from the [Natural Earth Project] (http://www.naturalearthdata.com/), more specifically the "1:10m Cultural Vectors Admin 0 - Countries" set. These can be converted to the geojson used in eWaterLeaf with gdal:


```
        ogr2ogr -f GeoJSON -t_srs crs:84 ne_10m_admin_0_countries.geojson ne_10m_admin_0_countries.shp
```

### Deploying eWaterLeaf

This project uses [Yeoman](http://yeoman.io/). All sources for eWaterLeaf are located in the app folder of this project. Building can be done using 'grunt', but requires the installation of Yeoman and related tools. There is also a precompiled dist included as "YYY-MM-DD-dist.zip"

Do deploy copy the contect of the 'dist' folder/zipfile to a folder hosted by your webserver, for instance the default "ROOT" webapp included with a fresh Tomcat installation.

### Configuring eWaterLeaf



### Cross Origin Resource Sharing (CORS)

By default, most webservers (rightfully) refuse to serve Javascript if it makes requests across domain boundries. If you deploy eWaterLeaf on a different server from ncWMS, you will probably have to configure "Cross Origin Resource Sharing" or CORS, on your server.

For an discription how to do this for your server see here: http://enable-cors.org/server.html

#### CORS on Tomcat 7

For Tomcat 7, enabling CORS is a matter of adding a CORS filter to the web.xml configuration file:

```
        <filter>
          <filter-name>CorsFilter</filter-name>
          <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
        </filter>
        <filter-mapping>
          <filter-name>CorsFilter</filter-name>
          <url-pattern>/*</url-pattern>
        </filter-mapping>
```

NOTE: this will enable CORS for _all_ sources. You may want to limit it to the location of your eWaterLeaf server instead. See [the Tomcat 7 documentation](http://tomcat.apache.org/tomcat-7.0-doc/config/filter.html#CORS_Filter) for more information.

#### CORS on Tomcat 6

CORS on Tomcat 6 requires the filter to be installed as well as configured, see [here](http://software.dzhuvinov.com/cors-filter-installation.html).
