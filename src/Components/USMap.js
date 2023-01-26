import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {sample_response} from "../testing/sample_response";
import {mongoQuery} from "../Utils/Download.ts";
import {GeoJsonLayer} from "@deck.gl/layers";
import {Paper, CircularProgress, Box, Slider, Switch, Typography} from "@mui/material";
import { makeStyles } from "@material-ui/core"
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


const useStyles = makeStyles({
    root: {
        width: 340,
        zIndex: 5000,
        opacity: 0.9,
        padding: 15,
    }
});


const dataFilter = new DataFilterExtension({
    filterSize: 1,
    // Enable for higher precision, e.g. 1 second granularity
    // See DataFilterExtension documentation for how to pick precision
    fp64: false
});

const response = sample_response;
const precisionScale = chroma.scale(['yellow', '008ae5']).domain([0, 1]);
const recallScale = chroma.scale(['red', 'black']).domain([0, 1]);


// DeckGL react component
export function USMap(props) {
    const classes = useStyles();


    const [checked, setChecked] = useState(false);
    const [filter, setFilter] = useState(null);
    const [geoData, setGeoData] = useState({});
    const [loading, setLoading] = useState(true);
    const [clickInfo, setClickInfo] = useState({})
    const [sliderValue, setSliderValue] = useState(0.9);
    const [validationType, setValidationType] = useState("precision")

    const filterValue = filter || thresholdRange;

    useEffect(() => {
        (async () => {
            const geoData = await mongoQuery("county_geo_30mb", [])
            if(geoData){
                // TODO: Change this below filtering logic when streaming in real response
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
                getFillColor: [sliderValue, validationType]
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

    const onChangeSwitch = (event) => {
        setChecked(event.target.checked)
        console.log("Inside change switch")
        let newValidationType = 'precision'

        console.log(validationType)
        if (validationType === 'precision') {
            console.log('made it here')
           newValidationType = 'recall'
        }
        setValidationType(newValidationType)
    }

    function colorByFilter(gis_join){
        const sliderValueString = sliderValue.toString();
        if (validationType === 'precision') {
            const value = response[gis_join][sliderValueString][validationType];
            return chroma(precisionScale(value)).rgb()
        }
        else{
            const value = response[gis_join][sliderValueString][validationType];
            return chroma(recallScale(value)).rgb()
        }
        return
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
            <div className={classes.root}>
                <Paper elevation={3} >
                    <Typography>Precision</Typography>
                    <Switch>
                        checked={checked}
                        onChange={onChangeSwitch}
                    </Switch>
                    <Typography>Recall</Typography>
                    <Slider
                            getAriaLabel={() => 'Threshold Range'}
                            valueLabelDisplay="auto"
                            getAriaValueText={setSliderValue}
                            step={0.1}
                            marks={true}
                            min={0.1}
                            max={0.9}
                     />
                </Paper>
            </div>
            </>
        );
    }
}