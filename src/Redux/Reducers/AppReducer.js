import { combineReducers } from "redux";
import {configureStore} from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";
import {persistReducer} from "redux-persist";
import UserInfoReducer from "./UserInfoReducer";
import RoleReducer from "./RoleReducer";


const config = {
    key: 'root',
    version: 1,
    storage
};

export const allReducers = combineReducers({
    userInfo: UserInfoReducer,
    role: RoleReducer
});

export const persistedReducer = persistReducer(config, allReducers);

const appStore = configureStore(
    {reducer: persistedReducer}
);

export default appStore;