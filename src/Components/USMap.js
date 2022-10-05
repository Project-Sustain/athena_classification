import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';

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
    return (
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={[]} >
            <Map mapStyle={BASEMAP.POSITRON} />
        </DeckGL>
    );
}