import React from "react"

import { auth } from "../../Firebase/FirebaseInit"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"

import { Card, TextField, Button, Typography } from "@material-ui/core"

export default class LogIn extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            error: "",
            success: "",
            passwordReset: false,
            resetEmail: ""
        }
        this.logIn = this.logIn.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.passwordReset = this.passwordReset.bind(this)
    }

    passwordReset() {
        sendPasswordResetEmail(auth, this.state.resetEmail)
        .then(() => {
            this.setState({
                success: "Password reset link sent to " + this.state.resetEmail
            })
        })
        .catch((error) => {
            this.setState({
                error: error.message
            })
        });
    }

    logIn() {
        signInWithEmailAndPassword(auth, this.state.email, this.state.password)
        .then((userCred) => {
            window.location.href = "/works"
        })
        .catch((error) => this.setState({error: error.message}))
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
        [name]: value,
        success: "",
        error: ""
        });
      }

    render() {

        const color = "#FFFFFF"

        return (
            <Card style={{backgroundColor: color, margin: "5%", textAlign: "center", borderRadius: "15px", border: "3px solid #E5650F",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                <br />
              <br />
                <TextField
                    value={this.state.email}
                    style={{display: "flex", margin: "auto", width: "80%", marginTop: 20, marginBottom: 20}}
                    type="email"
                    label="Email"
                    name="email"
                    onChange={this.handleChange}
                />

                <TextField
                    value={this.state.password}
                    style={{display: "flex", margin: "auto", width: "80%", marginTop: 20, marginBottom: 20}}
                    type="password"
                    label="Password"
                    name="password"
                    onChange={this.handleChange}
                />
              
              
              

                <Button variant="outlined" style={{display: "flex", margin: "auto", marginTop: 10, marginBottom: 10}} onClick={() => this.logIn()}> Log In</Button>

                <Button variant="text" style={{display: "flex", marginLeft: "2%"}} onClick={() => this.setState({passwordReset: !this.state.passwordReset, success: "", error: ""})}> Forgot Password?</Button>

              {this.state.passwordReset ?
              <div>
                <TextField
                value={this.state.resetEmail}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="email"
                label="Email"
                name="resetEmail"
                onChange={this.handleChange}
                />
                <Button variant="outlined" style={{display: "inline-flex", marginTop: 10, marginBottom: 10}} onClick={() => this.passwordReset()}> Send Password Reset </Button>
              </div>
              
                :
                null
                }

                <Typography variant="subtitle2" style={{color: "#4caf50", margin: 10}}> {this.state.success} </Typography>
                <Typography variant="subtitle2" style={{color: "#f44336", margin: 10}}> {this.state.error} </Typography>
                <br />
                <br />


            </Card>
        )
    }

}