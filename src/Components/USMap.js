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
    pitch: 0,
    bearing: 0
};

// DeckGL react component
export function USMap(props) {
    const [geoData, setGeoData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const geoData = await mongoQuery("county_geo_30mb", [])
            if(geoData){
                setGeoData(geoData)
            }
            else {
                console.log("API call failure, data unavailable");
            }
        })();
    }, []);

    useEffect(() => {
        setLoading(Object.keys(geoData).length === 0);
    }, [geoData]);


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
                layers={[new GeoJsonLayer({id: 'geolayer', data: geoData, filled: true, getLineColor:[225, 21, 20, 100], getFillColor: [125, 21, 150, 100]})]} >
                <StaticMap mapStyle={BASEMAP.POSITRON} />
            </DeckGL>
        );
    }
}