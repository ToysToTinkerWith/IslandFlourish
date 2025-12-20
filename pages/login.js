import React from "react"

import Head from "next/head"


import SignUp from "../components/Auth/SignUp"
import LogIn from "../components/Auth/LogIn"

import { Grid, Typography, Button } from "@mui/material"

export default class login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            
        }
    }

    render() {
        return (
            <div>
                <Head>
                <title>Login</title>
                <meta name="keywords" content="Sign up, Log In" />
              </Head>
                
                <Grid container>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <LogIn setPage={this.props.setPage} changeDrawer={this.props.changeDrawer}/>  
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={12} lg={12}>
                        <SignUp setPage={this.props.setPage} changeDrawer={this.props.changeDrawer} />
                    </Grid> */}
                </Grid>
                
                
            </div>
                    
        )
    }

}