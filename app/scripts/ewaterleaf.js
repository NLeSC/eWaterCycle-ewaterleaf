/* global d3 */
/* global L */
/* global ncwmsURL */
/* exported eWaterLeaf */
var eWaterLeaf = (function() {
    'use strict';

    // ncwmsLocation = 'http://s37n7.elvis.surfsara.nl:5900/ncWMS/wms';
    // ncwmsLocation = 'ncWMS/wms';
    // ncwmsLocation = 'http://localhost:8080/ncWMS/wms';

    var ncwmsLocation = ncwmsURL;
    var layerCollection = null;
    var layerController = null;
    var map = null;
    var availableTimes = [];
    var timeSlider = null;
    var timeLabel = null;

    function initialize() {
        console.log(ncwmsLocation);

        layerCollection = L.layerGroup();

        map = L.map('mapcontainer').setView([ 52.27158, 4.83156 ], 1);

        var loadingControl = L.Control.loading({
            separate : true
        });

        map.addControl(loadingControl);

        addOSMLayer();

        addLegend();

        layerController = L.control.layers();

        layerController.addTo(map);

        addOpacitySlider();

        addTimeSlider();

        addTimeLabel();

        map.fireEvent('dataloading');
        var metadataURL = ncwmsLocation + '?item=menu&menu=&request=GetMetadata';
        d3.json(metadataURL, loadLayers);

        map.fireEvent('dataloading');
        d3.json('ne_10m_admin_0_countries.geojson', loadCountries);

    }

    function addOSMLayer() {
        // tile template
        var urlTemplate = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        //var urlTemplate = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

        
        var options = {
            attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        };

        // create an OpenStreetMap tile layer
        var osmLayer = L.tileLayer(urlTemplate, options);

        osmLayer.addTo(map);
    }

    function addTimeSlider() {
        timeSlider = L.control({
            position : 'bottomleft'
        });

        timeSlider.onAdd = function() {
            this._div = L.DomUtil.create('div', 'info'); // create a div with
            // a
            // class "info"
            updateTimeSlider();
            L.DomEvent.disableClickPropagation(this._div);
            return this._div;
        };

        timeSlider.addTo(map);

        map
                .on(
                        'baselayerchange',
                        function(e) {
                            map.fireEvent('dataloading');
                            var metadataurl = ncwmsLocation + '?item=layerDetails&request=GetMetadata&layerName=' + e.name;
                            d3.json(metadataurl, readLayerTimeData);
                        });
    }

    function addOpacitySlider() {
        var opacitySlider = L.control({
            position : 'bottomleft'
        });

        opacitySlider.onAdd = function() {
            var div = L.DomUtil.create('div', 'info'); // create a div with a
            // class
            // "info"
            div.innerHTML = '<h4>Opacity</h4><input id="slide" type="range" min="0" max="1" step="0.1" value="0.5" onchange="eWaterLeaf.updateOpacity(this.value)" oninput="eWaterLeaf.updateOpacity(this.value)"</input>';
            L.DomEvent.disableClickPropagation(div);
            return div;
        };

        opacitySlider.addTo(map);
    }

    function addLegend() {
        var legend = L.control({
            position : 'bottomright'
        });

        legend.onAdd = function() {
            this._div = L.DomUtil.create('div', 'legend'); // create a div with
            // a
            // class "info" and
            // "legend"
            return this._div;
        };

        legend.update = function(name) {
            // this._div.innerHTML = '<h4>' + name + '</h4><img src="' +
            // ncwmsLocation +
            // '?request=GetLegendGraphic&colorbaronly=true&layer=' + name +
            // '"/>';
            this._div.innerHTML = '<img src="' + eWaterLeaf.ncwmsLocation + '?request=GetLegendGraphic&layer=' + name + '"/>';

        };

        legend.addTo(map);

        map.on('baselayerchange', function(e) {
            legend.update(e.name);
        });

    }

    function addTimeLabel() {
        timeLabel = L.control({
            position : 'bottomleft'
        });

        timeLabel.onAdd = function() {
            this._div = L.DomUtil.create('div', 'label');
            this._div.innerHTML = '<h4></h4>';
            return this._div;
        };

        // method that we will use to update the control based on feature
        // properties
        // passed
        timeLabel.update = function(currentTime) {
            this._div.innerHTML = '<h4>' + currentTime.toDateString() + '</h4>';
        };

        timeLabel.addTo(map);
    }

    function readLayerTimeData(error, metadata) {
        //console.log("readLayerTimeData");
        //console.log(metadata);
        //console.log(error);

        if (error !== null) {
            if (error.status !== 0) {
                window
                        .alert('failed to load time data from ' + ncwmsLocation + ', error reported was ' + error.status + ':' + error.statusText);
            } else {
                window.alert('failed to load time data from ' + ncwmsLocation);
            }
        } else {
            var years = metadata.datesWithData;

            availableTimes = [];

            for ( var year in years) {
                for ( var month in years[year]) {
                    for (var i = 0; i < years[year][month].length; i++) {

                        var validDate = new Date(Date.UTC(year, month,
                                years[year][month][i], 0, 0, 0));

                        // console.log(validDate);
                        availableTimes.push(validDate);
                    }
                }
            }

            updateTimeSlider();

            updateCurrentTime('0');

        }
        map.fireEvent('dataload');
    }

    function updateTimeSlider() {
        timeSlider._div.innerHTML = '<h4>Time</h4><input id="slide" type="range" min="0" max="' + availableTimes.length + '" step="1" value="0" onchange="eWaterLeaf.updateCurrentTime(this.value)" oninput="eWaterLeaf.updateTimeInfo(this.value)"</input>';
    }

    // update the time info field
    function updateTimeInfo(currentTimeIndex) {
        timeLabel.update(availableTimes[currentTimeIndex]);
    }

    // update the time info field as well as the time set in each layer
    function updateCurrentTime(currentTimeIndex) {
        timeLabel.update(availableTimes[currentTimeIndex]);

        // console.log('setting time to' + availableTimes[currentTimeIndex]);
        layerCollection.eachLayer(function(layer) {
            layer.setParams({
                time : availableTimes[currentTimeIndex].toISOString()
            });
        });
    }

    function loadCountries(error, countries) {
        //console.log("Load countries:");
        //console.log(map);
        //console.log(countries);

        if (error !== null) {
            if (error.status !== 0) {
                window
                        .alert('failed to load country borders from ' + ncwmsLocation + ', error reported was ' + error.status + ':' + error.statusText);
            } else {
                window
                        .alert('failed to load country borders from ' + ncwmsLocation);
            }
            map.fireEvent('dataload');
            return;
        }

        var dashedStyle = {
            'weight' : 2,
            'opacity' : 1,
            'color' : 'white',
            'dashArray' : '3',
            'fillOpacity' : 0.0
        };

        var borders = L.geoJson(countries, {
            style : dashedStyle
        });

        layerController.addOverlay(borders, 'country borders');

        map.fireEvent('dataload');
    }

    function updateOpacity(opacity) {
        // console.log(opacity);

        layerCollection.eachLayer(function(layer) {
            layer.setOpacity(opacity);
        });

    }

    function loadLayers(error, serverMetaData) {
        //console.log("Load layers:");
        //console.log(map);
        //console.log(serverMetaData);

        if (error !== null) {
            // debugger;
            if (error.status !== 0) {
                window
                        .alert('failed to load metadata from ' + ncwmsLocation + ', error reported was ' + error.status + ':' + error.statusText);
            } else {
                window.alert('failed to load metadata from ' + ncwmsLocation);
            }
            map.fireEvent('dataload');
            return;
        }

        // debugger;

        serverMetaData.children.forEach(addDataset);

        map.fireEvent('dataload');
    }

    function addDataset(dataset) {

        dataset.children.forEach(addLayer);
    }

    function addLayer(layerMetaData) {

        var variableID = layerMetaData.id;
        // var variableLabel = layerMetaData.label

        var mywms = L.tileLayer.wms(ncwmsLocation, {
            layers : variableID,
            format : 'image/png',
            transparent : true,
            version : '1.1.1',
            attribution : 'eWaterCycle Project',
            abovemaxcolor : 'extend',
            belowmincolor : 'extend',
        });

        mywms.setOpacity(0.5);

        // mywms.addTo(map);

        layerController.addBaseLayer(mywms, variableID);

        layerCollection.addLayer(mywms);

    }

    // return exported functions and variables
    return {
        initialize : initialize,
        ncwmsLocation : ncwmsLocation,
        updateTimeInfo : updateTimeInfo,
        updateCurrentTime : updateCurrentTime,
        updateOpacity : updateOpacity
    };
}());
