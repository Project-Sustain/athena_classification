
export function DataQuerier(){
    const classes = useStyles();

    const [uploadFile, setUploadFile] = useState({})
    const [responses, setResponses] = useState({});
    const [incompleteResponse, setIncompleteResponse] = useState();

    const handleFileSubmission = (event) => {
        setUploadFile(event.target.files[0]);
    }
    console.log(responses)

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
                console.log(streamedResults)
                setResponses(streamedResults);
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
                streamedResults[obj["gis_join"]] = obj;
                console.log(obj)
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
    
    return (
        
    )
}