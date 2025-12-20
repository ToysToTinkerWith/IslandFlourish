import React from "react"
import Head from "next/head"
import Image from "next/image"

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

// NOTE:
// If you're using Firebase Storage (or any remote host), make sure next.config.js allows it under images.domains/remotePatterns,
// otherwise next/image may error in production.

export default class Work extends React.Component {
  static contextType = AuthContext

  constructor(props) {
    super(props)
    this.state = {
      works: [],
      imgsByWorkId: {}, // { [workId]: [imgs...] }
      newWorks: false,
      editWorks: null,
      selWork: null,
      selCol: null,
      tick: 0, // drives slideshows
    }
  }

  worksUnsub = null
  imgsUnsubs = new Map()
  slideshowTimer = null

  componentDidMount() {
    // One image per STEP_MS; each image fades in/out
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

  // Per-collection active image index (stable, looping)
  getActiveImageForCollection(col, limit = 200) {
    const imgs = this.getAllImgsFlat()
      .filter((img) => img.collection === col && img.url)
      .slice(0, limit)

    if (imgs.length === 0) return { img: null, idx: 0, total: 0 }

    // de-sync different collections so they don't change at the exact same moment
    const seed = Array.from(String(col || "")).reduce((a, c) => a + c.charCodeAt(0), 0)
    const idx = (this.state.tick + seed) % imgs.length

    return { img: imgs[idx], idx, total: imgs.length }
  }

  styles() {
    const BG = "#121212"
    const ACCENT = "#6BAA6A"
    const GLASS = "rgba(255,255,255,0.04)"
    const BORDER = "rgba(107,170,106,0.22)"

    return {
      page: { backgroundColor: BG, minHeight: "100vh", overflowX: "hidden" },
      shell: { maxWidth: 1220, margin: "0 auto", padding: "28px 16px 70px" },

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
      heroActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },

      pillBtn: {
        borderRadius: 999,
        border: `1px solid ${BORDER}`,
        padding: "8px 14px",
        color: ACCENT,
        textTransform: "none",
        background: "rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
      },

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

      collectionCard: {
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(180deg, ${GLASS}, rgba(255,255,255,0.02))`,
        padding: 16,
        height: "100%",
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

      cardHeaderRow: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        position: "relative",
        zIndex: 2,
      },
      cardTitle: { color: ACCENT, fontWeight: 900 },
      cardMeta: { color: "rgba(107,170,106,0.78)" },

      // PREVIEW BOX: image covers full box and cycles
      preview: {
        marginTop: 12,
        borderRadius: 18,
        border: "1px solid rgba(107,170,106,0.18)",
        background: "rgba(0,0,0,0.18)",
        overflow: "hidden",
        height: 320,
        position: "relative", // required for next/image layout="fill"
      },

      previewShade: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.75) 100%)",
        pointerEvents: "none",
        zIndex: 2,
      },
      previewLabel: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 12,
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        gap: 10,
      },
      previewDot: {
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "#6BAA6A",
        boxShadow: "0 0 18px rgba(107,170,106,0.35)",
        flex: "0 0 auto",
      },
      previewTextWrap: { minWidth: 0 },
      previewMsg: {
        color: "rgba(255,255,255,0.92)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },

      modalBackdrop: {
        overflowY: "auto",
        overflowX: "hidden",
        padding: 18,
      },
      lightboxCard: {
        width: "min(900px, 96vw)",
        margin: "28px auto",
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background:
          "radial-gradient(900px 260px at 0% 0%, rgba(107,170,106,0.18), rgba(18,18,18,0))," +
          "radial-gradient(700px 240px at 100% 0%, rgba(255,114,143,0.12), rgba(18,18,18,0))," +
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        overflow: "hidden",
      },
      lightboxHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "14px 14px",
      },
      lightboxTitle: { color: ACCENT, fontWeight: 900 },
      closeBtn: {
        color: ACCENT,
        border: `1px solid ${BORDER}`,
        background: "rgba(0,0,0,0.12)",
      },

      selWorkImg: {
        width: "100%",
        maxHeight: "70vh",
        objectFit: "contain",
        display: "block",
        borderRadius: 16,
        background: "rgba(0,0,0,0.25)",
      },
      selWorkMsg: { color: "rgba(107,170,106,0.92)" },
    }
  }

  render() {
    const s = this.styles()

    // Group works by collection
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

    const isAdmin = this.context?.currentUser?.email === "denise.rossacci@gmail.com"

    return (
      <div style={s.page}>
        <Head>
          <title>Moments</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="We are grateful that our solution has been used within the whidbey island local communities..."
          />
          <meta name="keywords" content="Our Work, Roads, Driveways, Maintenance." />
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
            <motion.div
              style={s.blob("70%", "20%", 260, "rgba(255,197,92,0.40)", "rgba(18,18,18,0)")}
              animate={{ rotate: [0, 8, 0], x: [0, 8, 0], y: [0, -10, 0] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            />

            <div style={s.heroInner}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LocalFloristIcon style={{ color: "#6BAA6A" }} />
                <div>
                  <Typography variant="h4" style={s.heroTitle}>
                    Moments
                  </Typography>
                  <Typography variant="body1" style={s.heroSub}>
                    A blooming gallery of moments
                  </Typography>
                </div>
              </div>

              <div style={s.heroActions}>
                {isAdmin ? (
                  <Button style={s.pillBtn} onClick={() => this.setState({ newWorks: true })}>
                    + Add
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>

          {/* Collections */}
          <Grid container spacing={2}>
            {sortedWorks.map((bucket, index) => {
              const col = bucket.collectionName
              const href = "/moments/" + String(col || "").replace(/ /g, "_")

              const { img, idx, total } = this.getActiveImageForCollection(col)

              return (
                <Grid item key={col || index} xs={12} sm={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
                    style={{ height: "100%" }}
                  >
                    <Card style={s.collectionCard} elevation={0}>
                      <div style={s.cardGlow} />

                      <div style={s.cardHeaderRow}>
                        <div style={{ position: "relative", zIndex: 2 }}>
                          <Typography variant="h5" style={s.cardTitle}>
                            {col}
                          </Typography>
                          <Typography variant="body2" style={s.cardMeta}>
                            {bucket.num} item{bucket.num === 1 ? "" : "s"}
                            {total ? ` • ${idx + 1}/${total}` : ""}
                          </Typography>
                        </div>

                        <Button href={href} style={s.pillBtn}>
                          View
                        </Button>
                      </div>

                      <Divider style={{ opacity: 0.12, marginTop: 12 }} />

                      {/* FULL-BOX IMAGE: use next/image + layout="fill" for higher-quality scaling */}
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
                              <Image
                                src={img.url}
                                alt=""
                                layout="fill"
                                objectFit="cover"
                                quality={100}
                                // If you cannot or do not want to configure next.config.js for remote images, uncomment:
                                // unoptimized
                              />
                            </motion.div>
                          </AnimatePresence>
                        ) : null}

                        <div style={s.previewShade} />

                       
                      </div>
                    </Card>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>

          {/* All Works */}
          <Card style={s.sectionCard} elevation={0}>
            <div style={s.cardGlow} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h5" style={s.cardTitle}>
                All Moments
              </Typography>
              <Typography variant="body2" style={s.cardMeta}>
                Full index of projects and images
              </Typography>

              <Divider style={{ opacity: 0.12, marginTop: 12, marginBottom: 12 }} />

              <WorksDatabase
                works={this.state.works}
                imgs={this.getAllImgsFlat()}
                editWorks={(editWorks) => this.setState({ editWorks })}
                user={this.context.currentUser}
              />
            </div>
          </Card>

          {/* New Works */}
          <AnimatePresence>
            {this.state.newWorks ? (
              <Modal
                open={true}
                onClose={() => this.setState({ newWorks: false })}
                style={s.modalBackdrop}
                BackdropProps={{ style: { backgroundColor: "#121212", opacity: 1 } }}
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
                      Add New Work
                    </Typography>
                    <IconButton
                      onClick={() => this.setState({ newWorks: false })}
                      style={s.closeBtn}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                  <Divider style={{ opacity: 0.18 }} />
                  <div style={{ padding: 14 }}>
                    <NewWorks closeModal={() => this.setState({ newWorks: false })} />
                  </div>
                </motion.div>
              </Modal>
            ) : null}
          </AnimatePresence>

          {/* Edit Works */}
          <AnimatePresence>
            {this.state.editWorks ? (
              <Modal
                open={true}
                onClose={() => this.setState({ editWorks: null })}
                style={s.modalBackdrop}
                BackdropProps={{ style: { backgroundColor: "#121212", opacity: 1 } }}
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
                  <Divider style={{ opacity: 0.18 }} />
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

          {/* Selected Work */}
          <AnimatePresence>
            {this.state.selWork ? (
              <Modal
                open={true}
                onClose={() => this.setState({ selWork: null })}
                style={s.modalBackdrop}
                BackdropProps={{ style: { backgroundColor: "#121212", opacity: 1 } }}
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
                      <LocalFloristIcon style={{ color: "#6BAA6A" }} />
                      <div>
                        <Typography variant="h6" style={s.lightboxTitle}>
                          {this.state.selWork.item}
                        </Typography>
                        <Typography variant="body2" style={{ color: "rgba(107,170,106,0.82)" }}>
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

                  <Divider style={{ opacity: 0.18 }} />

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
