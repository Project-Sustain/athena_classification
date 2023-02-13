import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import chroma from "chroma-js";
import { makeStyles } from "@material-ui/core"
import {featureMetaData} from "../Constants/FeatureMetaData.js";

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

const defaultFeatures = [[true, false],[true,true], [false, true], [true, false], [false, false], [true, true], [false, false], [false, false],[false, false],[false, false]];

export function KmeansFeatureSelection() {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultFeatures);

    console.log({checked})

    const handleChange1 = (event, i) => {
        console.log("Reading checked: " + checked)
        let tempChecked = checked;
        tempChecked[i] = [event.target.checked, event.target.checked];
        setChecked(tempChecked);
    };

    const handleChange2 = (event, i) => {
        let tempChecked = checked;
        tempChecked[i] = [event.target.checked, checked[i][1]];
        setChecked(tempChecked);
    };

    const handleChange3 = (event, i) => {
        let tempChecked = checked;
        tempChecked[i] = [checked[i][0], event.target.checked];
        setChecked(tempChecked);
    };

    const children = (index) => {
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', ml: 3}}>
                <FormControlLabel
                    label="Precision"
                    control={<Checkbox checked={checked[index][0]} onChange={handleChange2(index)}/>}
                />
                <FormControlLabel
                    label="Recall"
                    control={<Checkbox checked={checked[index][1]} onChange={handleChange3(index)}/>}
                />
            </Box>
        );
    };

    return (
        <div>
            <Paper className={classes.paper} elevation={3}>
                Feature Selection
                {featureMetaData.map((item, i) => {
                    return (
                        <div key={i}>
                            <FormControlLabel
                                label={item}
                                control={
                                    <Checkbox
                                        checked={checked[i][0] && checked[i][1]}
                                        indeterminate={checked[i][0] !== checked[i][1]}
                                        onChange={handleChange1(i)}
                                    />
                                }
                            />
                            {children(i)}
                        </div>
                    )
                })}
            </Paper>
        </div>
    );
}