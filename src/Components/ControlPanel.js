import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {sample_response} from "../testing/sample_response";
import {mongoQuery} from "../Utils/Download.ts";
import {GeoJsonLayer} from "@deck.gl/layers";
import {Paper, CircularProgress, Box, Slider, Switch, Typography, Stack} from "@mui/material";
import { makeStyles } from "@material-ui/core"
import {DataFilterExtension} from '@deck.gl/extensions';
import chroma from "chroma-js"


const useStyles = makeStyles({
    root: {
        width: 340,
        zIndex: 5000,
        opacity: 0.9,
        padding: 15,
    },
    paper: {
        padding: 15
    }
});



const thresholdRange = [0.1, 0.9];
const maxThreshold = thresholdRange[1];


const precisionScale = chroma.scale(['yellow', '008ae5']).domain([0, 1]);
const recallScale = chroma.scale(['red', 'black']).domain([0, 1]);

export default function ControlPanel {

    const [sliderValue, setSliderValue] = useState(0.9);
    const [validationType, setValidationType] = useState("recall")

    return (
        <div className={classes.root}>
            <Paper elevation={3} className={classes.paper}>
                <Stack direction='column' justifyContent='center' alignItems='center'>
                    <Typography align='center'>Threshold: {sliderValue}</Typography>
                    <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography>Precision</Typography>
                        <Switch
                            checked={checked}
                            onChange={onChangeSwitch}
                        />
                        <Typography>Recall</Typography>
                    </Stack>
                    <Slider
                        onChange={handleSliderChange}
                        value={sliderValue}
                        step={0.1}
                        marks={true}
                        min={0.1}
                        max={0.9}
                    />
                </Stack>
            </Paper>
        </div>
    );
}