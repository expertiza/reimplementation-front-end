import {APIURLS}from '../helpers/urls';

import {
    LOGIN_START,
    LOGIN_FAILED,
    LOGIN_SUCCESS,
    AUTHENTICATE_USER,
    LOG_OUT,
    CLEAR_AUTH_STATE
} from './actionTypes';


import {getFormBody} from '../helpers/utils';

export function startLogin(){
    return {
        type:LOGIN_START
    }
}


export function loginFailed(errorMessage){
    return {
        type: LOGIN_FAILED,
        error: errorMessage
    }
}


export function loginSuccess(user){

    return {
        type: LOGIN_SUCCESS,
        user,

    }
}

export function login(email, password ){
    return (dispatch) => {
        dispatch(startLogin());

        const url = APIURLS.login();

        // fetch(url,{

        //     method: 'POST',
        //     headers: {
        //         'Content-Type' : 'application/x-www-form-urlencoded',
        //     },
        //     body:getFormBody({email,password}),

        // })
        //   .then((response) => response.json())
        //   .then((data) => {
        //       console.log('data',data);
        //       localStorage.setItem('token',data.data.token)l
        //       dispatch(loginSuccess(data.data.user))
        //   })


        axios.post(url,)
    }
}