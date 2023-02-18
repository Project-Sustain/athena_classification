import React, {useEffect, useState} from 'react';
import {Paper, Button, FormControlLabel, Checkbox, Box} from '@mui/material';
import chroma from "chroma-js";
import { makeStyles } from "@material-ui/core";
import {featureMetaData, thresholdValues} from "../Constants/FeatureMetaData.js";
import {CustomCheckbox} from "../Components/CustomCheckbox";
import kmeans from "../Components/Kmeans";

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


const defaultFeatures = [[false, false], [false, false], [false, false], [false, false], [false, false], [false, false], [false, false], [false, false], [false, false], [false, false]];

export function KmeansFeatureSelection({coloringRequest}) {
    const classes = useStyles();
    const [selectedFeatures, setSelectedFeatures] = useState(defaultFeatures);

    function createSelectedFeaturesParent(index, event){
        let tempSelectedFeatures = selectedFeatures;
        tempSelectedFeatures[index] = [event.target.checked, event.target.checked];
        setSelectedFeatures(tempSelectedFeatures);
        console.log({selectedFeatures})

    }

    function createSelectedFeaturesChildren(index, precision_or_recall){
        let tempSelectedFeatures = selectedFeatures;
        tempSelectedFeatures[index][precision_or_recall] = !tempSelectedFeatures[index][precision_or_recall];
        setSelectedFeatures(tempSelectedFeatures);
        console.log({selectedFeatures})

    }

    function colorBasedOnFeatures(){
        const formattedFeatures = createFormattedFeatures();
        coloringRequest(formattedFeatures);
    }

    function createFormattedFeatures(){
        let formattedFeatures = [];
        for(let i = 0; i < selectedFeatures.length; i++){
            if(i === 0 && selectedFeatures[0][0] === true && selectedFeatures[0][1] === true){
                formattedFeatures.push("auc_of_roc");
            }
            else {
                if (selectedFeatures[i][1] === true) {
                    formattedFeatures.push([thresholdValues[i - 1], "recall"]);

                }
                if(selectedFeatures[i][0] === true){
                    formattedFeatures.push([thresholdValues[i - 1], "precision"]);
                }
            }

        }

        return formattedFeatures;
    }


    return (
        <div>
            <Paper className={classes.paper} elevation={3}>
                Feature Selection
                {featureMetaData.map((item, i) => {
                    return (
                        <CustomCheckbox index={i} label={item} createSelectedFeaturesChildren={createSelectedFeaturesChildren}
                                        createSelectedFeaturesParent={createSelectedFeaturesParent}/>
                    )
                })}
                <Button onClick={() => colorBasedOnFeatures()} >Cluster</Button>
            </Paper>
        </div>
    );
}