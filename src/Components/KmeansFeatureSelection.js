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

export function KmeansFeatureSelection() {
    const classes = useStyles();
    const [checked, setChecked] = useState([true, false]);

    const handleChange1 = (event) => {
        setChecked([event.target.checked, event.target.checked]);
    };

    const handleChange2 = (event) => {
        setChecked([event.target.checked, checked[1]]);
    };

    const handleChange3 = (event) => {
        setChecked([checked[0], event.target.checked]);
    };

    const children = (index) => {
        if(index === 0){
            return null;
        }
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', ml: 3}}>
                <FormControlLabel
                    label="Precision"
                    control={<Checkbox checked={checked[0]} onChange={handleChange2}/>}
                />
                <FormControlLabel
                    label="Recall"
                    control={<Checkbox checked={checked[1]} onChange={handleChange3}/>}
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
                                        checked={checked[0] && checked[1]}
                                        indeterminate={checked[0] !== checked[1]}
                                        onChange={handleChange1}
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