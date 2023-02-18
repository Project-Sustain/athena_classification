import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import chroma from "chroma-js";
import { makeStyles } from "@material-ui/core";
import {featureMetaData} from "../Constants/FeatureMetaData.js";
import {CustomCheckbox} from "../Components/CustomCheckbox";

const useStyles = makeStyles({
    paper: {
        width: "19vw",
        maxWidth: "19vw",
        maxHeight: "30vh",
        overflow: "auto",
        position: "absolute",
        top:"10px",
        left: "10px",
        padding: 15,
    }
});


export function KmeansFeatureSelection() {
    const classes = useStyles();


    return (
        <div>
            <Paper className={classes.paper} elevation={3}>
                Feature Selection
                {featureMetaData.map((item, i) => {
                    return (
                        <CustomCheckbox index={i} label={item}/>
                    )
                })}
            </Paper>
        </div>
    );
}