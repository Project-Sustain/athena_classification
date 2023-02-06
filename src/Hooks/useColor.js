// This file is going to be the abstraction of the coloring functionality
import kmeans from "../Components/Kmeans";
import React, {useEffect, useState} from 'react';
import chroma from "chroma-js"

export function useColor(response){

    const [coloredRegions, setColoredRegions] = useState({});
    const [sliderValue, setSliderValue] = useState(0.5);
    const [validationType, setValidationType] = useState("recall");
    const [displayedMetric, setDisplayedMetric] = useState("threshold");
    const [sliderValueMetric, setSliderValueMetric] = useState(0.5);

    const colorArray = ["red","ff595e","ffca3a","8ac926","1982c4","6a4c93"];
    const thresholdValues = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9"];
    const colorScale = chroma.scale(colorArray).mode('lch').domain([0,1]);

    useEffect(() => {
        const colorValues = chroma.scale(['#ff6d93','#fafa6e','#2A4858']).mode('lch').colors(55);
        const result = kmeans(response, 55, colorValues);
        setColoredRegions(result);
    }, []);

    function colorByFilter(gis_join){
        if (displayedMetric === 'threshold'){
            const sliderValueString = sliderValue.toString();
            return createRGBA(colorScale(response[gis_join][sliderValueString][validationType]));
        }
        else if(displayedMetric === 'cluster'){
            return createRGBA(coloredRegions["colored_regions"][gis_join]);
        }
        return colorByMetric(gis_join);
    }

    function createRGBA(value){
        let rgba = chroma(value).rgba();
        rgba[rgba.length - 1] = 225;
        return rgba;
    }

    function colorByMetric(gis_join){
        if (displayedMetric === 'precision') {
            for(let i = 0; i < thresholdValues.length; i++) {
                const value = response[gis_join][thresholdValues[i]]['precision'];
                if(value >= sliderValueMetric) {
                    return createRGBA(colorScale(parseFloat(thresholdValues[i])));
                }
            }
        }
        else if(displayedMetric === 'recall'){
            for(let i = 0; i < thresholdValues.length; i++) {
                const value = response[gis_join][thresholdValues[i]]['recall'];
                if(value <= sliderValueMetric) {
                    return createRGBA(colorScale(parseFloat(thresholdValues[i])));
                }
            }
        }
        return [0,0,0,0];
    }

    const coloringTriggers = [sliderValue, validationType, sliderValueMetric, displayedMetric];

    const colorData = {
        coloredRegions: coloredRegions,
        colorScale: colorScale,
        sliderValue: sliderValue,
        validationType: validationType,
        displayedMetric: displayedMetric,
        sliderValueMetric: sliderValueMetric,
        coloringTriggers: coloringTriggers
    };

    const colorManagement = {
        colorByFilter: colorByFilter,
        setSliderValue: setSliderValue,
        setValidationType: setValidationType,
        setDisplayedMetric: setDisplayedMetric,
        setSliderValueMetric: setSliderValueMetric
    };

    return {colorData, colorManagement};
}