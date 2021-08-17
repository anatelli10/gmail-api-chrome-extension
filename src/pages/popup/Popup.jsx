import React, { useState, useEffect } from 'react';
import { makeStyles, Box, Button, Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import GoogleButton from 'react-google-button';
import { useChromeStorageLocal as useChromeState } from 'use-chrome-storage';

const columns = [
    { field: 'sender', headerName: 'Sender', width: 150 },
    {
        field: 'date',
        headerName: 'Date',
        width: 110
    },
    {
        field: 'snippet',
        headerName: 'Preview',
        width: 380
    }
];

const useStyles = makeStyles(theme => ({
    box: {
        padding: theme.spacing(2)
    },
    body: {
        marginBottom: theme.spacing(2)
    },
    dataGrid: {
        height: 381,
        width: '100%',
        marginBottom: theme.spacing(2)
    },
    button: {
        margin: 'auto'
    },
    googleButton: {
        margin: 'auto',
        fontWeight: 500
    }
}));

const Popup = ({ loadUser }) => {
    const classes = useStyles();
    const [user] = useChromeState('user', loadUser);
    const [disabled, setDisabled] = useState(false);
    const [rows, setRows] = useState([]);

    const handleSignInClick = () => {
        setDisabled(true);
        chrome.runtime.sendMessage({ message: 'sign in' }, () =>
            setDisabled(false)
        );
    };

    const handleSignOutClick = () =>
        chrome.runtime.sendMessage({ message: 'sign out' });

    // Load list on load and on sign in
    useEffect(() => {
        if (user)
            chrome.runtime.sendMessage({ message: 'list' }, list =>
                setRows(list)
            );
    }, []);
    useEffect(() => {
        if (user)
            chrome.runtime.sendMessage({ message: 'list' }, list =>
                setRows(list)
            );
    }, [user]);

    return (
        <Box className={classes.box} width={user ? '668px' : null}>
            {user ? (
                <React.Fragment>
                    <Typography variant="h5" gutterBottom>
                        Inbox
                    </Typography>
                    <Typography
                        className={classes.body}
                        variant="body1"
                        gutterBottom
                    >
                        Signed in to {user}
                    </Typography>
                    <div className={classes.dataGrid}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={25}
                            density="compact"
                            disableSelectionOnClick
                        />
                    </div>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        onClick={handleSignOutClick}
                    >
                        Sign out
                    </Button>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Typography variant="h5" gutterBottom>
                        Sign in
                    </Typography>
                    <Typography
                        className={classes.body}
                        variant="body1"
                        gutterBottom
                    >
                        Sign in below to get started.
                    </Typography>
                    <GoogleButton
                        className={classes.googleButton}
                        type="light"
                        onClick={handleSignInClick}
                        disabled={disabled}
                    ></GoogleButton>
                </React.Fragment>
            )}
        </Box>
    );
};

export default Popup;
