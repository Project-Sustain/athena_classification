import React, {useEffect, useState} from 'react';
import { makeStyles } from "@material-ui/core"
import {Paper, CircularProgress, Box, Slider, Switch, Typography, Stack, Button, ButtonGroup} from "@mui/material";
import {request} from "../testing/request";

export function useData({geoData, setGeoData}){

    const [uploadFile, setUploadFile] = useState({})
    const [incompleteResponse, setIncompleteResponse] = useState();
    const [response, setResponse] = useState({});

    const handleFileSubmission = (event) => {
        setUploadFile(event.target.files[0]);
    }

    async function sendRequest(){
        console.log({request})
        let reader;
        const formData = new FormData();
        const url = "https://sustain.cs.colostate.edu:31415/validation_service/submit_validation_job";
        formData.append('file', uploadFile);
        console.log(uploadFile)
        console.log(JSON.stringify(request))
        formData.append('request', JSON.stringify(request));
        let response = await fetch(url, {
            method: 'POST',
            body: formData,
        }).then(response => {
            reader = response.body.getReader();
        });

        // Setup variables to handle stream
        let streamedResults = {};
        let incompleteResponse = '';

        while (true) {
            // Read from stream
            const { done, value } = await reader.read();
            // Return when stream is done
            if (done) {
                console.log("Streaming Results: ")
                console.log({streamedResults})
                console.log(geoData)
                let filteredData = geoData.filter(x => Object.keys(streamedResults).includes(x['GISJOIN']));
                setGeoData(filteredData);
                setResponse(streamedResults);
                console.log({geoData})
                return streamedResults;
            }
            // Decode current chunk
            let response = new TextDecoder().decode(value);
            // Update response if previous chunk was incomplete
            response = incompleteResponse + response;

            // Parse response chunk
            while (response.indexOf('\n') !== -1) {
                const parsedResponse = response.substring(0, response.indexOf('\n'));
                const obj = JSON.parse(parsedResponse);
                response = response.substring(response.indexOf('\n') + 1, response.length);
                streamedResults[obj["gis_join"]] = JSON.parse(obj["response"]);
            }

            // Handle incomplete response chunk
            if (response.indexOf('\n') === -1 && response.length !== 0){
                incompleteResponse = response;
            }

            // Handle complete response chunk
            else {
                incompleteResponse = '';
            }

        }
    }
    console.log(Object.keys(response).length)
    const data = {
        response: response
    }
    const dataManagement = {
        handleFileSubmission: handleFileSubmission,
        sendRequest, sendRequest,
        setResponse, setResponse
    }

    return {data, dataManagement}
}