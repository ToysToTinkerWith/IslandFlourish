import React from "react"
import Head from "next/head"

import WorksDatabase from "../../components/Works/WorksDatabase"
import NewWorks from "../../components/Works/NewWorks"
import EditWorks from "../../components/Works/EditWorks"

import { AuthContext } from "../../Firebase/FirebaseAuth"
import { db } from "../../Firebase/FirebaseInit"

import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

import {
  Card,
  Button,
  Modal,
  Typography,
  Divider,
  IconButton,
} from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import ZoomInIcon from "@mui/icons-material/ZoomIn"

import { motion, AnimatePresence } from "framer-motion"

export default class ID extends React.Component {
  static contextType = AuthContext

  constructor(props) {
    super(props)
    this.state = {
      works: [],
      imgsByWorkId: {}, // { [workId]: [{url,message,collection,item}] }
      newWorks: false,
      editWorks: null,
      collection: "",
      piece: "",
      basePath: "",
      // lightbox
      lightboxOpen: false,
      lightboxImg: null,
      lightboxTitle: "",
      lightboxSubtitle: "",
    }
  }

  worksUnsub = null
  imgsUnsubs = new Map()

  componentDidMount() {
    const pathname = window.location.pathname
    const place = pathname.split("/")

    this.setState({
      basePath: pathname,
      collection: (place?.[2] || "").replace(/_/g, " "),
      piece: place.length > 3 ? (place?.[3] || "").replace(/_/g, " ") : "",
    })

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
  }

  getSortedWorks() {
    const { works, collection, piece } = this.state
    if (!collection) return []
    if (piece) return works.filter((w) => w.collection === collection && w.item === piece)
    return works.filter((w) => w.collection === collection)
  }

  getAllImgsFlat() {
    return Object.values(this.state.imgsByWorkId || {}).flat()
  }

  openLightbox = (img, work) => {
    this.setState({
      lightboxOpen: true,
      lightboxImg: img,
      lightboxTitle: work?.item || img?.item || "",
      lightboxSubtitle: work?.collection || img?.collection || "",
    })
  }

  closeLightbox = () => {
    this.setState({
      lightboxOpen: false,
      lightboxImg: null,
      lightboxTitle: "",
      lightboxSubtitle: "",
    })
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

      workCard: {
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        background: `linear-gradient(180deg, ${GLASS}, rgba(255,255,255,0.02))`,
        padding: 16,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      },
      workGlow: {
        position: "absolute",
        inset: -2,
        background:
          "radial-gradient(600px 240px at 0% 0%, rgba(107,170,106,0.16), rgba(0,0,0,0))," +
          "radial-gradient(600px 240px at 100% 0%, rgba(255,114,143,0.10), rgba(0,0,0,0))",
        pointerEvents: "none",
      },

      workHeaderRow: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        position: "relative",
        zIndex: 2,
      },
      workTitle: { color: ACCENT, fontWeight: 900 },
      workMeta: { color: "rgba(107,170,106,0.78)" },

      // Uniform grid: all images same size
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14,
        marginTop: 12,
        position: "relative",
        zIndex: 2,
      },

      tile: {
        borderRadius: 18,
        border: "1px solid rgba(107,170,106,0.18)",
        background: "rgba(0,0,0,0.18)",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
      },
      tileImg: {
        width: "100%",
        height: 240, // uniform
        objectFit: "cover", // crop cleanly
        display: "block",
      },
      tileOverlay: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)",
        opacity: 0,
      },
      tileText: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 10,
        color: "rgba(255,255,255,0.92)",
        opacity: 0,
      },
      tileCaption: { color: "rgba(107,170,106,0.95)" },

      // Lightbox
      lightboxBackdrop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        overflowY: "auto",
      },
      lightboxCard: {
        width: "min(1100px, 96vw)",
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
      lightboxSub: { color: "rgba(107,170,106,0.82)" },
      lightboxImgWrap: { padding: 14 },
      lightboxImg: {
        width: "100%",
        maxHeight: "78vh",
        objectFit: "contain",
        display: "block",
        borderRadius: 16,
        background: "rgba(0,0,0,0.25)",
      },
      closeBtn: {
        color: ACCENT,
        border: `1px solid ${BORDER}`,
        background: "rgba(0,0,0,0.12)",
      },
    }
  }

  renderGrid(images, work) {
    const s = this.styles()
    if (!images || images.length === 0) return null

    return (
      <div style={s.grid}>
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            style={s.tile}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.35) }}
            whileHover={{ y: -4 }}
            onClick={() => this.openLightbox(img, work)}
          >
            <img src={img.url} alt="" style={s.tileImg} />

            <motion.div
              style={s.tileOverlay}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              style={s.tileText}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ZoomInIcon style={{ color: "#6BAA6A" }} />
                <Typography variant="subtitle2" style={s.tileCaption}>
                  Click to view
                </Typography>
              </div>

              {img.message ? (
                <Typography variant="body2" style={{ marginTop: 6 }}>
                  {img.message}
                </Typography>
              ) : null}
            </motion.div>
          </motion.div>
        ))}
      </div>
    )
  }

  renderLightbox() {
    const s = this.styles()
    const { lightboxOpen, lightboxImg, lightboxTitle, lightboxSubtitle } = this.state

    return (
      <AnimatePresence>
        {lightboxOpen ? (
          <Modal
            open={true}
            onClick={this.closeLightbox}
            onClose={this.closeLightbox}
            style={s.lightboxBackdrop}
            BackdropProps={{
              style: { backgroundColor: "#121212", opacity: 1 }, // solid backdrop
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22 }}
              style={s.lightboxCard}
            >
              <div style={s.lightboxHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <LocalFloristIcon style={{ color: "#6BAA6A" }} />
                  <div>
                    <Typography variant="h6" style={s.lightboxTitle}>
                      {lightboxTitle}
                    </Typography>
                    <Typography variant="body2" style={s.lightboxSub}>
                      {lightboxSubtitle}
                    </Typography>
                  </div>
                </div>

                <IconButton onClick={this.closeLightbox} style={s.closeBtn}>
                  <CloseIcon />
                </IconButton>
              </div>

              <Divider style={{ opacity: 0.18 }} />

              <div style={s.lightboxImgWrap}>
                {lightboxImg ? (
                  <>
                    <img src={lightboxImg.url} alt="" style={s.lightboxImg} />
                    {lightboxImg.message ? (
                      <Typography
                        variant="body2"
                        style={{ color: "rgba(107,170,106,0.92)", marginTop: 10 }}
                      >
                        {lightboxImg.message}
                      </Typography>
                    ) : null}
                  </>
                ) : null}
              </div>
            </motion.div>
          </Modal>
        ) : null}
      </AnimatePresence>
    )
  }

  render() {
    const s = this.styles()
    const sortedWorks = this.getSortedWorks()

    const isAdmin =
      this.context?.currentUser?.email === "denise.rossacci@gmail.com"

    // Single piece view (no longer using old imgs array; uses imgsByWorkId)
    if (sortedWorks.length > 0 && this.state.piece) {
      const w = sortedWorks[0]
      const images = this.state.imgsByWorkId[w.id] || []

      return (
        <div style={s.page}>
          <Head>
            <title>{w.item || "Our Work"}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>

          <div style={s.shell}>
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
                      {w.item}
                    </Typography>
                    <Typography variant="body1" style={s.heroSub}>
                      {w.collection}
                    </Typography>
                  </div>
                </div>

                <div style={s.heroActions}>
                  <Button href={"/works"} style={s.pillBtn}>
                    {"<"} Back
                  </Button>
                </div>
              </div>
            </motion.div>

            {this.renderGrid(images, w)}
          </div>

          {this.renderLightbox()}
        </div>
      )
    }

    // Collection list view
    if (sortedWorks.length > 0) {
      return (
        <div style={s.page}>
          <Head>
            <title>Our Work</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>

          <div style={s.shell}>
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
                      {sortedWorks[0].collection}
                    </Typography>
                    <Typography variant="body1" style={s.heroSub}>
                      A blooming gallery of projects
                    </Typography>
                  </div>
                </div>

                <div style={s.heroActions}>
                  <Button href={"/works"} style={s.pillBtn}>
                    {"<"} Back
                  </Button>

                  {isAdmin ? (
                    <Button
                      style={s.pillBtn}
                      onClick={() => this.setState({ newWorks: true })}
                    >
                      + Add
                    </Button>
                  ) : null}
                </div>
              </div>
            </motion.div>

            {sortedWorks.map((work, idx) => {
              const images = this.state.imgsByWorkId[work.id] || []
              const href =
                (this.state.basePath || window.location.pathname) +
                "/" +
                String(work.item || "").replace(/ /g, "_")

              return (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.25) }}
                >
                  <Card style={s.workCard} elevation={0}>
                    <div style={s.workGlow} />

                    <div style={s.workHeaderRow}>
                      <div>
                        <Typography variant="h5" style={s.workTitle}>
                          {work.item}
                        </Typography>
                        {work.date ? (
                          <Typography variant="body2" style={s.workMeta}>
                            {work.date}
                          </Typography>
                        ) : null}
                      </div>

                      <Button href={href} style={s.pillBtn}>
                        View piece
                      </Button>
                    </div>

                    <Divider style={{ opacity: 0.12, marginTop: 12 }} />

                    {this.renderGrid(images, work)}
                  </Card>
                </motion.div>
              )
            })}

            <div style={{ marginTop: 18 }}>
              <WorksDatabase
                works={sortedWorks}
                imgs={this.getAllImgsFlat()}
                editWorks={(editWorks) => this.setState({ editWorks })}
                user={this.context.currentUser}
              />
            </div>

            {/* New Works */}
            <AnimatePresence>
              {this.state.newWorks ? (
                <Modal
                  open={true}
                  onClose={() => this.setState({ newWorks: false })}
                  style={{ overflowY: "auto", overflowX: "hidden", padding: 18 }}
                  BackdropProps={{
                    style: { backgroundColor: "#121212", opacity: 1 },
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 6 }}
                    transition={{ duration: 0.22 }}
                    style={{ width: "min(900px, 96vw)", margin: "28px auto" }}
                  >
                    <Card style={s.lightboxCard} elevation={0}>
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
                    </Card>
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
                  style={{ overflowY: "auto", overflowX: "hidden", padding: 18 }}
                  BackdropProps={{
                    style: { backgroundColor: "#121212", opacity: 1 },
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 6 }}
                    transition={{ duration: 0.22 }}
                    style={{ width: "min(900px, 96vw)", margin: "28px auto" }}
                  >
                    <Card style={s.lightboxCard} elevation={0}>
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
                    </Card>
                  </motion.div>
                </Modal>
              ) : null}
            </AnimatePresence>
          </div>

          {this.renderLightbox()}
        </div>
      )
    }

    return <div style={{ backgroundColor: "#121212", minHeight: "100vh" }} />
  }
}
