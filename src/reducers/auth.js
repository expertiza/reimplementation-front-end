import {LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILED, LOG_OUT,CLEAR_AUTH_STATE} from '../actions/actionTypes';


const initialAuthState = {
    user: {},
    error: null,
    isLoggedIn: false,
    inProgress: false
}

export default function auth(state = initialAuthState, action){
    switch(action.type){
        case CLEAR_AUTH_STATE:
            return {
                ...state,
                error:null
            }

        case LOGIN_START:
            return{
                ...state,
                inProgress: true
            }

        case LOGIN_SUCCESS:
            return {
                ...state,
                user:action.user,
                isLoggedIn:true,
                inProgress: false,
                error:null
            }

        case LOGIN_FAILED:
            return{
                ...state,
                error: action.error,
                inProgress: false
            }

        case AUTHENTICATE_USER:
            return {
                ...state,
                user:action.user,
                isLoggedIn: true
            }

        case LOG_OUT:
            return {
                ...state,
                user:{},
                isLoggedIn: false,
            }
    }
}