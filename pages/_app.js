
import React, { useEffect, useState  } from "react";
import { AuthProvider } from "../Firebase/FirebaseAuth";



import { useRouter } from 'next/router'

import Nav from "../components/Nav"
import Footer from "../components/Footer"




import PropTypes from "prop-types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

import "../style.css"


export default function MyApp(props) {

  const { Component, pageProps  } = props;
  

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    
    
    <React.Fragment>
      


      <ThemeProvider theme={theme}>
      <CssBaseline />
        <AuthProvider >
          <Nav />
            <Component {...pageProps}/>
            <Footer />
        </AuthProvider>
      </ThemeProvider>

    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
