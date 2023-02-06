import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {sample_response} from "../testing/sample_response";
import {full_response} from "../testing/full_response";
import {mongoQuery} from "../Utils/Download.ts";
import {GeoJsonLayer} from "@deck.gl/layers";
import {Paper, CircularProgress, Box, Slider, Switch, Typography, Stack, Button, ButtonGroup} from "@mui/material";
import { makeStyles } from "@material-ui/core"
import chroma from "chroma-js"
import kmeans from "../Components/Kmeans";

import {useColor} from "../Hooks/useColor.js";

// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: -100.086559,
    latitude: 45.573733,
    zoom: 3,
    pitch: 0,
    bearing: 0
};

// Constant variables
const response = full_response;
const thresholdValues = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9"];
const colorScale = chroma.scale(["red","ff595e","ffca3a","8ac926","1982c4","6a4c93"]).mode('lch').domain([0,1]);

const useStyles = makeStyles({
    root: {
        width: 340,
        zIndex: 5000,
        opacity: 0.9,
        padding: 40,
        position: "right"

    },
    paper: {
        padding: 15,
        width: "40vw",
        position: "absolute",
        top:"10px",
        right: "10px"
    }
});

// DeckGL react component
export function USMap(props) {
    const classes = useStyles();

    const [checked, setChecked] = useState(false);
    const [geoData, setGeoData] = useState({});
    const [loading, setLoading] = useState(true);
    const [clickInfo, setClickInfo] = useState({});
    const [sliderValue, setSliderValue] = useState(0.5);
    const [validationType, setValidationType] = useState("recall");
    const [displayedMetric, setDisplayedMetric] = useState("threshold");
    const [sliderValueMetric, setSliderValueMetric] = useState(0.5);

    const data = useColor(response);

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
            getLineColor:[250, 250, 250, 250],
            getFillColor: d => colorByFilter(d['GISJOIN']),

            updateTriggers: {
                getFillColor: [sliderValue, validationType, sliderValueMetric, displayedMetric]
            },
            pickable: true,
            onClick: info => setClickInfo(info)
        })
    ]

    function formatMetricName(name){
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const handleSliderChange = (event, newValue) => {
        setSliderValue(newValue);
    }

    const handleSliderChangeMetric = (event, newValue) => {
        setSliderValueMetric(newValue);
    }

    const onChangeSwitch = (event) => {
        setChecked(event.target.checked)
        const newValidationType = validationType === 'precision' ? 'recall' : 'precision';
        setValidationType(newValidationType)
    }

    function colorByFilter(gis_join){
        if (displayedMetric === 'threshold'){
            return colorByThreshold(gis_join);
        }
        else if(displayedMetric === 'cluster'){
            return colorByCluster(gis_join);
        }
        return colorByMetric(gis_join);

    }

    function colorByCluster(gis_join){
        let rgba = chroma(data.coloredRegions["colored_regions"][gis_join]).rgba();
        rgba[rgba.length - 1] = 225;
        return rgba;
    }

    function colorByThreshold(gis_join){
        const sliderValueString = sliderValue.toString();
        if (validationType === 'precision') {
            const value = response[gis_join][sliderValueString][validationType];
            let rgba = chroma(colorScale(value)).rgba();
            rgba[rgba.length - 1] = 225;
            return rgba;
        }
        else if(validationType === 'recall') {
            const value = response[gis_join][sliderValueString][validationType];
            let rgba = chroma(colorScale(value)).rgba();
            rgba[rgba.length - 1] = 225;
            return rgba;
        }
        return
    }

    function colorByMetric(gis_join){
        if (displayedMetric === 'precision') {
            for(let i = 0; i < thresholdValues.length; i++) {
                const value = response[gis_join][thresholdValues[i]]['precision'];
                if(value >= sliderValueMetric) {
                    return chroma(colorScale(parseFloat(thresholdValues[i]))).rgb();
                }
            }
        }
        else if(displayedMetric === 'recall'){
            for(let i = 0; i < thresholdValues.length; i++) {
                const value = response[gis_join][thresholdValues[i]]['recall'];
                if(value <= sliderValueMetric) {
                    return chroma(colorScale(parseFloat(thresholdValues[i]))).rgb();
                }
            }
        }
        return [0,0,0,0];
    }

    function displayThresholdSlider(){
        return (
            <>
                <Typography align='center'>Threshold: {sliderValue}</Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography>Recall</Typography>
                    <Switch
                        checked={checked}
                        onChange={onChangeSwitch}
                    />
                    <Typography>Precision</Typography>
                </Stack>
                <Slider
                    onChange={handleSliderChange}
                    value={sliderValue}
                    step={0.1}
                    marks={true}
                    min={0.1}
                    max={0.9}
                />
            </>
        );
    }

    function displayValidationSlider(){
        if(displayedMetric === "cluster"){
            return null;
        }
        else if(displayedMetric === "threshold"){
            return displayThresholdSlider();
        }
        else {
            return (
                <>
                    <Typography
                        align='center'>{formatMetricName(displayedMetric)}: {sliderValueMetric.toFixed(2)}</Typography>
                    <Slider
                        onChange={handleSliderChangeMetric}
                        value={sliderValueMetric}
                        step={0.05}
                        min={0.0}
                        max={1.0}
                    />
                </>
            );
        }
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
                <Paper elevation={3} className={classes.paper} >
                    <Stack direction='column' justifyContent='center' alignItems='center'>
                        {displayValidationSlider()}
                        <ButtonGroup variant="contained" aria-label="outlined primary button group">
                            <Button onClick={() => { setDisplayedMetric("threshold") }} >Threshold</Button>
                            <Button onClick={() => { setDisplayedMetric("precision") }} >Precision</Button>
                            <Button onClick={() => { setDisplayedMetric("recall") }} >Recall</Button>
                            <Button onClick={() => { setDisplayedMetric("cluster") }} >Cluster</Button>
                        </ButtonGroup>
                    </Stack>
                </Paper>
            </div>
            </>
        );
    }
}