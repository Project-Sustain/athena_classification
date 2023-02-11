import React, {useEffect, useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import chroma from "chroma-js";


const rangeValues = {
    PrecisionRecall: [" < 0.1" ,"0.1 - 0.2", "0.2 - 0.3", "0.3 - 0.4", "0.4 - 0.5", "0.5 - 0.6", "0.6 - 0.7", "0.7 - 0.8", "0.8 - 0.9", "> 0.9"],
    thresholdValues: ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9"]
}
const colorValues = chroma.scale(["red","ff595e","ffca3a","8ac926","1982c4","6a4c93"]).mode('lch').colors(10);

export function ColorLegend({displayedMetric}) {
    const [tableValues, setTableValues] = useState(rangeValues.PrecisionRecall);

    function tableLabel(displayedMetric){
        if(displayedMetric === 'threshold'){
            setTableValues(rangeValues.PrecisionRecall);
        }
        else{
            setTableValues(rangeValues.thesholdValues);
        }
    }


    return (
        <TableContainer elevation={3} sx={{ maxWidth: 200}} component={Paper}>
            <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">{displayedMetric}</TableCell>
                        <TableCell align="center">Values</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableValues.map((row, index) => (
                        <TableRow  key={index}>
                            <TableCell component="th" scope="row" sx={{backgroundColor: colorValues[index]}}></TableCell>
                            <TableCell align="center">{tableValues[index]}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}