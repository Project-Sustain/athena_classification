import React, {useEffect, useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import chroma from "chroma-js";
import { makeStyles } from "@material-ui/core"

const rangeValues = {
    PrecisionRecall: [" < 0.1" ,"0.1 - 0.2", "0.2 - 0.3", "0.3 - 0.4", "0.4 - 0.5", "0.5 - 0.6", "0.6 - 0.7", "0.7 - 0.8", "0.8 - 0.9", "> 0.9"],
    thresholdValues: ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9"]
}

const colorValues = chroma.scale(["red","ff595e","ffca3a","8ac926","1982c4","6a4c93"]).mode('lch').colors(10);

const useStyles = makeStyles({
    paper: {
        width: "15vw",
        maxWidth: "15vw",
        position: "absolute",
        top:"10px",
        left: "10px"
    },
    leftCell: {
        width: '60%'
    },
    rightCell: {
        width: '40%'
    }
});

export function ColorLegend({displayedMetric, validationType}) {
    console.log({displayedMetric})

    const classes = useStyles();
    const [tableValues, setTableValues] = useState(rangeValues.PrecisionRecall);
    const [visualizedMetric, setVisualizedMetric] = useState("Precision");

    console.log({tableValues})

    useEffect(() => {
        if(displayedMetric === 'Threshold'){
            console.log("setting to precision")
            setTableValues(rangeValues.PrecisionRecall);
        }
        else{
            console.log("setting to threshold")
            setTableValues(rangeValues.thresholdValues);
        }
    }, [displayedMetric]);

    useEffect(() => {
        if(displayedMetric === "Precision" || displayedMetric === "Recall"){
            setVisualizedMetric("Threshold");
        }
        else if(validationType === "precision"){
            setVisualizedMetric("Precision");
        }
        else if(validationType === "recall"){
            setVisualizedMetric("Recall");
        }
        else{
            setVisualizedMetric("Threshold");
        }

    }, [displayedMetric, validationType]);

    if(tableValues && tableValues.length > 0) {
        return (
            <TableContainer elevation={3} component={Paper} className={classes.paper}>
                <Table sx={{minWidth: 200}} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.leftCell} align="center">{visualizedMetric}</TableCell>
                            <TableCell className={classes.rightCell} align="center">Values</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableValues.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className={classes.leftCell} component="th" scope="row"
                                           sx={{backgroundColor: colorValues[index]}}></TableCell>
                                <TableCell className={classes.rightCell} align="center">{tableValues[index]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
    else {
        return null;
    }
}