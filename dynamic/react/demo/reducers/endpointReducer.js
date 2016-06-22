import queryStringReducer from './queryStringReducer';
import {actionTypes} from './reducer';
import {buildQsPath, buildCurl} from '../helpers';

export default (state, action) => {
    let newState = {...state};

    switch (action.type) {
    case actionTypes.SUBMIT_DONE:
        newState.apiResponse = action.apiResponse;
        if (action.error) {
            newState.error = action.error;
        }
        break;
    case actionTypes.QUERY_STRING_CHANGED:
        newState = {...newState, queryString: queryStringReducer(newState.queryString, action)};
        newState.qsPath = buildQsPath(newState.queryString);
        newState.curl = buildCurl(newState);
        break;
    default:
        break;
    }

    return newState;
};
