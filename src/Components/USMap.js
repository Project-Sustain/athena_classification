import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {sample_response} from "../testing/sample_response";
import {mongoQuery} from "../Utils/Download.ts";
import {GeoJsonLayer} from "@deck.gl/layers";
import {Paper, CircularProgress, Box, Slider} from "@mui/material";
import {DataFilterExtension} from '@deck.gl/extensions';
import chroma from "chroma-js"

// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: -105.086559,
    latitude: 40.573733,
    zoom: 13,
    pitch: 30,
    bearing: 0
};

const thresholdRange = [0.1, 0.9];
const MS_PER_DAY = 8.64e7;
const maxThreshold = thresholdRange[1];


const dataFilter = new DataFilterExtension({
    filterSize: 1,
    // Enable for higher precision, e.g. 1 second granularity
    // See DataFilterExtension documentation for how to pick precision
    fp64: false
});

const response = sample_response;
const scale = chroma.scale(['yellow', '008ae5']).domain([0, 1]);

// DeckGL react component
export function USMap(props) {
    const [filter, setFilter] = useState(null);
    const [geoData, setGeoData] = useState({});
    const [loading, setLoading] = useState(true);
    const [clickInfo, setClickInfo] = useState({})
    const [sliderValue, setSliderValue] = useState(0.9);

    const filterValue = filter || thresholdRange;

    useEffect(() => {
        (async () => {
            const geoData = await mongoQuery("county_geo_30mb", [])
            if(geoData){
                // Change this below filtering logic when streaming in real response
                let filteredData = geoData.filter(x => Object.keys(response).includes(x['GISJOIN']))
                console.log({filteredData})
                setGeoData(filteredData)
            }
            else {
                console.log("API call failure, data unavailable");
            }
        })();
    }, []);

    useEffect(() => {
        setLoading(Object.keys(geoData).length === 0);
    }, [geoData]);


    const layers = [
        new GeoJsonLayer({
            id: 'geolayer',
            data: geoData,
            filled: true,
            getLineColor:[225, 21, 20, 100],
            getFillColor: d => colorByFilter(d['GISJOIN']),

            updateTriggers: {
                getFillColor: sliderValue
            },

            getFilterValue: d => d.threshold,
            filterRange: [filterValue[0], filterValue[1]],
            extensions: [new DataFilterExtension({filterSize: 3})],
            pickable: true,
            onClick: info => setClickInfo(info)})
    ]

    //The threshold is a fixed value, so just need to define that range statically.

    function getPrecisionRange(data){
        // TODO: Define function that find the min and max values of the data for precision
    }

    function getRecallRange(data){
        // TODO: Define function that find the min and max values of the data for recall
    }

    // Start with threshold
    function colorByFilter(gis_join){
        const sliderValueString = sliderValue.toString();
        const value = response[gis_join][sliderValueString]['precision'];
        return chroma(scale(value)).rgb();
    }

    if (loading) {
        return (
            <Box >
                <CircularProgress />
            </Box>
        );
    }
    else {
        return (
            <>
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={layers}>
                <StaticMap mapStyle={BASEMAP.POSITRON} />
            </DeckGL>
                <Box sx={{ width: 300 }}>
             <Slider
                    getAriaLabel={() => 'Threshold Range'}
                    valueLabelDisplay="auto"
                    getAriaValueText={setSliderValue}
                    step={0.1}
                    marks={true}
                    min={0.1}
                    max={0.9}
                />
                </Box>
            </>
        );
    }
}