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
      imgsByWorkId: {},
      newWorks: false,
      editWorks: null,
      collection: "",
      piece: "",
      basePath: "",
      collectionPath: "",
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
    const parts = pathname.split("/").filter(Boolean)

    const collectionSlug = parts?.[1] || ""
    const pieceSlug = parts?.[2] || ""

    const collectionName = collectionSlug.replace(/_/g, " ")
    const pieceName = pieceSlug.replace(/_/g, " ")

    const collectionPath = collectionSlug ? `/gallery/${collectionSlug}` : "/gallery"

    this.setState({
      basePath: pathname,
      collectionPath,
      collection: collectionName,
      piece: pieceName,
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

  slugify(value = "") {
    return String(value).trim().replace(/\s+/g, "_")
  }

  getBackHref() {
    const { piece, collectionPath } = this.state
    if (piece) return collectionPath || "/gallery"
    return "/gallery"
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
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      },

      heroTitleStack: {
        display: "grid",
        gap: 14,
        justifyItems: "center",
        padding: "clamp(14px, 3vw, 34px)",
      },

      heroTitle: {
        fontFamily: "Brasika",
        color: CREAM,
        letterSpacing: "clamp(0.5px, 0.15vw, 0.8px)",
        fontSize: "clamp(38px, 7vw, 92px)",
        lineHeight: 0.98,
        textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
        padding: "0 6px",
        maxWidth: 980,
        textTransform: "lowercase",
      },

      heroSub: {
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: "clamp(15px, 1.6vw, 20px)",
        lineHeight: 1.75,
        maxWidth: 760,
        textShadow: "0 8px 22px rgba(0,0,0,0.45)",
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

      workCard: {
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid rgba(239,231,220,0.55)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(2px)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
        marginBottom: 18,
      },

      workGlow: {
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

      cardTopRowLeft: {
        display: "flex",
        gap: 12,
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

      gridWrap: {
        position: "relative",
        zIndex: 1,
      },

      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14,
        marginTop: 14,
      },

      previewRow: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 14,
        marginTop: 14,
        width: "100%",
      },

      tile: {
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        height: 340,
        border: "1px solid rgba(239,231,220,0.75)",
        background:
          "radial-gradient(700px 240px at 20% 0%, rgba(107,170,106,0.18), rgba(18,18,18,0))",
        boxShadow: "0 14px 40px rgba(0,0,0,0.38)",
        cursor: "pointer",
        minWidth: 0,
      },

      tileImg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      },

      tileShade: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.16) 55%, rgba(0,0,0,0.48) 100%)",
        pointerEvents: "none",
        zIndex: 2,
      },

      tileLabel: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 12,
        zIndex: 3,
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
      },

      tileZoomIconWrap: {
        display: "grid",
        placeItems: "center",
        color: CREAM,
        flexShrink: 0,
      },

      tileLabelMeta: {
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: 13,
        lineHeight: 1.45,
        textShadow: "0 2px 10px rgba(0,0,0,0.38)",
        opacity: 0.98,
      },

      moreTile: {
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        height: 340,
        border: "1px solid rgba(239,231,220,0.75)",
        background:
          "linear-gradient(180deg, rgba(48,71,66,0.78) 0%, rgba(33,47,43,0.92) 100%)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.38)",
        display: "grid",
        placeItems: "center",
        minWidth: 0,
      },

      moreTileInner: {
        display: "grid",
        justifyItems: "center",
        gap: 8,
        textAlign: "center",
        padding: 20,
      },

      moreDots: {
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: "clamp(40px, 6vw, 62px)",
        lineHeight: 0.9,
        letterSpacing: 8,
        textShadow: "0 6px 18px rgba(0,0,0,0.3)",
      },

      moreText: {
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: 15,
        lineHeight: 1.5,
        opacity: 0.96,
        textShadow: "0 2px 10px rgba(0,0,0,0.3)",
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

      sectionHeaderRow: {
        position: "relative",
        zIndex: 1,
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

      lightboxSub: {
        fontFamily: "Georgia",
        color: GREEN,
        opacity: 0.8,
      },

      closeBtn: {
        color: GREEN,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.55)",
      },

      lightboxImgWrap: {
        padding: 14,
        display: "grid",
        gap: 10,
      },

      lightboxImg: {
        width: "100%",
        maxHeight: "78vh",
        objectFit: "contain",
        display: "block",
        borderRadius: 16,
        background: "rgba(0,0,0,0.04)",
      },

      lightboxMsg: {
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
    }
  }

  renderGrid(images, work, options = {}) {
    const s = this.styles()
    if (!images || images.length === 0) return null

    const { previewMode = false, moreHref = "" } = options

    if (previewMode) {
      const hasMoreThanFour = images.length > 4
      const visibleImages = hasMoreThanFour ? images.slice(0, 3) : images
      const remainingCount = images.length - 3

      return (
        <div style={s.gridWrap}>
          <div style={s.previewRow}>
            {visibleImages.map((img, idx) => (
              <motion.div
                key={idx}
                style={s.tile}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
                whileHover={{ y: -4 }}
                onClick={() => this.openLightbox(img, work)}
              >
                <img src={img.url} alt="" style={s.tileImg} />
                <div style={s.tileShade} />

                <div style={s.tileLabel}>
                  <div style={s.tileZoomIconWrap}>
                    <ZoomInIcon sx={{ fontSize: 20 }} />
                  </div>

                  {img.message ? (
                    <Typography style={s.tileLabelMeta}>{img.message}</Typography>
                  ) : null}
                </div>
              </motion.div>
            ))}

            {hasMoreThanFour ? (
              <motion.a
                href={moreHref}
                style={{ textDecoration: "none" }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(visibleImages.length * 0.05, 0.25),
                }}
              >
                <div style={s.moreTile}>
                  <div style={s.moreTileInner}>
                    <Typography component="div" style={s.moreDots}>
                      ...
                    </Typography>
                    <Typography style={s.moreText}>
                      View {remainingCount} more image{remainingCount === 1 ? "" : "s"}
                    </Typography>
                  </div>
                </div>
              </motion.a>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div style={s.gridWrap}>
        <div style={s.grid}>
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              style={s.tile}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
              whileHover={{ y: -4 }}
              onClick={() => this.openLightbox(img, work)}
            >
              <img src={img.url} alt="" style={s.tileImg} />
              <div style={s.tileShade} />

              <div style={s.tileLabel}>
                <div style={s.tileZoomIconWrap}>
                  <ZoomInIcon sx={{ fontSize: 20 }} />
                </div>

                {img.message ? (
                  <Typography style={s.tileLabelMeta}>{img.message}</Typography>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
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
            onClose={this.closeLightbox}
            style={s.modalBackdrop}
            BackdropProps={{ style: { backgroundColor: "rgba(21,25,22,0.55)" } }}
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

              <Divider style={s.divider} />

              <div style={s.lightboxImgWrap}>
                {lightboxImg ? (
                  <>
                    <img src={lightboxImg.url} alt="" style={s.lightboxImg} />
                    {lightboxImg.message ? (
                      <Typography variant="body2" style={s.lightboxMsg}>
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

  renderSinglePieceView(work, images) {
    const s = this.styles()
    const backHref = this.getBackHref()

    return (
      <div style={s.page}>
        <Head>
          <title>{work.item || "Our Work"}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div style={s.shell}>
          <div style={s.heroWrap}>
            <img src="/splash.png" alt="Gallery splash" style={s.heroBgImg} />
            <div style={s.heroTint} />
            <br />
            <br />

            <div style={s.heroInner}>
              <div style={s.heroTitleArea}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  style={s.heroTitleStack}
                >
                  <Typography component="h1" style={s.heroTitle}>
                    {work.item}
                  </Typography>

                  <Typography variant="body1" style={s.heroSub}>
                    {work.collection}
                  </Typography>

                  <div style={s.heroActions}>
                    <Button href={backHref} style={s.heroBtn}>
                      <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                        {"<"} Back
                      </Typography>
                    </Button>
                  </div>
                </motion.div>
              </div>

              <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>
                {this.renderGrid(images, work)}
              </div>
            </div>
          </div>
        </div>

        {this.renderLightbox()}
      </div>
    )
  }

  renderCollectionView(sortedWorks) {
    const s = this.styles()
    const isAdmin = this.context?.currentUser?.email === "denise.rossacci@gmail.com"
    const collectionName = sortedWorks[0]?.collection || this.state.collection
    const backHref = this.getBackHref()

    return (
      <div style={s.page}>
        <Head>
          <title>{collectionName || "Our Work"}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div style={s.shell}>
          <div style={s.heroWrap}>
            <img src="/splash.png" alt="Gallery splash" style={s.heroBgImg} />
            <div style={s.heroTint} />
            <br />
            <br />

            <div style={s.heroInner}>
              <div style={s.heroTitleArea}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  style={s.heroTitleStack}
                >
                  <Typography component="h1" style={s.heroTitle}>
                    {collectionName}
                  </Typography>

                  <Typography variant="body1" style={s.heroSub}>
                    A blooming gallery of projects
                  </Typography>

                  <div style={s.heroActions}>
                    <Button href={backHref} style={s.heroBtn}>
                      <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                        {"<"} Back
                      </Typography>
                    </Button>

                    {isAdmin ? (
                      <Button style={s.heroBtn} onClick={() => this.setState({ newWorks: true })}>
                        <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                          + Add
                        </Typography>
                      </Button>
                    ) : null}
                  </div>
                </motion.div>
              </div>

              <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>
                {sortedWorks.map((work, idx) => {
                  const images = this.state.imgsByWorkId[work.id] || []
                  const href = `${this.state.collectionPath}/${this.slugify(work.item)}`

                  return (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
                    >
                      <Card style={s.workCard} elevation={0}>
                        <div style={s.workGlow} />

                        <div style={s.cardInner}>
                          <div style={s.cardHeaderRow}>
                            <div style={s.cardTopRowLeft}>
                              <div style={s.floralDot}>
                                <LocalFloristIcon />
                              </div>

                              <div>
                                <Typography variant="h5" style={s.cardTitle}>
                                  {work.item}
                                </Typography>
                                <Typography variant="body2" style={s.cardMeta}>
                                  {work.date ? work.date : work.collection}
                                </Typography>
                              </div>
                            </div>

                            <Button href={href} style={s.pillBtn}>
                              View
                            </Button>
                          </div>

                          <Divider style={s.divider} />

                          {this.renderGrid(images, work, {
                            previewMode: true,
                            moreHref: href,
                          })}
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
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
                  works={sortedWorks}
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
                BackdropProps={{ style: { backgroundColor: "rgba(21,25,22,0.55)" } }}
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
                  <Divider style={s.divider} />
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
                BackdropProps={{ style: { backgroundColor: "rgba(21,25,22,0.55)" } }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.22 }}
                  style={s.lightboxCard}
                >
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
        </div>

        {this.renderLightbox()}
      </div>
    )
  }

  render() {
    const sortedWorks = this.getSortedWorks()

    if (sortedWorks.length > 0 && this.state.piece) {
      const w = sortedWorks[0]
      const images = this.state.imgsByWorkId[w.id] || []
      return this.renderSinglePieceView(w, images)
    }

    if (sortedWorks.length > 0) {
      return this.renderCollectionView(sortedWorks)
    }

    return <div style={{ backgroundColor: "#F7F1E8", minHeight: "100vh" }} />
  }
}