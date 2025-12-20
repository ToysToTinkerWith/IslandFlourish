import React from "react"

import { auth } from "../../Firebase/FirebaseInit"
import { createUserWithEmailAndPassword } from "firebase/auth"

import { db } from "../../Firebase/FirebaseInit"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

import { Card, TextField, Button, Typography} from "@material-ui/core"

export default class SignUp extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            name: "",
            email: "",
            phone: "",
            password: "",
            confPassword: "",
            error: "",
            success: ""
        }
        this.createAccount = this.createAccount.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    createAccount() {

      if (this.state.name == "") {
        this.setState({error: "Name required."})
      }

      else if (this.state.password !== this.state.confPassword) {
        this.setState({error: "Passwords do not match."})
      }

      else {
        createUserWithEmailAndPassword(auth, this.state.email, this.state.password)
        .then(async (authUser) => {

          const userRef = doc(db, "profiles", authUser.user.uid)

          await setDoc(userRef, {
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone,
            profilePic: null,
            description: "",
            access: "",
            title: "",
            created: serverTimestamp()
          })
          
          window.location.href = "/profile"
          
        })
        .catch((error) => this.setState({error: error.message}))
      }

      
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
            <Card style={{margin: "5%", backgroundColor: color, borderRadius: "15px", border: "3px solid #E5650F",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              <br />
              <br />
              <TextField
                value={this.state.name}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="text"
                label= "Name"
                name="name"
                onChange={this.handleChange}
              />
              <TextField
                value={this.state.email}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="email"
                label="Email"
                name="email"
                onChange={this.handleChange}
              />
              <TextField
                value={this.state.phone}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="phone"
                label="Phone"
                name="phone"
                onChange={this.handleChange}
              />
              
              <TextField          
                value={this.state.password}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="password"
                label="Password"
                name="password"
                onChange={this.handleChange}
              />
              <TextField
                value={this.state.confPassword}
                style={{display: "flex", margin: "auto", width: "60%", marginTop: 10, marginBottom: 10, backgroundColor: color}}
                type="password"
                label="Confirm Password"
                name="confPassword"
                onChange={this.handleChange}
              />

              <Typography variant="subtitle2" style={{color: "#000000", marginLeft: 20}}> {this.state.error} </Typography>
              <Typography variant="subtitle2" style={{color: "#000000", marginLeft: 20}}> {this.state.success} </Typography>
              <br />
              <Button variant="outlined" style={{display: "flex", margin: "auto", marginTop: 10, marginBottom: 10}} onClick={() => this.createAccount()}> Sign Up</Button>
              <br />
              <br />
            </Card>
        )
    }

}