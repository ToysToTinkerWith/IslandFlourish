import React from "react"
import Head from "next/head"

import WorksDatabase from "../../components/Works/WorksDatabase"
import NewWorks from "../../components/Works/NewWorks"
import EditWorks from "../../components/Works/EditWorks"

import { AuthContext } from "../../Firebase/FirebaseAuth"
import { db } from "../../Firebase/FirebaseInit"

import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

import { motion, AnimatePresence } from "framer-motion"

import {
  Grid,
  Card,
  Button,
  Modal,
  Typography,
  Divider,
  IconButton,
} from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"

export default class Work extends React.Component {
  static contextType = AuthContext

  constructor(props) {
    super(props)
    this.state = {
      works: [],
      imgsByWorkId: {},
      newWorks: false,
      editWorks: null,
      selWork: null,
      selCol: null,
      tick: 0,
    }
  }

  worksUnsub = null
  imgsUnsubs = new Map()
  slideshowTimer = null

  componentDidMount() {
    const STEP_MS = 4500
    this.slideshowTimer = setInterval(() => {
      this.setState((prev) => ({ tick: prev.tick + 1 }))
    }, STEP_MS)

    const worksRef = collection(db, "works")

    this.worksUnsub = onSnapshot(worksRef, (workSnap) => {
      for (const unsub of this.imgsUnsubs.values()) unsub()
      this.imgsUnsubs.clear()

      const works = []
      const imgsByWorkId = {}

      workSnap.forEach((workDoc) => {
        const workData = workDoc.data()
        const workId = workDoc.id

        const normalized = {
          ...workData,
          id: workId,
          date: workData?.date
            ? new Date(String(workData.date).replace(/-/g, "/")).toLocaleDateString()
            : "",
        }

        works.push(normalized)
        imgsByWorkId[workId] = []

        const imgsRef = collection(db, "works", workId, "imgs")
        const imgsQuery = query(imgsRef, orderBy("created", "asc"))

        const unsubImgs = onSnapshot(imgsQuery, (imgsSnap) => {
          const imgs = []
          imgsSnap.forEach((imgDoc) => {
            const img = imgDoc.data()
            imgs.push({
              url: img.url,
              message: img.message,
              collection: normalized.collection,
              item: normalized.item,
              workId,
            })
          })

          this.setState((prev) => ({
            imgsByWorkId: { ...prev.imgsByWorkId, [workId]: imgs },
          }))
        })

        this.imgsUnsubs.set(workId, unsubImgs)
      })

      this.setState({ works, imgsByWorkId })
    })
  }

  componentWillUnmount() {
    if (this.worksUnsub) this.worksUnsub()
    for (const unsub of this.imgsUnsubs.values()) unsub()
    this.imgsUnsubs.clear()
    if (this.slideshowTimer) clearInterval(this.slideshowTimer)
  }

  getAllImgsFlat() {
    return Object.values(this.state.imgsByWorkId || {}).flat()
  }

  getActiveImageForCollection(col, limit = 200) {
    const imgs = this.getAllImgsFlat()
      .filter((img) => img.collection === col && img.url)
      .slice(0, limit)

    if (imgs.length === 0) return { img: null, idx: 0, total: 0 }

    const seed = Array.from(String(col || "")).reduce((a, c) => a + c.charCodeAt(0), 0)
    const idx = (this.state.tick + seed) % imgs.length

    return { img: imgs[idx], idx, total: imgs.length }
  }

  styles() {
    const CREAM = "#EFE7DC"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"
    const BG = "#F7F1E8"
    const BG_SOFT = "#F2EADF"
    const BORDER = "rgba(48,71,66,0.18)"

    return {
      page: {
        background: BG,
        minHeight: "100vh",
        overflowX: "hidden",
      },

      shell: {
        width: "100%",
      },

      heroWrap: {
        position: "relative",
        width: "100%",
        overflow: "hidden",
      },

      heroBgImg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center top",
        display: "block",
        zIndex: 0,
      },

      heroTint: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 38%, rgba(48,71,66,0.18) 100%)",
      },

      heroInner: {
        position: "relative",
        zIndex: 1,
        paddingTop: 50,
        paddingBottom: 34,
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
      },

      heroTitleArea: {
        position: "relative",
        width: "100%",
        height: "clamp(260px, 46vw, 520px)",
      },

      heroTitleCenter: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      },

      heroTitleStack: {
        display: "grid",
        gap: 14,
        justifyItems: "center",
        padding: "clamp(14px, 3vw, 34px)",
        textAlign: "center",
      },

      heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 999,
        border: "1px solid rgba(239,231,220,0.72)",
        background: "rgba(48,71,66,0.24)",
        backdropFilter: "blur(8px)",
        color: CREAM,
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

      heroActions: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 8,
      },

      heroBtn: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "10px 18px",
        border: `1px solid ${GREEN}`,
        color: GREEN,
        background: CREAM,
        boxShadow: "0 12px 30px rgba(0,0,0,0.20)",
      },

      collectionCard: {
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        height: "100%",
        border: "1px solid rgba(239,231,220,0.55)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(2px)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
      },

      cardGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(180deg, rgba(239,231,220,0.10) 0%, rgba(239,231,220,0.03) 100%)",
        zIndex: 0,
      },

      cardInner: {
        position: "relative",
        zIndex: 1,
        padding: "16px",
      },

      cardHeaderRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      },

      cardTitle: {
        fontFamily: "Brasika",
        color: CREAM,
        fontSize: "clamp(26px, 3vw, 36px)",
        lineHeight: 1.04,
        textShadow: "0 10px 24px rgba(0,0,0,0.42)",
      },

      cardMeta: {
        fontFamily: "Georgia",
        color: CREAM,
        opacity: 0.95,
        marginTop: 4,
        textShadow: "0 2px 10px rgba(0,0,0,0.38)",
      },

      pillBtn: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "9px 16px",
        border: `1px solid ${GREEN}`,
        color: GREEN,
        background: CREAM,
        boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
        whiteSpace: "nowrap",
      },

      preview: {
        marginTop: 14,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        height: 340,
        border: "1px solid rgba(239,231,220,0.75)",
        background:
          "radial-gradient(700px 240px at 20% 0%, rgba(107,170,106,0.18), rgba(18,18,18,0))",
        boxShadow: "0 14px 40px rgba(0,0,0,0.38)",
      },

      previewShade: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.16) 55%, rgba(0,0,0,0.48) 100%)",
        pointerEvents: "none",
        zIndex: 2,
      },

      previewLabel: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 12,
        zIndex: 3,
      },

      previewLabelTitle: {
        fontFamily: "Brasika",
        color: CREAM,
        fontSize: 22,
        lineHeight: 1.04,
        textShadow: "0 8px 22px rgba(0,0,0,0.42)",
      },

      previewLabelMeta: {
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: 13,
        marginTop: 4,
        textShadow: "0 2px 10px rgba(0,0,0,0.38)",
        opacity: 0.95,
      },

      lowerSection: {
        position: "relative",
        background: BG_SOFT,
        padding: "68px clamp(16px, 4vw, 40px) 48px",
      },

      sectionCard: {
        maxWidth: 1280,
        margin: "0 auto",
        borderRadius: 24,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.72)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
        padding: 18,
        position: "relative",
        overflow: "hidden",
      },

      sectionGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(700px 240px at 0% 0%, rgba(233,118,91,0.08), rgba(0,0,0,0))," +
          "radial-gradient(700px 240px at 100% 0%, rgba(48,71,66,0.08), rgba(0,0,0,0))",
      },

      sectionTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        letterSpacing: 0.4,
      },

      sectionMeta: {
        fontFamily: "Georgia",
        color: GREEN,
        opacity: 0.9,
      },

      divider: {
        opacity: 0.15,
        marginTop: 12,
        marginBottom: 12,
        borderColor: GREEN,
      },

      modalBackdrop: {
        overflowY: "auto",
        overflowX: "hidden",
        padding: 18,
      },

      lightboxCard: {
        width: "min(940px, 96vw)",
        margin: "28px auto",
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background:
          "linear-gradient(180deg, rgba(247,241,232,0.98), rgba(242,234,223,0.98))",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      },

      lightboxHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "14px 14px",
      },

      lightboxTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        letterSpacing: 0.4,
      },

      closeBtn: {
        color: GREEN,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.55)",
      },

      selWorkImg: {
        width: "100%",
        maxHeight: "70vh",
        objectFit: "contain",
        display: "block",
        borderRadius: 16,
        background: "rgba(0,0,0,0.04)",
      },

      selWorkMsg: {
        fontFamily: "Georgia",
        color: GREEN,
      },

      cornerAccentTL: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "12vw",
        height: "auto",
        transform: "scaleY(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      cornerAccentTR: {
        position: "absolute",
        top: 0,
        right: 0,
        width: "12vw",
        height: "auto",
        transform: "scale(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      cornerAccentBL: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "12vw",
        height: "auto",
        transform: "none",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      cornerAccentBR: {
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

      cardTopRowLeft: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      },

      sectionHeaderRow: {
        position: "relative",
        zIndex: 1,
      },

      collectionsWrap: {
        position: "relative",
        zIndex: 1,
        paddingTop: 10,
        maxWidth: 1280,
        margin: "0 auto",
      },
    }
  }

  render() {
    const s = this.styles()

    const buckets = new Map()
    this.state.works.forEach((work) => {
      const key = work.collection || ""
      if (!buckets.has(key)) buckets.set(key, { works: [], num: 0 })
      const b = buckets.get(key)
      b.works.push(work)
      b.num += 1
    })

    const sortedWorks = Array.from(buckets.entries())
      .map(([collectionName, data]) => ({
        collectionName,
        works: data.works,
        num: data.num,
      }))
      .sort((a, b) => String(a.collectionName).localeCompare(String(b.collectionName)))

    const isAdmin =
      this.context?.currentUser?.email === "abergquist96@gmail.com" ||
      this.context?.currentUser?.email === "islandflourish@gmail.com"

    return (
      <div style={s.page}>
        <Head>
          <title>Gallery</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="A blooming gallery of floral moments, arrangements, and event work."
          />
          <meta
            name="keywords"
            content="Island Flourish, gallery, flowers, arrangements, moments, weddings, floral design"
          />
        </Head>

        <div style={s.shell}>
          <div style={s.heroWrap}>
            <img src="/splash.png" alt="Gallery splash" style={s.heroBgImg} />
            <div style={s.heroTint} />

            <div style={s.heroInner}>
              <Grid container style={{ width: "100%" }}>
                <Grid item xs={12}>
                  <div style={s.heroTitleArea}>
                    <div style={s.heroTitleCenter}>
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                        style={s.heroTitleStack}
                      >
                        <Typography component="h1" style={s.heroTitle}>
                          gallery
                        </Typography>

  
                      </motion.div>
                    </div>
                  </div>
                </Grid>
              </Grid>

              <div style={s.heroActions}>
                {isAdmin ? (
                  <Button
                    style={s.heroBtn}
                    onClick={() => this.setState({ newWorks: true })}
                  >
                    <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                      + Add Work
                    </Typography>
                  </Button>
                ) : null}
              </div>

              <div style={s.collectionsWrap}>
                <Grid container spacing={2}>
                  {sortedWorks.map((bucket, index) => {
                    const col = bucket.collectionName
                    const href = "/gallery/" + String(col || "").replace(/ /g, "_")
                    const { img, idx, total } = this.getActiveImageForCollection(col)

                    return (
                      <Grid item key={col || index} xs={12} sm={12} md={6}>
                        <motion.div
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.25) }}
                          style={{ height: "100%" }}
                        >
                          <Card style={s.collectionCard} elevation={0}>
                            <div style={s.cardGlow} />

                            <div style={s.cardInner}>
                              <div style={s.cardHeaderRow}>
                                <div style={s.cardTopRowLeft}>
                                  <div style={s.floralDot}>
                                    <LocalFloristIcon />
                                  </div>

                                  <div>
                                    <Typography variant="h5" style={s.cardTitle}>
                                      {col}
                                    </Typography>
                                    <Typography variant="body2" style={s.cardMeta}>
                                      {bucket.num} item{bucket.num === 1 ? "" : "s"}
                                      {total ? ` • ${idx + 1}/${total}` : ""}
                                    </Typography>
                                  </div>
                                </div>

                                <Button href={href} style={s.pillBtn}>
                                  View
                                </Button>
                              </div>

                              <Divider style={s.divider} />

                              <div style={s.preview}>
                                {img ? (
                                  <AnimatePresence mode="wait">
                                    <motion.div
                                      key={`${col}-${idx}-${img.url}`}
                                      style={{ position: "absolute", inset: 0, zIndex: 1 }}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.9, ease: "easeInOut" }}
                                    >
                                      <img
                                        src={img.url}
                                        alt=""
                                        loading={index <= 2 ? "eager" : "lazy"}
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          display: "block",
                                        }}
                                      />
                                    </motion.div>
                                  </AnimatePresence>
                                ) : null}

                                <div style={s.previewShade} />

                                <div style={s.previewLabel}>
                                  <Typography style={s.previewLabelTitle}>{col}</Typography>
                                  <Typography style={s.previewLabelMeta}>
                                    {bucket.num} collection item{bucket.num === 1 ? "" : "s"}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </Grid>
                    )
                  })}
                </Grid>
              </div>
            </div>
          </div>

          <div id="all-moments" style={s.lowerSection}>
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.cornerAccentTL} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.cornerAccentTR} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.cornerAccentBL} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.cornerAccentBR} />

            <Card style={s.sectionCard} elevation={0}>
              <div style={s.sectionGlow} />

              <div style={s.sectionHeaderRow}>
                <Typography variant="h4" style={s.sectionTitle}>
                  All Moments
                </Typography>
                <Typography variant="body1" style={s.sectionMeta}>
                  Full index of projects and images
                </Typography>

                <Divider style={s.divider} />

                <WorksDatabase
                  works={this.state.works}
                  imgs={this.getAllImgsFlat()}
                  editWorks={(editWorks) => this.setState({ editWorks })}
                  user={this.context.currentUser}
                />
              </div>
            </Card>
          </div>

          <AnimatePresence>
            {this.state.newWorks ? (
              <Modal
                open={true}
                onClose={() => this.setState({ newWorks: false })}
                style={s.modalBackdrop}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.22 }}
                  style={s.lightboxCard}
                >
                  <div style={{ padding: 14 }}>
                    <NewWorks closeModal={() => this.setState({ newWorks: false })} />
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {this.state.editWorks ? (
              <Modal
                open={true}
                onClose={() => this.setState({ editWorks: null })}
                style={s.modalBackdrop}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.22 }}
                  style={s.lightboxCard}
                >
                  <div style={s.lightboxHeader}>
                    <Typography variant="h6" style={s.lightboxTitle}>
                      Edit Work
                    </Typography>
                    <IconButton
                      onClick={() => this.setState({ editWorks: null })}
                      style={s.closeBtn}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                  <Divider style={s.divider} />
                  <div style={{ padding: 14 }}>
                    <EditWorks
                      closeModal={() => this.setState({ editWorks: null })}
                      work={this.state.editWorks}
                    />
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {this.state.selWork ? (
              <Modal
                open={true}
                onClose={() => this.setState({ selWork: null })}
                style={s.modalBackdrop}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.22 }}
                  style={{ ...s.lightboxCard, width: "min(1100px, 96vw)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={s.lightboxHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <LocalFloristIcon style={{ color: "#304742" }} />
                      <div>
                        <Typography variant="h6" style={s.lightboxTitle}>
                          {this.state.selWork.item}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ fontFamily: "Georgia", color: "#304742", opacity: 0.8 }}
                        >
                          {this.state.selWork.collection}
                        </Typography>
                      </div>
                    </div>

                    <IconButton
                      onClick={() => this.setState({ selWork: null })}
                      style={s.closeBtn}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>

                  <Divider style={s.divider} />

                  <div style={{ padding: 14, display: "grid", gap: 14 }}>
                    {this.getAllImgsFlat()
                      .filter(
                        (img) =>
                          img.collection === this.state.selWork.collection &&
                          img.item === this.state.selWork.item
                      )
                      .map((img, idx) => (
                        <div key={idx} style={{ display: "grid", gap: 10 }}>
                          <img src={img.url} alt="" style={s.selWorkImg} />
                          {img.message ? (
                            <Typography variant="body2" style={s.selWorkMsg}>
                              {img.message}
                            </Typography>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    )
  }
}