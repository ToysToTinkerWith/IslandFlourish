import React from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"

import { auth, db } from "../Firebase/FirebaseInit"
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth"
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

import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined"

function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.35,
  rootMargin = "0px 0px -15% 0px",
}) {
  const ref = React.useRef(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    if (shown) return

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }

    const el = ref.current
    if (!el) {
      setShown(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold, root: null, rootMargin }
    )

    obs.observe(el)

    return () => {
      try {
        obs.disconnect()
      } catch {}
    }
  }, [shown, threshold, rootMargin])

  return (
    <div ref={ref}>
      <motion.div
        initial={false}
        animate={
          shown
            ? { opacity: 1, marginTop: 0, filter: "blur(0px)" }
            : { opacity: 0, marginTop: 24, filter: "blur(2px)" }
        }
        transition={{ duration: 0.85, ease: "easeOut", delay }}
        style={{ willChange: "opacity, margin, filter" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default class login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loginEmail: "",
      loginPassword: "",
      resetOpen: false,
      resetEmail: "",

      signUpEmail: "",
      signUpPassword: "",
      signUpConfPassword: "",

      loginSubmitting: false,
      signUpSubmitting: false,
      loginSuccess: "",
      loginError: "",
      signUpSuccess: "",
      signUpError: "",
      touched: {},
    }

    this.handleChange = this.handleChange.bind(this)
    this.setTouched = this.setTouched.bind(this)
    this.logIn = this.logIn.bind(this)
    this.sendPasswordReset = this.sendPasswordReset.bind(this)
    this.createAccount = this.createAccount.bind(this)
  }

  styles() {
    const CREAM = "#EFE7DC"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"

    return {
      page: {
        backgroundColor: CREAM,
        minHeight: "100vh",
        overflowX: "hidden",
      },

      heroWrap: {
        position: "relative",
        width: "100%",
        overflow: "hidden",
      },

      heroBg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center top",
        display: "block",
        zIndex: 0,
      },

      heroOverlay: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 38%, rgba(48,71,66,0.18) 100%)",
      },

      heroContent: {
        position: "relative",
        zIndex: 1,
        paddingTop: 50,
        paddingBottom: 34,
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
      },

      titleArea: {
        position: "relative",
        width: "100%",
        height: "clamp(260px, 46vw, 520px)",
      },

      titleCenter: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      },

      titleStack: {
        display: "grid",
        gap: 14,
        justifyItems: "center",
        padding: "clamp(14px, 3vw, 34px)",
        textAlign: "center",
      },

      heroTitle: {
        fontFamily: "Brasika",
        color: CREAM,
        letterSpacing: "clamp(0.5px, 0.15vw, 0.8px)",
        fontSize: "clamp(36px, 6vw, 78px)",
        lineHeight: 1.02,
        textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
        padding: "0 6px",
        maxWidth: 980,
        textTransform: "lowercase",
        textAlign: "center",
      },

      heroSub: {
        paddingTop: 20,
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: "clamp(15px, 1.6vw, 20px)",
        lineHeight: 1.75,
        maxWidth: 760,
        textShadow: "0 8px 22px rgba(0,0,0,0.45)",
        textAlign: "center",
        margin: "0 auto",
      },

      heroPanelWrap: {
        position: "relative",
        paddingTop: 18,
        maxWidth: 1320,
        margin: "0 auto",
      },

      heroPanel: {
        maxWidth: 1240,
        margin: "0 auto",
      },

      card: {
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        height: "100%",
        border: "1px solid rgba(48,71,66,0.18)",
        background: CREAM,
        boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
      },

      cardGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(700px 240px at 0% 0%, rgba(233,118,91,0.08), rgba(255,255,255,0))," +
          "radial-gradient(700px 260px at 100% 0%, rgba(48,71,66,0.06), rgba(255,255,255,0))",
        zIndex: 0,
      },

      cardInner: {
        position: "relative",
        zIndex: 1,
        padding: "clamp(24px, 3vw, 38px)",
      },

      titleRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 4,
      },

      titleLeft: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      },

      floralDot: {
        width: 42,
        height: 42,
        minWidth: 42,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: CREAM,
        background: `linear-gradient(180deg, ${ORANGE}, #d86245)`,
        boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
      },

      sectionTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(26px, 3vw, 38px)",
        lineHeight: 1.04,
      },

      sectionSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        opacity: 0.95,
        marginTop: 6,
        lineHeight: 1.85,
        maxWidth: 820,
      },

      divider: {
        opacity: 0.18,
        marginTop: 18,
        marginBottom: 24,
        borderColor: GREEN,
      },

      sectionWrap: {
        position: "relative",
        background: CREAM,
      },

      accentTL: {
        position: "absolute",
        top: 20,
        left: 0,
        width: "12vw",
        height: "auto",
        transform: "scaleY(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      accentBR: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "12vw",
        height: "auto",
        transform: "scaleX(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      lowerContent: {
        position: "relative",
        zIndex: 1,
        paddingTop: 54,
        paddingBottom: 72,
        paddingLeft: "clamp(22px, 6vw, 96px)",
        paddingRight: "clamp(22px, 6vw, 96px)",
      },

      fieldSx: {
        "& .MuiInputLabel-root": {
          color: "rgba(48,71,66,0.72)",
          fontFamily: "GeorgiaB",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: GREEN,
        },
        "& .MuiOutlinedInput-root": {
          color: GREEN,
          backgroundColor: "rgba(255,255,255,0.62)",
          borderRadius: 12,
          fontFamily: "GeorgiaB",
          "& fieldset": {
            borderColor: "rgba(48,71,66,0.18)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(48,71,66,0.35)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "rgba(48,71,66,0.55)",
          },
        },
        "& .MuiFormHelperText-root": {
          color: "rgba(48,71,66,0.72)",
          fontFamily: "GeorgiaB",
          marginLeft: 2,
        },
      },

      helper: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        opacity: 0.88,
        lineHeight: 1.85,
      },

      pillBtn: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "11px 20px",
        border: `1px solid rgba(48,71,66,0.18)`,
        color: GREEN,
        background: "rgba(255,255,255,0.58)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
      },

      solidBtn: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "11px 20px",
        border: `1px solid ${GREEN}`,
        color: CREAM,
        background: GREEN,
        boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
      },

      alertError: {
        borderRadius: 16,
        background: "rgba(233,118,91,0.12)",
        color: GREEN,
        border: "1px solid rgba(233,118,91,0.22)",
        fontFamily: "GeorgiaB",
      },

      alertSuccess: {
        borderRadius: 16,
        background: "rgba(48,71,66,0.08)",
        color: GREEN,
        border: "1px solid rgba(48,71,66,0.18)",
        fontFamily: "GeorgiaB",
      },

      bottomBody: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.9,
        textAlign: "center",
        maxWidth: 920,
        margin: "0 auto",
      },
    }
  }

  setTouched(key) {
    this.setState((prev) => ({
      touched: { ...prev.touched, [key]: true },
    }))
  }

  handleChange(event) {
    const target = event.target
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value,
      loginSuccess: "",
      loginError: "",
      signUpSuccess: "",
      signUpError: "",
    })
  }

  validateLogin() {
    const errors = {}
    const email = String(this.state.loginEmail || "").trim()
    const password = String(this.state.loginPassword || "")
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

    if (!email) errors.loginEmail = "Email is required."
    else if (!isEmail(email)) errors.loginEmail = "Please enter a valid email."

    if (!password) errors.loginPassword = "Password is required."

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

  validateSignUp() {
    const errors = {}
    const email = String(this.state.signUpEmail || "").trim()
    const password = String(this.state.signUpPassword || "")
    const confPassword = String(this.state.signUpConfPassword || "")
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

    if (!email) errors.signUpEmail = "Email is required."
    else if (!isEmail(email)) errors.signUpEmail = "Please enter a valid email."

    if (!password) errors.signUpPassword = "Password is required."
    if (!confPassword) errors.signUpConfPassword = "Please confirm your password."
    if (password && confPassword && password !== confPassword) {
      errors.signUpConfPassword = "Passwords do not match."
    }

    return errors
  }

  async logIn() {
    this.setState((prev) => ({
      loginSuccess: "",
      loginError: "",
      touched: {
        ...prev.touched,
        loginEmail: true,
        loginPassword: true,
      },
    }))

    const errors = this.validateLogin()
    if (Object.keys(errors).length) {
      this.setState({ loginError: "Please enter your email and password." })
      return
    }

    try {
      this.setState({ loginSubmitting: true, loginError: "", loginSuccess: "" })

      await signInWithEmailAndPassword(
        auth,
        String(this.state.loginEmail || "").trim(),
        String(this.state.loginPassword || "")
      )

      window.location.href = "/moments"
    } catch (error) {
      this.setState({
        loginSubmitting: false,
        loginSuccess: "",
        loginError: error?.message || "Login failed. Please try again.",
      })
    }
  }

  async sendPasswordReset() {
    this.setState((prev) => ({
      loginSuccess: "",
      loginError: "",
      touched: {
        ...prev.touched,
        resetEmail: true,
      },
    }))

    const errors = this.validateReset()
    if (Object.keys(errors).length) {
      this.setState({ loginError: "Please enter a valid email for password reset." })
      return
    }

    try {
      this.setState({ loginSubmitting: true, loginError: "", loginSuccess: "" })

      await sendPasswordResetEmail(auth, String(this.state.resetEmail || "").trim())

      this.setState({
        loginSubmitting: false,
        loginSuccess: `Password reset link sent to ${String(this.state.resetEmail || "").trim()}`,
        loginError: "",
      })
    } catch (error) {
      this.setState({
        loginSubmitting: false,
        loginSuccess: "",
        loginError: error?.message || "Unable to send password reset email.",
      })
    }
  }

  async createAccount() {
    this.setState((prev) => ({
      signUpSuccess: "",
      signUpError: "",
      touched: {
        ...prev.touched,
        signUpEmail: true,
        signUpPassword: true,
        signUpConfPassword: true,
      },
    }))

    const errors = this.validateSignUp()
    if (Object.keys(errors).length) {
      const firstKey = Object.keys(errors)[0]
      this.setState({
        signUpError: errors[firstKey] || "Please complete the required fields.",
      })
      return
    }

    try {
      this.setState({
        signUpSubmitting: true,
        signUpError: "",
        signUpSuccess: "",
      })

      const email = String(this.state.signUpEmail || "").trim()
      const password = String(this.state.signUpPassword || "")

      const authUser = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, "users", authUser.user.uid), {
        email,
        createdAt: serverTimestamp(),
      })

      window.location.href = "/moments"
    } catch (error) {
      this.setState({
        signUpSubmitting: false,
        signUpSuccess: "",
        signUpError:
          error?.message || "Something went wrong while creating your account.",
      })
    }
  }

  renderSectionShell(content) {
    const s = this.styles()

    return (
      <div style={s.sectionWrap}>
        <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTL} />
        <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBR} />
        <div style={s.lowerContent}>{content}</div>
      </div>
    )
  }

  renderLoginCard(s, showErr) {
    const loginErrors = this.validateLogin()
    const resetErrors = this.validateReset()

    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <LockOutlinedIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  {this.state.resetOpen ? "Reset Password" : "Log In"}
                </Typography>
                <Typography variant="body1" style={s.sectionSub}>
                  {this.state.resetOpen
                    ? "Enter your email and we’ll send you a password reset link."
                    : "Sign in to continue to your account and private pages."}
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <Grid container spacing={2}>
            {!this.state.resetOpen ? (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="loginEmail"
                    type="email"
                    value={this.state.loginEmail}
                    onChange={this.handleChange}
                    onBlur={() => this.setTouched("loginEmail")}
                    error={showErr("loginEmail", loginErrors)}
                    helperText={
                      showErr("loginEmail", loginErrors) ? loginErrors.loginEmail : " "
                    }
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
                    name="loginPassword"
                    type="password"
                    value={this.state.loginPassword}
                    onChange={this.handleChange}
                    onBlur={() => this.setTouched("loginPassword")}
                    error={showErr("loginPassword", loginErrors)}
                    helperText={
                      showErr("loginPassword", loginErrors) ? loginErrors.loginPassword : " "
                    }
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

                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="button"
                    style={s.pillBtn}
                    disabled={this.state.loginSubmitting}
                    onClick={() =>
                      this.setState({
                        resetOpen: true,
                        loginError: "",
                        loginSuccess: "",
                        touched: {},
                      })
                    }
                  >
                    Forgot password?
                  </Button>

                  <Button
                    type="button"
                    style={s.solidBtn}
                    disabled={this.state.loginSubmitting}
                    onClick={this.logIn}
                  >
                    {this.state.loginSubmitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CircularProgress size={18} style={{ color: "#EFE7DC" }} />
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
                    helperText={
                      showErr("resetEmail", resetErrors) ? resetErrors.resetEmail : " "
                    }
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

                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="button"
                    style={s.pillBtn}
                    disabled={this.state.loginSubmitting}
                    onClick={() =>
                      this.setState({
                        resetOpen: false,
                        resetEmail: "",
                        loginError: "",
                        loginSuccess: "",
                        touched: {},
                      })
                    }
                  >
                    Back to login
                  </Button>

                  <Button
                    type="button"
                    style={s.solidBtn}
                    disabled={this.state.loginSubmitting}
                    onClick={this.sendPasswordReset}
                  >
                    {this.state.loginSubmitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CircularProgress size={18} style={{ color: "#EFE7DC" }} />
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
                {this.state.loginError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: 8 }}
                  >
                    <Alert severity="error" style={s.alertError}>
                      {this.state.loginError}
                    </Alert>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {this.state.loginSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: this.state.loginError ? 10 : 8 }}
                  >
                    <Alert severity="success" style={s.alertSuccess}>
                      {this.state.loginSuccess}
                    </Alert>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Grid>
          </Grid>
        </div>
      </Card>
    )
  }

  renderSignupCard(s, showErr) {
    const signUpErrors = this.validateSignUp()

    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <PersonAddAltOutlinedIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  Sign Up
                </Typography>
                <Typography variant="body1" style={s.sectionSub}>
                  Create an account with your email and password to get started.
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="signUpEmail"
                type="email"
                value={this.state.signUpEmail}
                onChange={this.handleChange}
                onBlur={() => this.setTouched("signUpEmail")}
                error={showErr("signUpEmail", signUpErrors)}
                helperText={
                  showErr("signUpEmail", signUpErrors) ? signUpErrors.signUpEmail : " "
                }
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
                name="signUpPassword"
                type="password"
                value={this.state.signUpPassword}
                onChange={this.handleChange}
                onBlur={() => this.setTouched("signUpPassword")}
                error={showErr("signUpPassword", signUpErrors)}
                helperText={
                  showErr("signUpPassword", signUpErrors)
                    ? signUpErrors.signUpPassword
                    : " "
                }
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
                name="signUpConfPassword"
                type="password"
                value={this.state.signUpConfPassword}
                onChange={this.handleChange}
                onBlur={() => this.setTouched("signUpConfPassword")}
                error={showErr("signUpConfPassword", signUpErrors)}
                helperText={
                  showErr("signUpConfPassword", signUpErrors)
                    ? signUpErrors.signUpConfPassword
                    : " "
                }
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
                {this.state.signUpError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert severity="error" style={s.alertError}>
                      {this.state.signUpError}
                    </Alert>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {this.state.signUpSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: 12 }}
                  >
                    <Alert severity="success" style={s.alertSuccess}>
                      {this.state.signUpSuccess}
                    </Alert>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Grid>

            <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button
                type="button"
                style={s.pillBtn}
                disabled={this.state.signUpSubmitting}
                onClick={() =>
                  this.setState({
                    signUpEmail: "",
                    signUpPassword: "",
                    signUpConfPassword: "",
                    signUpError: "",
                    signUpSuccess: "",
                    touched: {},
                  })
                }
              >
                Clear
              </Button>

              <Button
                type="button"
                style={s.solidBtn}
                disabled={this.state.signUpSubmitting}
                onClick={this.createAccount}
              >
                {this.state.signUpSubmitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CircularProgress size={18} style={{ color: "#EFE7DC" }} />
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
    )
  }

  render() {
    const s = this.styles()
    const showErr = (key, bag) => Boolean(this.state.touched[key] && bag[key])

    return (
      <div style={s.page}>
        <Head>
          <title>Login | Island Flourish</title>
          <meta name="keywords" content="Sign up, Log In" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Log in or create an account with Island Flourish."
          />
        </Head>

        <div style={s.heroWrap}>
          <img src="/splash.png" alt="Island Flourish flowers" style={s.heroBg} />
          <div style={s.heroOverlay} />

          <div style={s.heroContent}>
            <Grid container style={{ width: "100%" }}>
              <Grid item xs={12}>
                <div style={s.titleArea}>
                  <div style={s.titleCenter}>
                    <RevealOnScroll>
                      <div style={s.titleStack}>
                        <Typography component="h1" style={s.heroTitle}>
                          login
                        </Typography>

                        <Typography variant="body1" style={s.heroSub}>
                          Access your account or create one to continue with Island Flourish.
                        </Typography>
                      </div>
                    </RevealOnScroll>
                  </div>
                </div>
              </Grid>
            </Grid>

            <RevealOnScroll delay={0.06} threshold={0.25} rootMargin="0px 0px -10% 0px">
              <div style={s.heroPanelWrap}>
                <div style={s.heroPanel}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      {this.renderLoginCard(s, showErr)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {this.renderSignupCard(s, showErr)}
                    </Grid>
                  </Grid>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>

        <RevealOnScroll delay={0.03} threshold={0.25}>
          {this.renderSectionShell(
            <Card style={s.card} elevation={0}>
              <div style={s.cardGlow} />
              <div style={s.cardInner}>
                <div style={s.titleRow}>
                  <div style={s.titleLeft}>
                    <div style={s.floralDot}>
                      <EmailOutlinedIcon />
                    </div>

                    <div>
                      <Typography variant="h4" style={s.sectionTitle}>
                        Account Access
                      </Typography>
                      <Typography variant="body1" style={s.sectionSub}>
                        Log in to continue, reset your password if needed, or create a new
                        account to get started.
                      </Typography>
                    </div>
                  </div>
                </div>

                <Divider style={s.divider} />

                <Typography variant="body1" style={s.bottomBody}>
                  This page follows the same Island Flourish visual language as your A La
                  Carte page, including the floral splash hero, cream and green palette, soft
                  card glow, Brasika headings, Georgia body copy, and top-left / bottom-right
                  accent corners.
                </Typography>
              </div>
            </Card>
          )}
        </RevealOnScroll>
      </div>
    )
  }
}