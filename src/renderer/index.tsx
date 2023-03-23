// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import '../components/main.scss';
// TODO setup redux persist & configure it

// const container = document.getElementById('root');
const root = ReactDOM.createRoot(document.getElementById('root') as Element);
// const ReactDOM.createRoot
// const container = document.getElementById('root');
// const root = ReactDOM.createRoot(container as Element);

root.render(
  <Provider store={store}>
    {/* <React.StrictMode> */}
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
    {/* </React.StrictMode> */}
  </Provider>
);
