// components/SignUp.js
// Theme-matched (Island Flourish) MUI + framer-motion sign-up form.
// Minimal fields: email, password, confirm password.
// Creates Firebase Auth user, then creates a Firestore profile doc (minimal).

import React from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"

import { auth } from "../../Firebase/FirebaseInit"
import { createUserWithEmailAndPassword } from "firebase/auth"

import { db } from "../../Firebase/FirebaseInit"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

import {
  Card,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material"

import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      confPassword: "",

      submitting: false,
      error: "",
      success: "",
      touched: {},
    }

    this.createAccount = this.createAccount.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.setTouched = this.setTouched.bind(this)
  }

  styles() {
    const BG = "#121212"
    const ACCENT = "#6BAA6A"
    const GLASS = "rgba(255,255,255,0.04)"
    const BORDER = "rgba(107,170,106,0.22)"

    return {
      page: { backgroundColor: BG, overflowX: "hidden" },
      shell: { maxWidth: 980, margin: "0 auto", padding: "28px 16px 70px" },

      hero: {
        position: "relative",
        borderRadius: 26,
        padding: "22px 18px",
        border: `1px solid ${BORDER}`,
        background:
          "radial-gradient(900px 260px at 10% 0%, rgba(107,170,106,0.28), rgba(18,18,18,0))," +
          "radial-gradient(700px 240px at 95% 20%, rgba(255,114,143,0.18), rgba(18,18,18,0))," +
          "radial-gradient(700px 260px at 40% 110%, rgba(255,197,92,0.14), rgba(18,18,18,0))",
        overflow: "hidden",
        marginBottom: 18,
      },
      heroInner: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      },
      heroTitle: { color: ACCENT, fontWeight: 900, letterSpacing: 0.2 },
      heroSub: { color: "rgba(107,170,106,0.85)", marginTop: 6 },

      blob: (top, left, size, c1, c2) => ({
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "45% 55% 60% 40% / 45% 45% 55% 55%",
        background: `radial-gradient(circle at 30% 30%, ${c1}, ${c2})`,
        opacity: 0.7,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }),

      sectionCard: {
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(180deg, ${GLASS}, rgba(255,255,255,0.02))`,
        padding: 16,
        marginTop: 16,
        position: "relative",
        overflow: "hidden",
      },
      cardGlow: {
        position: "absolute",
        inset: -2,
        background:
          "radial-gradient(600px 240px at 0% 0%, rgba(107,170,106,0.16), rgba(0,0,0,0))," +
          "radial-gradient(600px 240px at 100% 0%, rgba(255,114,143,0.10), rgba(0,0,0,0))",
        pointerEvents: "none",
      },

      helper: { color: "rgba(107,170,106,0.65)" },

      pillBtn: {
        borderRadius: 999,
        border: `1px solid ${BORDER}`,
        padding: "10px 16px",
        color: ACCENT,
        textTransform: "none",
        background: "rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
      },
      pillBtnSolid: {
        borderRadius: 999,
        border: `1px solid rgba(107,170,106,0.35)`,
        padding: "10px 16px",
        color: "#0f1410",
        textTransform: "none",
        background:
          "linear-gradient(180deg, rgba(107,170,106,0.95), rgba(107,170,106,0.75))",
      },

      fieldSx: {
        "& .MuiInputLabel-root": { color: "rgba(107,170,106,0.82)" },
        "& .MuiInputLabel-root.Mui-focused": { color: "rgba(107,170,106,1)" },
        "& .MuiOutlinedInput-root": {
          color: "rgba(255,255,255,0.92)",
          backgroundColor: "rgba(0,0,0,0.12)",
          borderRadius: 5,
          "& fieldset": { borderColor: "rgba(107,170,106,0.22)" },
          "&:hover fieldset": { borderColor: "rgba(107,170,106,0.35)" },
          "&.Mui-focused fieldset": { borderColor: "rgba(107,170,106,0.65)" },
        },
        "& .MuiFormHelperText-root": { color: "rgba(107,170,106,0.65)" },
      },
    }
  }

  setTouched(key) {
    this.setState((prev) => ({ touched: { ...prev.touched, [key]: true } }))
  }

  validate() {
    const errors = {}
    const email = String(this.state.email || "").trim()
    const password = String(this.state.password || "")
    const confPassword = String(this.state.confPassword || "")

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

    if (!email) errors.email = "Email is required."
    else if (!isEmail(email)) errors.email = "Please enter a valid email."

    if (!password) errors.password = "Password is required."
    if (!confPassword) errors.confPassword = "Please confirm your password."
    if (password && confPassword && password !== confPassword)
      errors.confPassword = "Passwords do not match."

    return errors
  }

  async createAccount() {
    this.setState({
      success: "",
      error: "",
      touched: { email: true, password: true, confPassword: true },
    })

    const errors = this.validate()
    if (Object.keys(errors).length) {
      const firstKey = Object.keys(errors)[0]
      this.setState({ error: errors[firstKey] || "Please complete the required fields." })
      return
    }

    try {
      this.setState({ submitting: true, error: "", success: "" })

      const email = String(this.state.email || "").trim()
      const password = String(this.state.password || "")

      const authUser = await createUserWithEmailAndPassword(auth, email, password)

  

      window.location.href = "/moments"
    } catch (error) {
      this.setState({
        submitting: false,
        success: "",
        error: error?.message || "Something went wrong while creating your account.",
      })
    }
  }

  handleChange(event) {
    const target = event.target
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value,
      success: "",
      error: "",
    })
  }

  render() {
    const s = this.styles()
    const errors = this.validate()
    const showErr = (key) => Boolean(this.state.touched[key] && errors[key])

    return (
      <div style={s.page}>
        <Head>
          <title>Create Account</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div style={s.shell}>
          {/* Hero */}
          <motion.div
            style={s.hero}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              style={s.blob(-60, -40, 220, "rgba(107,170,106,0.85)", "rgba(18,18,18,0)")}
              animate={{ rotate: [0, 6, 0], x: [0, 10, 0], y: [0, 6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={s.blob(10, "70%", 240, "rgba(255,114,143,0.55)", "rgba(18,18,18,0)")}
              animate={{ rotate: [0, -7, 0], x: [0, -12, 0], y: [0, 8, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            <div style={s.heroInner}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PersonAddAltOutlinedIcon style={{ color: "#6BAA6A" }} />
                <div>
                  <Typography variant="h4" style={s.heroTitle}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" style={s.heroSub}>
                    Enter your email and set a password to get started.
                  </Typography>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <Card style={s.sectionCard} elevation={0}>
            <div style={s.cardGlow} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h5" style={{ color: "#6BAA6A", fontWeight: 900 }}>
                Sign up
              </Typography>
              <Typography variant="body2" style={s.helper}>
                You can update your profile details after creating your account.
              </Typography>

              <Divider style={{ opacity: 0.12, marginTop: 12, marginBottom: 14 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    onBlur={() => this.setTouched("email")}
                    error={showErr("email")}
                    helperText={showErr("email") ? errors.email : " "}
                    sx={s.fieldSx}
                    InputProps={{
                      startAdornment: (
                        <span style={{ display: "inline-flex", marginRight: 10, opacity: 0.85 }}>
                          <EmailOutlinedIcon fontSize="small" />
                        </span>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    onBlur={() => this.setTouched("password")}
                    error={showErr("password")}
                    helperText={showErr("password") ? errors.password : " "}
                    sx={s.fieldSx}
                    InputProps={{
                      startAdornment: (
                        <span style={{ display: "inline-flex", marginRight: 10, opacity: 0.85 }}>
                          <LockOutlinedIcon fontSize="small" />
                        </span>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confPassword"
                    type="password"
                    value={this.state.confPassword}
                    onChange={this.handleChange}
                    onBlur={() => this.setTouched("confPassword")}
                    error={showErr("confPassword")}
                    helperText={showErr("confPassword") ? errors.confPassword : " "}
                    sx={s.fieldSx}
                    InputProps={{
                      startAdornment: (
                        <span style={{ display: "inline-flex", marginRight: 10, opacity: 0.85 }}>
                          <LockOutlinedIcon fontSize="small" />
                        </span>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <AnimatePresence>
                    {this.state.error ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert
                          severity="error"
                          style={{
                            borderRadius: 16,
                            background: "rgba(255,0,0,0.10)",
                            color: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(255,0,0,0.18)",
                          }}
                        >
                          {this.state.error}
                        </Alert>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {this.state.success ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginTop: 12 }}
                      >
                        <Alert
                          severity="success"
                          style={{
                            borderRadius: 16,
                            background: "rgba(107,170,106,0.12)",
                            color: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(107,170,106,0.22)",
                          }}
                        >
                          {this.state.success}
                        </Alert>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Grid>

                <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Button
                    type="button"
                    style={s.pillBtn}
                    disabled={this.state.submitting}
                    onClick={() =>
                      this.setState({
                        email: "",
                        password: "",
                        confPassword: "",
                        error: "",
                        success: "",
                        touched: {},
                      })
                    }
                  >
                    Clear
                  </Button>

                  <Button
                    type="button"
                    style={s.pillBtnSolid}
                    disabled={this.state.submitting}
                    onClick={() => this.createAccount()}
                  >
                    {this.state.submitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CircularProgress size={18} style={{ color: "#0f1410" }} />
                        Creating…
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}
