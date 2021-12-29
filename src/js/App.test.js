import React from 'react';
import ReactDOM from 'react-dom';
import Log from './Log';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Log />, div);
  ReactDOM.unmountComponentAtNode(div);
});

