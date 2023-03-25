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
import {useData} from "../Hooks/useData.js";
import {ColorLegend} from "../Components/ColorLegend";
import {KmeansFeatureSelection} from "../Components/KmeansFeatureSelection";


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
        width: "33vw",
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
    const [isData, setIsData] = useState(false);
    const {data, dataManagement} = useData({geoData, setGeoData, setIsData});
    const [loading, setLoading] = useState(true);
    const [clickInfo, setClickInfo] = useState({});
    const [currentTab, setCurrentTab] = useState(0);
    const {colorData, colorManagement} = useColor(data.response);

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
            onClick: info => colorManagement.setClickedRegion(info)
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

    const tabSelection = (index, filterName) => {
        setCurrentTab(index);
        colorManagement.setDisplayedMetric(filterName);
    } 
    const getButtonVariant = (index) => {
        return currentTab === index ? 'contained' : 'outlined';
    }

    function formatMetricName(name){
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function displayThresholdSlider(){
        return (
            <>
                <Typography align='center'><strong>Threshold:</strong> {colorData.sliderValue}</Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='subtitle2'>Recall</Typography>
                    <Switch
                        checked={checked}
                        onChange={onChangeSwitch}
                    />
                    <Typography variant='subtitle2'>Precision</Typography>
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
                        align='center'><strong>{formatMetricName(colorData.displayedMetric)}:</strong> {colorData.sliderValueMetric.toFixed(2)}</Typography>
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
    function displayRequestOrMetrics(){
        if(!isData){
            return (
                <>
                    <ButtonGroup fullWidth>
                        <Button component="label">Upload a file<input type="file" hidden onChange={dataManagement.handleFileSubmission}/></Button>
                        <Button onClick={() => dataManagement.sendRequest()}>Validate Model</Button>
                    </ButtonGroup>
                </>
            );
        }
        else{
            return (
                <>
                    {displayValidationSlider()}
                    <ButtonGroup fullWidth>
                        <Button onClick={() => { tabSelection(0, "threshold") }} variant={getButtonVariant(0)}>Threshold</Button>
                        <Button onClick={() => { tabSelection(1, "precision") }} variant={getButtonVariant(1)} >Precision</Button>
                        <Button onClick={() => { tabSelection(2, "recall") }} variant={getButtonVariant(2)}>Recall</Button>
                        <Button onClick={() => { tabSelection(3, "cluster") }} variant={getButtonVariant(3)}>Cluster</Button>
                    </ButtonGroup>
                </>
            );
        }
    }

    function displayLegendOrFeatureSelection() {
        if (colorData.displayedMetric === "cluster") {
            return <KmeansFeatureSelection coloringRequest={colorManagement.coloringRequest}/>;
        }
        else {
            return (
                <ColorLegend displayedMetric={formatMetricName(colorData.displayedMetric)}
                         validationType={colorData.validationType}/>
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
                        {displayRequestOrMetrics()}
                    </Stack>
                </Paper>
                {displayLegendOrFeatureSelection()}
            </div>
            </>
        );
    }
}