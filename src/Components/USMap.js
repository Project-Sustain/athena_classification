import React, {useEffect, useState} from 'react';
import { makeStyles } from "@material-ui/core"
import {Paper, CircularProgress, Box, Slider, Switch, Typography, Stack, Button, ButtonGroup} from "@mui/material";
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {GeoJsonLayer} from "@deck.gl/layers";
import {sample_response} from "../testing/sample_response";
import {full_response} from "../testing/full_response";
import {mongoQuery} from "../Utils/Download.ts";
import {useColor} from "../Hooks/useColor.js";
import {ColorLegend} from "../Components/ColorLegend"

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
    const {colorData, colorManagement} = useColor(response);

    useEffect(() => {
        (async () => {
            const geoData = await mongoQuery("county_geo_30mb", [])
            if(geoData){
                // TODO: Change this below filtering logic when streaming in real response
                console.log({geoData})
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
            getFillColor: d => colorManagement.colorByFilter(d['GISJOIN']),

            updateTriggers: {
                getFillColor: colorData.coloringTriggers
            },
            pickable: true,
            onClick: info => setClickInfo(info)
        })
    ]

    const handleSliderChange = (event, newValue) => {
        colorManagement.setSliderValue(newValue);
    }

    const handleSliderChangeMetric = (event, newValue) => {
        colorManagement.setSliderValueMetric(newValue);
    }

    const onChangeSwitch = (event) => {
        setChecked(event.target.checked);
        const newValidationType = colorData.validationType === 'precision' ? 'recall' : 'precision';
        colorManagement.setValidationType(newValidationType);
    }

    function formatMetricName(name){
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function displayThresholdSlider(){
        return (
            <>
                <Typography align='center'>Threshold: {colorData.sliderValue}</Typography>
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
                    value={colorData.sliderValue}
                    step={0.1}
                    marks={true}
                    min={0.1}
                    max={0.9}
                />
            </>
        );
    }

    function displayValidationSlider(){
        if(colorData.displayedMetric === "cluster"){
            return null;
        }
        else if(colorData.displayedMetric === "threshold"){
            return displayThresholdSlider();
        }
        else {
            return (
                <>
                    <Typography
                        align='center'>{formatMetricName(colorData.displayedMetric)}: {colorData.sliderValueMetric.toFixed(2)}</Typography>
                    <Slider
                        onChange={handleSliderChangeMetric}
                        value={colorData.sliderValueMetric}
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
                            <Button onClick={() => { colorManagement.setDisplayedMetric("threshold") }} >Threshold</Button>
                            <Button onClick={() => { colorManagement.setDisplayedMetric("precision") }} >Precision</Button>
                            <Button onClick={() => { colorManagement.setDisplayedMetric("recall") }} >Recall</Button>
                            <Button onClick={() => { colorManagement.setDisplayedMetric("cluster") }} >Cluster</Button>
                        </ButtonGroup>
                    </Stack>
                </Paper>
                <ColorLegend displayedMetric={formatMetricName(colorData.displayedMetric)}/>
            </div>
            </>
        );
    }
}