import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import theme from "../theme";

export default class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>

          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="title" content="Island Flourish" />
          <meta name="description" content="" />
          <meta name="keywords" content="" />
          <link rel="icon" href="/images/favicon.ico"/>


          <meta name="theme-color" content={theme.palette.primary.main} />
          
         



          
          
        </Head>
        <body style={{
          minHeight: "100vh",
          background:
            "#EFE7DC",
        }}>

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}


