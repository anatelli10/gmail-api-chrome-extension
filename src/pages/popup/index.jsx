import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup';
import './index.css';

chrome.storage.local.get('user', ({ user }) =>
    render(
        <Popup loadUser={user} />,
        window.document.querySelector('#app-container')
    )
);
