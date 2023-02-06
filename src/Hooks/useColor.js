// This file is going to be the abstraction of the coloring functionality
import kmeans from "../Components/Kmeans";
import React, {useEffect, useState} from 'react';


export function useColor(response){
    const [coloredRegions, setColoredRegions] = useState({});

    useEffect(() => {
        const result = kmeans(response, 55);
        setColoredRegions(result);
    }, []);


    const data = {
        coloredRegions: coloredRegions
    }

    return data;
}