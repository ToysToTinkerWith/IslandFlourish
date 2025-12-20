import React from "react"

import { db } from "../../Firebase/FirebaseInit"
import { doc, collection, addDoc, updateDoc, serverTimestamp, onSnapshot, arrayUnion, deleteDoc, getDocs } from "firebase/firestore";

import { storage } from "../../Firebase/FirebaseInit"
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";


import { Modal, Button, TextField, Typography, Checkbox, Card, Grid} from "@mui/material"


export default class NewWorks extends React.Component {

    

    constructor(props) {
        super(props)
        this.state = {
            collection: "",
            item: "",
            date: "",
            newPictures: [],
            confirm: false,
            viewPicture: false,
            loading: false,
            progress: 0

        }
        this.handleChange = this.handleChange.bind(this)
        this.handlePicture = this.handlePicture.bind(this)
        this.deletePicture = this.deletePicture.bind(this)

        this.addWorks = this.addWorks.bind(this)



   
    }

    componentDidMount() {
        
    }

    componentWillUnmount() {
   
    }

    


    async addWorks() {


       
        const requestRef = collection(db, "works")

        await addDoc(requestRef, {
            collection: this.state.collection,
            item: this.state.item,
            date: this.state.date,
            created: serverTimestamp()
            
        }).then((doc) => {

            const uploadPictures = this.state.newPictures

                for (let y = 0; y < uploadPictures.length; y++) {

                const imgRef = ref(storage, "worksImages/" + uploadPictures[y].id)
        
                uploadBytes(imgRef, uploadPictures[y])

                const uploadTask = uploadBytesResumable(imgRef, uploadPictures[y])
        
                uploadTask.on("state_changed", (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                this.setState({progress: progress})
                },
                (error) => {
                alert(error.message)
                },
                () => {

                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

                    const imgCol = collection(db, "works", doc.id, "imgs")
                    
                    let imgMessage = this.state[uploadPictures[y].id] ? this.state[uploadPictures[y].id] : ""
                    console.log(imgMessage)
                
                    addDoc(imgCol, {
                        index: y,
                        url: downloadURL, 
                        message: imgMessage, 
                        created: uploadPictures[y].lastModified
                    })
                });
        
                })
        
            }
        
            })

      }

      deletePicture(pictureId) {

        const imgs = this.state.newPictures
        let index = 0
        let delIndex

        imgs.forEach(img => {
            if (img.id == pictureId) {
                delIndex = index
            }
            index++
        })
    
        imgs.splice(delIndex, 1)
    
        this.setState({
          pictures: imgs,
          [pictureId]: ""
        })

    
      }


      handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        console.log(target.value)

        const name = target.name;

        this.setState({
        [name]: value

        });
      }
      
      handlePicture = (e) => {
        for (let i = 0; i < e.target.files.length; i++) {
          const newPicture = e.target.files[i];
          newPicture["id"] = Math.random().toString(20);
          console.log(newPicture)
          this.setState(prevState => ({newPictures: [...prevState.newPictures, newPicture], "newPicture.id": ""}));
        }
        e.target.value = null
      };

    render() {

        console.log(this.state)

        

        return (
            <div style={{backgroundColor: "#FFE2D9"}}>

                    <TextField
                    color="primary"
                    variant="outlined"
                    value={this.state.collection}
                    type="text"
                    label={"Collection Name"}
                    name={"collection"}
                    style={{width: "50%", display: "flex", margin: "auto"}}
                    onChange={this.handleChange}
                    />

                    <br />
                    <br />

                    <TextField
                    color="primary"
                    variant="outlined"
                    value={this.state.item}
                    type="phone"
                    label={"Item Name"}
                    name={"item"}
                    style={{width: "50%", display: "flex", margin: "auto"}}
                    onChange={this.handleChange}
                    />

                    <br />
                    <br />

                    <TextField
                    color="primary"
                    variant="outlined"
                    value={this.state.date}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    label={"Date"}
                    name={"date"}
                    style={{width: "50%", display: "flex", margin: "auto"}}
                    onChange={this.handleChange}
                    />

                    <br />
                    <br />  

                    
                    
                    
                    <Button variant="contained" component="label" color="secondary" style={{backgroundColor: "#242424", width: 100, padding: 10, display: "flex", margin: "auto"}}>
                    <Typography variant="subtitle2" style={{color: "#FFFFFF"}}>  Add Photos </Typography>

                   
                    <input type="file" multiple onChange={this.handlePicture} style={{width: 0, opacity: 0}}/>

                    </Button>
                    <br />
                    <br />
                    

                    
                    

                    <div style={{textAlign: "center"}}>
                    {this.state.newPictures.length > 0 ? this.state.newPictures.map((picture, index) => {
                        console.log(picture)
                        return (
                            <div key={index} style={{display: "inline-block", border: "1px solid black", borderRadius: 5, margin: 5, padding: 10}}>
                                <Button onClick={() => this.setState({viewPicture: URL.createObjectURL(picture)})}> 
                            <img src={URL.createObjectURL(picture)} alt="img" style={{height: 100, width: 100, borderRadius: 15}}/>
                            </Button>
                            <TextField
                                onChange={this.handleChange}
                                multiline
                                rows={3}
                                value={this.state.newPictures.id}
                                variant="outlined"
                                type="text"
                                label="Description"
                                name={picture.id}
                                style={{
                                display: "flex",
                                margin: "auto",
                                width: "70%"
                                }}
                            />
                         
                            <Button variant="contained" color="primary" style={{margin: 10, padding: 10, backgroundColor: "#242424"}} onClick={() => this.deletePicture(picture.id)}>
                                Del
                            </Button>   
                            </div>
                        )
                        })  
                        :
                        null
                        }
                        
                    </div>

                    <br />
                    {this.state.progress == 100 ? 
                    <Typography align="center" variant="h6"> Uploaded </Typography>
                    :
                    this.state.progress == 0 ?
                    null
                    :
                    <Typography align="center" variant="h6"> Uploading... {this.state.progress} </Typography>
                    }
                    <br/>
                        
                <Button
                color="secondary"
                variant="contained"
                style={{width: 100, padding: 10, backgroundColor: "#242424", display: "flex", margin: "auto"}}
                onClick={() => 
                    this.addWorks()
                    }
                > 
                <Typography variant="subtitle2" style={{color: "#FFFFFF"}}> Add Item </Typography>

                
                </Button>

                <br />
                <br />


               
            {this.state.pictureWarning ? 
                <Modal 
                open={true} 
                onClose={() => this.setState({pictureWarning: false})}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                <div style={{backgroundColor: "#FFFFFF", borderRadius: 15, padding: 20}}>
                    <Typography variant="body1" style={{padding: 20}} >  Delete this picture? </Typography>
                    <Button variant="contained" color="secondary" style={{width: "50%"}} onClick={() => this.setState({pictureWarning: false})}> Back </Button>
                    <Button variant="contained" color="secondary" style={{width: "50%"}} onClick={() => this.deletePictureFirebase()}> Yes </Button>
                </div>
                
                </Modal>
            :
            null
            }
            

            {this.state.requestWarning ? 
            <Modal 
            open={true} 
            onClose={() => this.setState({requestWarning: false})}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <div style={{backgroundColor: "#FFFFFF", borderRadius: 15, padding: 20}}>
                <Typography variant="body1" style={{padding: 20}} >  Upload this request? </Typography>
                <Button variant="contained" color="secondary" style={{width: "50%"}} onClick={() => this.setState({requestWarning: false})}> Back </Button>
                <Button variant="contained" color="secondary" style={{width: "50%"}} onClick={() => [this.sendrequest(), this.props.closeModal()]}> Yes </Button>
            </div>
            
            </Modal>
            :
            null
            }

                {this.state.viewPicture ?
                    <Modal 
                    open={true} 
                    onClose={() => this.setState({viewPicture: null})}
                    onClick={() => this.setState({viewPicture: null})}
                    style={{
                        overflowY: "auto",
                        overflowX: "hidden"
                    }}>
                    <img src={this.state.viewPicture} alt="" variant="square" style={{ width: "100%", height: "auto" }} />
                    </Modal>
                    
                    :
                    null
                }

            
            </div>
        )
        }
          
    

}