import * as React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export function CustomCheckbox(props) {
    const [checked, setChecked] = React.useState([false, false]);

    const handleChange1 = (event) => {
        props.createSelectedFeaturesParent(props.index, event);
        setChecked([event.target.checked, event.target.checked]);
    };

    const handleChange2 = (event) => {
        props.createSelectedFeaturesChildren(props.index, 1);
        setChecked([event.target.checked, checked[1]]);
    };

    const handleChange3 = (event) => {
        props.createSelectedFeaturesChildren(props.index, 0);
        setChecked([checked[0], event.target.checked]);
    };

    const children = () => {
        if (props.index === 0) {
            return null;
        }
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', ml: 3}}>
                <FormControlLabel
                    label="Recall"
                    control={<Checkbox checked={checked[0]} onChange={handleChange2}/>}
                />
                <FormControlLabel
                    label="Precision"
                    control={<Checkbox checked={checked[1]} onChange={handleChange3}/>}
                />
            </Box>
        );
    };

    return (
        <div>
            <FormControlLabel
                label={props.label}
                key={props.index}
                control={
                    <Checkbox
                        key={props.index}
                        checked={checked[0] && checked[1]}
                        indeterminate={checked[0] !== checked[1]}
                        onChange={handleChange1}
                    />
                }
            />
            {children()}
        </div>
    );
}