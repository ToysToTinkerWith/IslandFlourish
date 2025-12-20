// pages/contact/EventFlowersForm.js (or components/EventFlowersForm.js)
// Theme-matched MUI + framer-motion form that writes to Firestore on submit.

import React from "react"
import { db } from "../Firebase/FirebaseInit"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

import Head from "next/head"

import { motion, AnimatePresence } from "framer-motion"

import {
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material"

import LocalFloristIcon from "@mui/icons-material/LocalFlorist"

export default class EventFlowersForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: "",
      email: "",
      phone: "",
      preferredReach: "Email", // "Email" | "Phone"
      eventType: "",
      eventDate: "",
      budget: "",
      details: "",

      submitting: false,
      success: false,
      error: "",
      touched: {},
    }
  }

  styles() {
    const BG = "#121212"
    const ACCENT = "#6BAA6A"
    const GLASS = "rgba(255,255,255,0.04)"
    const BORDER = "rgba(107,170,106,0.22)"

    return {
      page: { backgroundColor: BG, minHeight: "100vh", overflowX: "hidden" },
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

      label: { color: "rgba(107,170,106,0.90)" },
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

      // MUI TextField overrides (inline via sx)
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

        // ✅ Make MUI Select dropdown arrow white
        "& .MuiSelect-icon": { color: "rgba(255,255,255,0.92)" },

        // ✅ Make native date/calendar icon white (Chrome/Edge/Safari)
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          filter: "invert(1)",
          opacity: 0.9,
          cursor: "pointer",
        },
      },

      radioSx: {
        "& .MuiFormLabel-root": { color: "rgba(107,170,106,0.90)" },
        "& .MuiRadio-root": { color: "rgba(107,170,106,0.70)" },
        "& .MuiRadio-root.Mui-checked": { color: "rgba(107,170,106,1)" },
        "& .MuiTypography-root": { color: "rgba(255,255,255,0.90)" },
      },

      // NEW: Direct email callout styling
      directAlert: {
        borderRadius: 18,
        background: "rgba(107,170,106,0.10)",
        color: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(107,170,106,0.22)",
        marginTop: 12,
        marginBottom: 12,
      },
      directLink: {
        color: "rgba(107,170,106,1)",
        textDecoration: "underline",
        fontWeight: 800,
      },
    }
  }

  setTouched = (key) => {
    this.setState((prev) => ({ touched: { ...prev.touched, [key]: true } }))
  }

  validate() {
    const errors = {}

    const isEmail = (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

    if (!String(this.state.name || "").trim()) errors.name = "Name is required."
    if (!String(this.state.email || "").trim()) errors.email = "Email is required."
    else if (!isEmail(this.state.email)) errors.email = "Please enter a valid email."
    if (!String(this.state.phone || "").trim()) errors.phone = "Phone is required."
    if (!String(this.state.preferredReach || "").trim())
      errors.preferredReach = "Please select a preferred contact method."
    if (!String(this.state.eventType || "").trim()) errors.eventType = "Event type is required."
    if (!String(this.state.eventDate || "").trim()) errors.eventDate = "Event date is required."

    return errors
  }

  async handleSubmit(e) {
    e.preventDefault()

    this.setState({
      success: false,
      error: "",
      touched: {
        name: true,
        email: true,
        phone: true,
        preferredReach: true,
        eventType: true,
        eventDate: true,
        budget: true,
        details: true,
      },
    })

    const errors = this.validate()
    if (Object.keys(errors).length) {
      this.setState({ error: "Please complete the required fields." })
      return
    }

    try {
      this.setState({ submitting: true, error: "" })

      await addDoc(collection(db, "eventInquiries"), {
        name: String(this.state.name || "").trim(),
        email: String(this.state.email || "").trim(),
        phone: String(this.state.phone || "").trim(),
        preferredReach: this.state.preferredReach,
        eventType: String(this.state.eventType || "").trim(),
        eventDate: this.state.eventDate,
        budget: this.state.budget || "",
        details: String(this.state.details || "").trim(),
        createdAt: serverTimestamp(),
        source: this.props.source || "web",
      })

      this.setState({
        submitting: false,
        success: true,
        error: "",
        name: "",
        email: "",
        phone: "",
        preferredReach: "Email",
        eventType: "",
        eventDate: "",
        budget: "",
        details: "",
        touched: {},
      })
    } catch (err) {
      console.error(err)
      this.setState({
        submitting: false,
        success: false,
        error: "Something went wrong while submitting. Please try again in a moment.",
      })
    }
  }

  render() {
    const s = this.styles()
    const errors = this.validate()

    const showErr = (key) => Boolean(this.state.touched[key] && errors[key])

    const budgets = [
      "Under $1,500",
      "$1,500 - $3,000",
      "$3,000 - $5,000",
      "$5,000 - $7,000",
      "$7,000 - $10,000",
      "Over $10,000",
    ]

    // NEW: configurable direct-email option (pass as props if you want)
    const directEmail = this.props.directEmail || "events@islandflourish.com"
    const directSubject = encodeURIComponent("Event Flowers Inquiry")
    const directBody = encodeURIComponent(
      "Hi Island Flourish team,\n\nI'm interested in event florals. Here are a few details:\n- Event Type:\n- Event Date:\n- Venue/Location:\n- Estimated Budget:\n- Notes:\n\nThank you!"
    )
    const mailtoHref = `mailto:${directEmail}?subject=${directSubject}&body=${directBody}`

    return (
      <div style={s.page}>
        <Head>
          <title>Event Flowers Inquiry</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Tell us about your event and we will reach out to discuss floral design."
          />
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
                <LocalFloristIcon style={{ color: "#6BAA6A" }} />
                <div>
                  <Typography variant="h4" style={s.heroTitle}>
                    Event Flowers Inquiry
                  </Typography>
                  <Typography variant="body1" style={s.heroSub}>
                    Share a few details and we’ll reach out to plan something beautiful.
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
                Tell us about your event
              </Typography>

              

              <Divider style={{ opacity: 0.12, marginTop: 12, marginBottom: 14 }} />

              <form onSubmit={(e) => this.handleSubmit(e)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={this.state.name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                      onBlur={() => this.setTouched("name")}
                      error={showErr("name")}
                      helperText={showErr("name") ? errors.name : " "}
                      sx={s.fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={this.state.email}
                      onChange={(e) => this.setState({ email: e.target.value })}
                      onBlur={() => this.setTouched("email")}
                      error={showErr("email")}
                      helperText={showErr("email") ? errors.email : " "}
                      sx={s.fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={this.state.phone}
                      onChange={(e) => this.setState({ phone: e.target.value })}
                      onBlur={() => this.setTouched("phone")}
                      error={showErr("phone")}
                      helperText={showErr("phone") ? errors.phone : " "}
                      sx={s.fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset" sx={{ width: "100%", ...s.radioSx }}>
                      <FormLabel component="legend">How do you prefer to be reached </FormLabel>
                      <RadioGroup
                        row
                        value={this.state.preferredReach}
                        onChange={(e) => this.setState({ preferredReach: e.target.value })}
                        onBlur={() => this.setTouched("preferredReach")}
                      >
                        <FormControlLabel value="Phone" control={<Radio />} label="Phone" />
                        <FormControlLabel value="Email" control={<Radio />} label="Email" />
                      </RadioGroup>
                      <Typography variant="caption" style={s.helper}>
                        {showErr("preferredReach") ? errors.preferredReach : " "}
                      </Typography>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Event Type"
                      placeholder="Wedding, Birthday, Bridal Shower, etc."
                      value={this.state.eventType}
                      onChange={(e) => this.setState({ eventType: e.target.value })}
                      onBlur={() => this.setTouched("eventType")}
                      error={showErr("eventType")}
                      helperText={showErr("eventType") ? errors.eventType : " "}
                      sx={s.fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Event Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={this.state.eventDate}
                      onChange={(e) => this.setState({ eventDate: e.target.value })}
                      onBlur={() => this.setTouched("eventDate")}
                      error={showErr("eventDate")}
                      helperText={showErr("eventDate") ? errors.eventDate : " "}
                      sx={s.fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Estimated Budget for Florals"
                      value={this.state.budget}
                      onChange={(e) => this.setState({ budget: e.target.value })}
                      onBlur={() => this.setTouched("budget")}
                      sx={s.fieldSx}
                    >
                      {budgets.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={5}
                      label="Describe your event / Details and notes"
                      value={this.state.details}
                      onChange={(e) => this.setState({ details: e.target.value })}
                      onBlur={() => this.setTouched("details")}
                      helperText="Tell us the vibe, colors, venue, guest count, and anything you love."
                      sx={s.fieldSx}
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
                            Submitted successfully. We’ll reach out soon.
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
                          name: "",
                          email: "",
                          phone: "",
                          preferredReach: "Email",
                          eventType: "",
                          eventDate: "",
                          budget: "",
                          details: "",
                          error: "",
                          success: false,
                          touched: {},
                        })
                      }
                    >
                      Clear
                    </Button>

                    <Button type="submit" style={s.pillBtnSolid} disabled={this.state.submitting}>
                      {this.state.submitting ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <CircularProgress size={18} style={{ color: "#0f1410" }} />
                          Submitting…
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Card>
          {/* NEW: Direct email option at the top */}
              <Alert
                severity="info"
                icon={<LocalFloristIcon style={{ color: "rgba(107,170,106,0.95)" }} />}
                style={s.directAlert}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" style={{ color: "rgba(255,255,255,0.90)" }}>
                    Prefer to email a team member directly? Reach us at{" "}
                    <a href={mailtoHref} style={s.directLink}>
                      {directEmail}
                    </a>
                    .
                  </Typography>

                  <Button
                    component="a"
                    href={mailtoHref}
                    style={s.pillBtn}
                    disabled={this.state.submitting}
                  >
                    Email a team member
                  </Button>
                </div>
              </Alert>
        </div>
      </div>
    )
  }
}
