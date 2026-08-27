import React, { useEffect , useState} from "react";
import jwt_decode from 'jwt-decode';
import props from 'prop-types';
import {login} from '../actions/auth';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';


import { connect } from 'react-redux';

class Login extends React.Component{
    

    constructor(props) 
    {
        super(props);
       
        this.state = {
          email: '',
          password: '',
          
        };
      }

    handleCallbackResponse = (response) => {

        console.log("Encoded JWT ID token:" + response.credential)
        var userObject = jwt_decode(response.credential)
       
        console.log('RESPONSEEEEEEE', userObject)
        console.log(userObject.email)
        this.props.dispatch(login(userObject.email,userObject.googleId))
        document.getElementById('signInDiv').hidden = true

    }

    handleSignOut(event){
        
        document.getElementById('signInDiv').hidden = false

    }

    componentDidMount(){
        /* global google */
        google.accounts.id.initialize({
            client_id:"12310937465-ejlmlf98ianq21osjhk8mvc6qmjl7bn9.apps.googleusercontent.com",
            callback: this.handleCallbackResponse
        })

        google.accounts.id.renderButton(
            document.getElementById('signInDiv'),
            {
                theme:'outline',size:'large'
            }
        )

        google.accounts.id.prompt();

    }
    render(){
    return (

      <div>
          <div id="signInDiv"></div>
         
      </div>
    );
  };
}
  
  
  // export default Login;

function mapStateToProps(state) {
    return {
      auth: state.auth
    };
  }
export default connect(mapStateToProps)(Login);
