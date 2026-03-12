// components/LogIn.js (or pages/admin/LogIn.js)
// Theme-matched (Island Flourish) MUI + framer-motion login form.
// Writes no Firestore; uses Firebase Auth sign-in + password reset.

import React from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"

import { auth } from "../../Firebase/FirebaseInit"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"

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

import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"

export default class LogIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",

      resetOpen: false,
      resetEmail: "",

      submitting: false,
      success: "",
      error: "",
      touched: {},
    }

    this.logIn = this.logIn.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.sendPasswordReset = this.sendPasswordReset.bind(this)
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

  validateLogin() {
    const errors = {}
    const email = String(this.state.email || "").trim()
    const password = String(this.state.password || "")

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

    if (!email) errors.email = "Email is required."
    else if (!isEmail(email)) errors.email = "Please enter a valid email."
    if (!password) errors.password = "Password is required."

    return errors
  }

  validateReset() {
    const errors = {}
    const email = String(this.state.resetEmail || "").trim()
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    if (!email) errors.resetEmail = "Email is required."
    else if (!isEmail(email)) errors.resetEmail = "Please enter a valid email."
    return errors
  }

  async sendPasswordReset() {
    this.setState({
      success: "",
      error: "",
      touched: { ...this.state.touched, resetEmail: true },
    })

    const errors = this.validateReset()
    if (Object.keys(errors).length) {
      this.setState({ error: "Please enter a valid email for password reset." })
      return
    }

    try {
      this.setState({ submitting: true, error: "", success: "" })
      await sendPasswordResetEmail(auth, String(this.state.resetEmail || "").trim())
      this.setState({
        submitting: false,
        success: `Password reset link sent to ${String(this.state.resetEmail || "").trim()}`,
        error: "",
      })
    } catch (error) {
      this.setState({
        submitting: false,
        success: "",
        error: error?.message || "Unable to send password reset email.",
      })
    }
  }

  async logIn() {
    this.setState({
      success: "",
      error: "",
      touched: { ...this.state.touched, email: true, password: true },
    })

    const errors = this.validateLogin()
    if (Object.keys(errors).length) {
      this.setState({ error: "Please enter your email and password." })
      return
    }

    try {
      this.setState({ submitting: true, error: "", success: "" })
      await signInWithEmailAndPassword(
        auth,
        String(this.state.email || "").trim(),
        String(this.state.password || "")
      )
      window.location.href = "/moments"
    } catch (error) {
      this.setState({
        submitting: false,
        success: "",
        error: error?.message || "Login failed. Please try again.",
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

    const loginErrors = this.validateLogin()
    const resetErrors = this.validateReset()
    const showErr = (key, bag) => Boolean(this.state.touched[key] && bag[key])

    return (
      <div style={s.page}>
        <Head>
          <title>Admin Login</title>
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
                <LockOutlinedIcon style={{ color: "#6BAA6A" }} />
                <div>
                  <Typography variant="h4" style={s.heroTitle}>
                    Admin Login
                  </Typography>
                  <Typography variant="body1" style={s.heroSub}>
                    Sign in to manage content and view private pages.
                  </Typography>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card */}
          <Card style={s.sectionCard} elevation={0}>
            <div style={s.cardGlow} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h5" style={{ color: "#6BAA6A", fontWeight: 900 }}>
                {this.state.resetOpen ? "Reset your password" : "Sign in"}
              </Typography>

              <Typography variant="body2" style={s.helper}>
                {this.state.resetOpen
                  ? "Enter your email and we’ll send a reset link."
                  : "Use your admin credentials to continue."}
              </Typography>

              <Divider style={{ opacity: 0.12, marginTop: 12, marginBottom: 14 }} />

              <Grid container spacing={2}>
                {!this.state.resetOpen ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                        onBlur={() => this.setTouched("email")}
                        error={showErr("email", loginErrors)}
                        helperText={showErr("email", loginErrors) ? loginErrors.email : " "}
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

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        onBlur={() => this.setTouched("password")}
                        error={showErr("password", loginErrors)}
                        helperText={showErr("password", loginErrors) ? loginErrors.password : " "}
                        sx={s.fieldSx}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}
                    >
                      <Button
                        type="button"
                        style={s.pillBtn}
                        disabled={this.state.submitting}
                        onClick={() =>
                          this.setState({
                            resetOpen: true,
                            error: "",
                            success: "",
                            touched: {},
                          })
                        }
                      >
                        Forgot password?
                      </Button>

                      <Button
                        type="button"
                        style={s.pillBtnSolid}
                        disabled={this.state.submitting}
                        onClick={() => this.logIn()}
                      >
                        {this.state.submitting ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CircularProgress size={18} style={{ color: "#0f1410" }} />
                            Signing in…
                          </span>
                        ) : (
                          "Log In"
                        )}
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="resetEmail"
                        type="email"
                        value={this.state.resetEmail}
                        onChange={this.handleChange}
                        onBlur={() => this.setTouched("resetEmail")}
                        error={showErr("resetEmail", resetErrors)}
                        helperText={showErr("resetEmail", resetErrors) ? resetErrors.resetEmail : " "}
                        sx={s.fieldSx}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}
                    >
                      <Button
                        type="button"
                        style={s.pillBtn}
                        disabled={this.state.submitting}
                        onClick={() =>
                          this.setState({
                            resetOpen: false,
                            resetEmail: "",
                            error: "",
                            success: "",
                            touched: {},
                          })
                        }
                      >
                        Back to login
                      </Button>

                      <Button
                        type="button"
                        style={s.pillBtnSolid}
                        disabled={this.state.submitting}
                        onClick={() => this.sendPasswordReset()}
                      >
                        {this.state.submitting ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CircularProgress size={18} style={{ color: "#0f1410" }} />
                            Sending…
                          </span>
                        ) : (
                          "Send reset link"
                        )}
                      </Button>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <AnimatePresence>
                    {this.state.error ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginTop: 8 }}
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
                        style={{ marginTop: this.state.error ? 10 : 8 }}
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
              </Grid>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}
