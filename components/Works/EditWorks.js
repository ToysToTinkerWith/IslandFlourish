// components/EditWorks.js
// Island Flourish themed version matching NewWorks.js
// Full code change:
// - Restyles EditWorks to match the cream / green / orange Island Flourish look
// - Removes sharp blob background shapes
// - Keeps soft faded circular background glows
// - Preserves your Firestore / Storage logic fixes

import React from "react"

import { db } from "../../Firebase/FirebaseInit"
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore"

import { storage } from "../../Firebase/FirebaseInit"
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage"

import { motion, AnimatePresence } from "framer-motion"

import {
  Modal,
  Button,
  TextField,
  Typography,
  Card,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  CircularProgress,
} from "@mui/material"

import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

export default class EditWorks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      item: "",
      collection: "",
      date: "",
      oldPictures: [], // [ [data, docId], ... ]
      newPictures: [], // File[] w/ .id added

      progress: 0,
      submitting: false,
      error: "",
      success: "",
      touched: {},

      pictureWarning: false,
      deleteWarning: false,
      viewPicture: null,
    }

    this.handleChange = this.handleChange.bind(this)
    this.handlePicture = this.handlePicture.bind(this)
    this.deletePicture = this.deletePicture.bind(this)
    this.deletePictureFirebase = this.deletePictureFirebase.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.updateWork = this.updateWork.bind(this)
    this.setTouched = this.setTouched.bind(this)
  }

  styles() {
    const CREAM = "#EFE7DC"
    const CREAM_SOFT = "#F7F1E8"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"
    const BORDER = "rgba(48,71,66,0.18)"

    return {
      page: {
        background: "transparent",
        minHeight: "100%",
        overflowX: "hidden",
      },

      shell: {
        maxWidth: 980,
        margin: "0 auto",
        padding: "8px 4px 10px",
      },

      hero: {
        position: "relative",
        borderRadius: 24,
        padding: "22px 18px",
        border: `1px solid ${BORDER}`,
        background:
          "linear-gradient(180deg, rgba(239,231,220,0.80), rgba(247,241,232,0.78))",
        overflow: "hidden",
        marginBottom: 18,
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
      },

      heroInner: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        position: "relative",
        zIndex: 2,
      },

      heroTitle: {
        color: GREEN,
        fontFamily: "Brasika",
        letterSpacing: 0.4,
        lineHeight: 1.02,
      },

      heroSub: {
        color: GREEN,
        opacity: 0.88,
        marginTop: 6,
        fontFamily: "Georgia",
        lineHeight: 1.7,
      },

      fadedCircle: ({
        top = "auto",
        left = "auto",
        right = "auto",
        bottom = "auto",
        size = 220,
        color = "rgba(233,118,91,0.14)",
        blur = 10,
        opacity = 1,
      }) => ({
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 72%)`,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
      }),

      sectionCard: {
        borderRadius: 24,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.72)",
        padding: 16,
        marginTop: 16,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
      },

      cardGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 10% 12%, rgba(233,118,91,0.10) 0%, rgba(233,118,91,0) 30%)," +
          "radial-gradient(circle at 88% 14%, rgba(48,71,66,0.09) 0%, rgba(48,71,66,0) 30%)," +
          "radial-gradient(circle at 52% 110%, rgba(239,231,220,0.35) 0%, rgba(239,231,220,0) 36%)",
      },

      helper: {
        color: GREEN,
        opacity: 0.72,
        fontFamily: "Georgia",
      },

      pillBtn: {
        borderRadius: 12,
        border: `1px solid ${GREEN}`,
        padding: "10px 16px",
        color: GREEN,
        textTransform: "none",
        background: CREAM,
        boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
        fontFamily: "GeorgiaB",
      },

      pillBtnDanger: {
        borderRadius: 12,
        border: `1px solid ${ORANGE}`,
        padding: "10px 16px",
        color: ORANGE,
        textTransform: "none",
        background: "rgba(233,118,91,0.08)",
        boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
        fontFamily: "GeorgiaB",
      },

      pillBtnSolid: {
        borderRadius: 12,
        border: `1px solid ${GREEN}`,
        padding: "10px 16px",
        color: CREAM,
        textTransform: "none",
        background: `linear-gradient(180deg, ${ORANGE}, #d86245)`,
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        fontFamily: "GeorgiaB",
      },

      fieldSx: {
        "& .MuiInputLabel-root": {
          color: `${GREEN} !important`,
          fontFamily: "Georgia",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: `${GREEN} !important`,
        },
        "& .MuiOutlinedInput-root": {
          color: GREEN,
          backgroundColor: "rgba(247,241,232,0.78)",
          borderRadius: 3,
          fontFamily: "Georgia",
          "& fieldset": { borderColor: BORDER },
          "&:hover fieldset": { borderColor: "rgba(48,71,66,0.30)" },
          "&.Mui-focused fieldset": { borderColor: "rgba(48,71,66,0.55)" },
        },
        "& .MuiFormHelperText-root": {
          color: `${GREEN} !important`,
          opacity: 0.72,
          fontFamily: "Georgia",
        },
        "& textarea, & input": {
          fontFamily: "Georgia",
        },
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          opacity: 0.8,
          cursor: "pointer",
        },
      },

      thumbWrap: {
        borderRadius: 18,
        border: `1px solid ${BORDER}`,
        background: "rgba(247,241,232,0.86)",
        padding: 12,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      },

      thumbGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 14% 16%, rgba(233,118,91,0.08) 0%, rgba(233,118,91,0) 32%)," +
          "radial-gradient(circle at 86% 12%, rgba(48,71,66,0.07) 0%, rgba(48,71,66,0) 30%)",
      },

      thumbImgBtn: {
        borderRadius: 14,
        border: "1px solid rgba(48,71,66,0.12)",
        padding: 0,
        overflow: "hidden",
        minWidth: 0,
        background: CREAM_SOFT,
        width: "100%",
      },

      thumbImg: {
        width: "100%",
        height: 120,
        objectFit: "cover",
        display: "block",
      },

      modalPaper: {
        background:
          "linear-gradient(180deg, rgba(247,241,232,0.98), rgba(242,234,223,0.98))",
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        padding: 12,
        outline: "none",
        maxWidth: 1100,
        width: "92vw",
        margin: "4vh auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      },

      confirmPaper: {
        background:
          "linear-gradient(180deg, rgba(247,241,232,0.98), rgba(242,234,223,0.98))",
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        padding: 18,
        outline: "none",
        width: "min(520px, 92vw)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        position: "relative",
        overflow: "hidden",
      },

      sectionTitle: {
        color: GREEN,
        fontWeight: 700,
        fontFamily: "Brasika",
        letterSpacing: 0.3,
      },

      thumbLabel: {
        color: GREEN,
        fontWeight: 700,
        fontFamily: "GeorgiaB",
      },

      iconBtnView: {
        color: GREEN,
        background: "rgba(48,71,66,0.05)",
      },

      iconBtnDelete: {
        color: ORANGE,
        background: "rgba(233,118,91,0.06)",
      },

      divider: {
        opacity: 0.15,
        marginTop: 12,
        marginBottom: 14,
        borderColor: GREEN,
      },

      progressBox: {
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        background: "rgba(247,241,232,0.82)",
        padding: 12,
      },

      progressTitle: {
        color: GREEN,
        fontWeight: 700,
        fontFamily: "GeorgiaB",
      },

      alertError: {
        borderRadius: 16,
        background: "rgba(233,118,91,0.12)",
        color: GREEN,
        border: "1px solid rgba(233,118,91,0.24)",
        fontFamily: "Georgia",
      },

      alertSuccess: {
        borderRadius: 16,
        background: "rgba(48,71,66,0.08)",
        color: GREEN,
        border: "1px solid rgba(48,71,66,0.18)",
        fontFamily: "Georgia",
      },
    }
  }

  setTouched(key) {
    this.setState((prev) => ({ touched: { ...prev.touched, [key]: true } }))
  }

  componentDidMount() {
    this.setState({ newPictures: [], error: "", success: "" })

    const worksRef = doc(db, "works", this.props.work)

    this.unsub = onSnapshot(worksRef, (snap) => {
      const data = snap.data()
      if (!data) return

      this.setState({
        item: data.item ?? "",
        collection: data.collection ?? "",
        date: data.date ?? "",
      })

      const imgsRef = collection(db, "works", this.props.work, "imgs")
      this.unsub2 = onSnapshot(imgsRef, (querySnap) => {
        const next = []
        querySnap.forEach((d) => next.push([d.data(), d.id]))
        this.setState({ oldPictures: next })
      })
    })
  }

  componentWillUnmount() {
    try {
      if (this.unsub) this.unsub()
      if (this.unsub2) this.unsub2()
    } catch {}
  }

  handleChange(event) {
    const target = event.target
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value,
      error: "",
      success: "",
    })
  }

  handlePicture = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const stamped = files.map((f) => {
      const nf = f
      nf.id = Math.random().toString(20).slice(2)
      return nf
    })

    this.setState((prev) => ({
      newPictures: [...(prev.newPictures || []), ...stamped],
      error: "",
      success: "",
    }))
    e.target.value = null
  }

  deletePicture(pictureId) {
    const imgs = [...(this.state.newPictures || [])]
    const idx = imgs.findIndex((img) => img.id === pictureId)
    if (idx >= 0) imgs.splice(idx, 1)

    this.setState({
      newPictures: imgs,
      [pictureId]: "",
      error: "",
      success: "",
    })
  }

  async deletePictureFirebase(imgDocId) {
    const imgRef = doc(db, "works", this.props.work, "imgs", imgDocId)
    await deleteDoc(imgRef)
    this.setState({ pictureWarning: false, success: "Photo deleted.", error: "" })
  }

  async deleteItem() {
    try {
      this.setState({ submitting: true, error: "", success: "" })

      for (const tup of this.state.oldPictures || []) {
        const imgDocId = tup?.[1]
        if (imgDocId) await this.deletePictureFirebase(imgDocId)
      }

      const workRef = doc(db, "works", this.props.work)
      await deleteDoc(workRef)

      this.setState({
        deleteWarning: false,
        submitting: false,
        success: "Item deleted.",
        error: "",
      })
      this.props.closeModal?.()
    } catch (e) {
      console.error(e)
      this.setState({
        submitting: false,
        deleteWarning: false,
        error: e?.message || "Delete failed. Please try again.",
        success: "",
      })
    }
  }

  async updateWork() {
    try {
      this.setState({ submitting: true, progress: 0, error: "", success: "" })

      const imgsRef = collection(db, "works", this.props.work, "imgs")
      const imgQuery = await getDocs(imgsRef)

      imgQuery.forEach(async (img) => {
        const existing = img.data()?.message ?? ""
        const next =
          this.state[img.id] || this.state[img.id] === "" ? this.state[img.id] : existing

        const imgRef = doc(db, "works", this.props.work, "imgs", img.id)
        await updateDoc(imgRef, { message: next })
      })

      const workRef = doc(db, "works", this.props.work)
      await updateDoc(workRef, {
        item: this.state.item,
        collection: this.state.collection,
        date: this.state.date,
        updated: serverTimestamp(),
      })

      const uploadPictures = this.state.newPictures || []
      if (uploadPictures.length > 0) {
        for (let y = 0; y < uploadPictures.length; y++) {
          const file = uploadPictures[y]
          const imgRef = ref(storage, "worksImages/" + file.id)

          await uploadBytes(imgRef, file)

          await new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(imgRef, file)

            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const fileProgress = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )
                const overall = Math.round(
                  ((y + fileProgress / 100) / uploadPictures.length) * 100
                )
                this.setState({ progress: overall })
              },
              (error) => reject(error),
              async () => {
                try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                  const imgCol = collection(db, "works", this.props.work, "imgs")
                  const imgMessage = this.state[file.id] ? this.state[file.id] : ""

                  await addDoc(imgCol, {
                    url: downloadURL,
                    message: imgMessage,
                    created: file.lastModified,
                  })

                  resolve()
                } catch (e) {
                  reject(e)
                }
              }
            )
          })
        }
      }

      this.setState({
        submitting: false,
        success: "Updated successfully.",
        error: "",
        progress: 100,
        newPictures: [],
      })

      this.props.closeModal?.()
    } catch (e) {
      console.error(e)
      this.setState({
        submitting: false,
        error: e?.message || "Update failed. Please try again.",
        success: "",
      })
    }
  }

  render() {
    const s = this.styles()

    return (
      <div style={s.page}>
        <div style={s.shell}>
          <motion.div
            style={s.hero}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              style={s.fadedCircle({
                top: -90,
                left: -70,
                size: 260,
                color: "rgba(233,118,91,0.18)",
                blur: 14,
              })}
              animate={{ x: [0, 10, 0], y: [0, 8, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              style={s.fadedCircle({
                top: -20,
                right: -60,
                size: 280,
                color: "rgba(48,71,66,0.14)",
                blur: 16,
              })}
              animate={{ x: [0, -12, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            <div style={s.heroInner}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LocalFloristIcon style={{ color: "#304742" }} />
                <div>
                  <Typography variant="h4" style={s.heroTitle}>
                    Edit Work
                  </Typography>
                  <Typography variant="body1" style={s.heroSub}>
                    Update details, edit descriptions, add photos, or delete the item.
                  </Typography>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  type="button"
                  style={s.pillBtnDanger}
                  disabled={this.state.submitting}
                  onClick={() => this.setState({ deleteWarning: true })}
                >
                  Delete Item
                </Button>
              </div>
            </div>
          </motion.div>

          <Card style={s.sectionCard} elevation={0}>
            <div style={s.cardGlow} />
            <div
              style={s.fadedCircle({
                top: -70,
                left: -60,
                size: 220,
                color: "rgba(233,118,91,0.10)",
                blur: 14,
                opacity: 0.95,
              })}
            />
            <div
              style={s.fadedCircle({
                top: -60,
                right: -40,
                size: 190,
                color: "rgba(48,71,66,0.08)",
                blur: 14,
                opacity: 0.95,
              })}
            />

            <div style={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h5" style={s.sectionTitle}>
                Details
              </Typography>

              <Divider style={s.divider} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Collection Name"
                    name="collection"
                    value={this.state.collection}
                    onChange={this.handleChange}
                    sx={s.fieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    name="item"
                    value={this.state.item}
                    onChange={this.handleChange}
                    sx={s.fieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={this.state.date}
                    onChange={this.handleChange}
                    sx={s.fieldSx}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    style={s.pillBtn}
                    disabled={this.state.submitting}
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                  >
                    Add Photos
                    <input
                      type="file"
                      multiple
                      onChange={this.handlePicture}
                      style={{ width: 0, opacity: 0 }}
                    />
                  </Button>

                  <Typography variant="body2" style={s.helper}>
                    {this.state.newPictures.length} new selected
                  </Typography>
                </Grid>

                {this.state.oldPictures.length > 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="h6" style={s.sectionTitle}>
                      Existing Photos
                    </Typography>
                    <Typography variant="body2" style={s.helper}>
                      Edit descriptions and delete photos as needed.
                    </Typography>

                    <Divider style={s.divider} />

                    <Grid container spacing={2}>
                      {this.state.oldPictures.map((picture, index) => {
                        const data = picture?.[0] || {}
                        const imgId = picture?.[1]
                        const src = data.url
                        const currentMessage = this.state[imgId] ?? data.message ?? ""

                        return (
                          <Grid key={imgId || index} item xs={12} sm={6} md={4}>
                            <div style={s.thumbWrap}>
                              <div style={s.thumbGlow} />
                              <div
                                style={s.fadedCircle({
                                  top: -45,
                                  left: -30,
                                  size: 120,
                                  color: "rgba(233,118,91,0.08)",
                                  blur: 10,
                                })}
                              />
                              <div
                                style={s.fadedCircle({
                                  top: -35,
                                  right: -28,
                                  size: 110,
                                  color: "rgba(48,71,66,0.06)",
                                  blur: 10,
                                })}
                              />

                              <div style={{ position: "relative", zIndex: 2 }}>
                                <Button
                                  type="button"
                                  style={s.thumbImgBtn}
                                  onClick={() => this.setState({ viewPicture: src })}
                                  aria-label="View photo"
                                >
                                  <img src={src} alt="preview" style={s.thumbImg} />
                                </Button>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: 10,
                                    gap: 10,
                                  }}
                                >
                                  <Typography variant="subtitle2" style={s.thumbLabel}>
                                    Photo {index + 1}
                                  </Typography>

                                  <div style={{ display: "flex", gap: 6 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => this.setState({ viewPicture: src })}
                                      style={s.iconBtnView}
                                    >
                                      <VisibilityOutlinedIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                      size="small"
                                      onClick={() => this.setState({ pictureWarning: imgId })}
                                      style={s.iconBtnDelete}
                                    >
                                      <DeleteOutlineOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </div>
                                </div>

                                <TextField
                                  onChange={this.handleChange}
                                  multiline
                                  minRows={3}
                                  value={currentMessage}
                                  variant="outlined"
                                  type="text"
                                  label="Description"
                                  name={imgId}
                                  sx={{ ...s.fieldSx, marginTop: 10 }}
                                />
                              </div>
                            </div>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Grid>
                ) : null}

                {this.state.newPictures.length > 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="h6" style={s.sectionTitle}>
                      New Photos
                    </Typography>
                    <Typography variant="body2" style={s.helper}>
                      Add optional descriptions before saving.
                    </Typography>

                    <Divider style={s.divider} />

                    <Grid container spacing={2}>
                      {this.state.newPictures.map((picture, index) => {
                        const src = URL.createObjectURL(picture)
                        return (
                          <Grid key={picture.id || index} item xs={12} sm={6} md={4}>
                            <div style={s.thumbWrap}>
                              <div style={s.thumbGlow} />
                              <div
                                style={s.fadedCircle({
                                  top: -45,
                                  left: -30,
                                  size: 120,
                                  color: "rgba(233,118,91,0.08)",
                                  blur: 10,
                                })}
                              />
                              <div
                                style={s.fadedCircle({
                                  top: -35,
                                  right: -28,
                                  size: 110,
                                  color: "rgba(48,71,66,0.06)",
                                  blur: 10,
                                })}
                              />

                              <div style={{ position: "relative", zIndex: 2 }}>
                                <Button
                                  type="button"
                                  style={s.thumbImgBtn}
                                  onClick={() => this.setState({ viewPicture: src })}
                                  aria-label="View photo"
                                >
                                  <img src={src} alt="preview" style={s.thumbImg} />
                                </Button>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: 10,
                                    gap: 10,
                                  }}
                                >
                                  <Typography variant="subtitle2" style={s.thumbLabel}>
                                    New {index + 1}
                                  </Typography>

                                  <div style={{ display: "flex", gap: 6 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => this.setState({ viewPicture: src })}
                                      style={s.iconBtnView}
                                    >
                                      <VisibilityOutlinedIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                      size="small"
                                      onClick={() => this.deletePicture(picture.id)}
                                      style={s.iconBtnDelete}
                                    >
                                      <DeleteOutlineOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </div>
                                </div>

                                <TextField
                                  onChange={this.handleChange}
                                  multiline
                                  minRows={3}
                                  value={this.state[picture.id] || ""}
                                  variant="outlined"
                                  type="text"
                                  label="Description"
                                  name={picture.id}
                                  sx={{ ...s.fieldSx, marginTop: 10 }}
                                />
                              </div>
                            </div>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Grid>
                ) : null}

                <Grid item xs={12}>
                  <AnimatePresence>
                    {this.state.submitting ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={s.progressBox}>
                          <Typography variant="body2" style={s.progressTitle}>
                            Saving… {this.state.progress || 0}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={this.state.progress || 0}
                            style={{
                              marginTop: 10,
                              height: 10,
                              borderRadius: 999,
                              background: "rgba(48,71,66,0.08)",
                            }}
                          />
                          <Typography variant="caption" style={s.helper}>
                            Please keep this page open while changes complete.
                          </Typography>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {this.state.error ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginTop: 12 }}
                      >
                        <Alert severity="error" style={s.alertError}>
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
                        <Alert severity="success" style={s.alertSuccess}>
                          {this.state.success}
                        </Alert>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Grid>

                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="button"
                    style={s.pillBtn}
                    disabled={this.state.submitting}
                    onClick={() =>
                      this.setState({
                        progress: 0,
                        newPictures: [],
                        viewPicture: null,
                        pictureWarning: false,
                        deleteWarning: false,
                        error: "",
                        success: "",
                      })
                    }
                  >
                    Clear New Photos
                  </Button>

                  <Button
                    type="button"
                    style={s.pillBtnSolid}
                    disabled={this.state.submitting}
                    onClick={this.updateWork}
                  >
                    {this.state.submitting ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CircularProgress size={18} style={{ color: "#EFE7DC" }} />
                        Saving…
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Card>

          <AnimatePresence>
            {this.state.pictureWarning ? (
              <Modal
                open={true}
                onClose={() => this.setState({ pictureWarning: false })}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.2 }}
                  style={s.confirmPaper}
                >
                  <div
                    style={s.fadedCircle({
                      top: -60,
                      left: -50,
                      size: 180,
                      color: "rgba(233,118,91,0.10)",
                      blur: 14,
                    })}
                  />
                  <div
                    style={s.fadedCircle({
                      top: -40,
                      right: -30,
                      size: 150,
                      color: "rgba(48,71,66,0.08)",
                      blur: 14,
                    })}
                  />

                  <div style={{ position: "relative", zIndex: 2 }}>
                    <Typography variant="h6" style={s.sectionTitle}>
                      Delete photo?
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ ...s.helper, marginTop: 8, lineHeight: 1.7 }}
                    >
                      This removes the photo document from Firestore. If you also want
                      to delete the Storage object, that can be wired in too.
                    </Typography>

                    <Divider style={s.divider} />

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        type="button"
                        style={s.pillBtn}
                        disabled={this.state.submitting}
                        onClick={() => this.setState({ pictureWarning: false })}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        style={s.pillBtnDanger}
                        disabled={this.state.submitting}
                        onClick={() => this.deletePictureFirebase(this.state.pictureWarning)}
                      >
                        Yes, delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {this.state.deleteWarning ? (
              <Modal
                open={true}
                onClose={() => this.setState({ deleteWarning: false })}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.2 }}
                  style={s.confirmPaper}
                >
                  <div
                    style={s.fadedCircle({
                      top: -60,
                      left: -50,
                      size: 180,
                      color: "rgba(233,118,91,0.10)",
                      blur: 14,
                    })}
                  />
                  <div
                    style={s.fadedCircle({
                      top: -40,
                      right: -30,
                      size: 150,
                      color: "rgba(48,71,66,0.08)",
                      blur: 14,
                    })}
                  />

                  <div style={{ position: "relative", zIndex: 2 }}>
                    <Typography variant="h6" style={s.sectionTitle}>
                      Delete this item?
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ ...s.helper, marginTop: 8, lineHeight: 1.7 }}
                    >
                      This removes the work document and its image subcollection
                      documents.
                    </Typography>

                    <Divider style={s.divider} />

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        type="button"
                        style={s.pillBtn}
                        disabled={this.state.submitting}
                        onClick={() => this.setState({ deleteWarning: false })}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        style={s.pillBtnDanger}
                        disabled={this.state.submitting}
                        onClick={this.deleteItem}
                      >
                        Yes, delete item
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {this.state.viewPicture ? (
              <Modal
                open={true}
                onClose={() => this.setState({ viewPicture: null })}
                onClick={() => this.setState({ viewPicture: null })}
                style={{ overflowY: "auto", overflowX: "hidden" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.2 }}
                  style={s.modalPaper}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <Typography variant="h6" style={s.sectionTitle}>
                      Preview
                    </Typography>
                    <Button
                      type="button"
                      style={s.pillBtn}
                      onClick={() => this.setState({ viewPicture: null })}
                    >
                      Close
                    </Button>
                  </div>

                  <Divider style={s.divider} />

                  <img
                    src={this.state.viewPicture}
                    alt="preview"
                    style={{
                      margin: "auto",
                      maxWidth: "100%",
                      borderRadius: 14,
                      display: "block",
                    }}
                  />
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    )
  }
}