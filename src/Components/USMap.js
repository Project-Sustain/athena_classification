import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import {sample_response} from "../testing/sample_response";
import {mongoQuery} from "../Utils/Download.ts";
import {GeoJsonLayer} from "@deck.gl/layers";
import {Paper, CircularProgress, Box} from "@mui/material";


// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: -105.086559,
    latitude: 40.573733,
    zoom: 13,
    pitch: 30,
    bearing: 0
};

// DeckGL react component
export function USMap(props) {
    const [geoData, setGeoData] = useState({});
    const [loading, setLoading] = useState(true);
    const [clickInfo, setClickInfo] = useState({})

    useEffect(() => {
        (async () => {
            const geoData = await mongoQuery("county_geo_30mb", [])
            if(geoData){
                // Change this below filtering logic when streaming in real response
                const filteredData = geoData.filter(x => Object.keys(sample_response).includes(x['GISJOIN']))
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
            getLineColor:[225, 21, 20, 100],
            getFillColor: [125, 21, 150, 100],
            pickable: true,
            onClick: info => setClickInfo(info)})
    ]

    console.log({clickInfo})
    console.log({geoData})
    
    if (loading) {
        return (
            <Box >
                <CircularProgress />
            </Box>
        );
    }
    else {
        return (
            <DeckGL
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                layers={layers}>
                <StaticMap mapStyle={BASEMAP.POSITRON} />
            </DeckGL>
        );
    }
}