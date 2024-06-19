import { combineReducers } from "redux";
import {configureStore} from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";
import {persistReducer} from "redux-persist";

import ApiCalledReducer from "./ApiCalledReducer";
import EnableNewDesignReducer from "./EnableNewDesignReducer";

const config = {
    key: 'root',
    version: 1,
    storage
};

export const allReducers = combineReducers({
    isApiCalled: ApiCalledReducer,
    setSmartSearchNewDesign: EnableNewDesignReducer
});

export const persistedReducer = persistReducer(config, allReducers);

const appStore = configureStore(
    {reducer: persistedReducer}
);

export default appStore;