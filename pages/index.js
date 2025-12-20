import React from "react"

import Head from "next/head"

import { Grid, Button, Typography, Card, CardContent } from "@mui/material"

import { db } from "../Firebase/FirebaseInit"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

import { motion } from "framer-motion"

export default class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      works: [],
      imgs: [],
      activeSlideIndex: 0,
      bio: false,
    }
  }

  slidesLen = 0
  slideInterval = null

  // Unsubscribe for "works" listener
  worksUnsub = null

  // Map of workId -> unsubscribe function for imgs subcollection listeners
  imgsUnsubs = new Map()

  componentDidMount() {
    const worksRef = collection(db, "works")

    this.worksUnsub = onSnapshot(worksRef, (workSnap) => {
      // Reset state each time (matching your original behavior)
      this.setState({ works: [], imgs: [] })

      // Tear down previous imgs listeners
      for (const unsub of this.imgsUnsubs.values()) unsub()
      this.imgsUnsubs.clear()

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

        // Add work to state
        this.setState((prev) => ({
          works: [...prev.works, normalized],
        }))

        // Listen to imgs subcollection for this work
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

          // Append imgs (matching your original behavior)
          this.setState((prev) => ({
            imgs: [...prev.imgs, ...imgs],
          }))
        })

        this.imgsUnsubs.set(workId, unsubImgs)
      })
    })

    // cycle every 12s (matches your animation duration)
    this.slideInterval = setInterval(() => {
      const len = this.slidesLen || 0
      if (!len) return
      this.setState((prev) => ({
        activeSlideIndex: (prev.activeSlideIndex + 1) % len,
      }))
    }, 12000)
  }

  componentWillUnmount() {
    if (this.worksUnsub) this.worksUnsub()
    for (const unsub of this.imgsUnsubs.values()) unsub()
    this.imgsUnsubs.clear()
    if (this.slideInterval) clearInterval(this.slideInterval)
  }

  render() {
    const itemMap = new Map()

    ;(this.state.imgs || []).forEach((img) => {
      const key = String(img.item || "Untitled")
      if (!itemMap.has(key)) itemMap.set(key, [])
      itemMap.get(key).push(img)
    })

    const slides = []
    for (const [item, imgs] of itemMap.entries()) {
      for (let i = 0; i < imgs.length; i += 3) {
        const chunk = imgs.slice(i, i + 3)
        if (chunk.length === 3) slides.push({ item, imgs: chunk })
      }
    }

    this.slidesLen = slides.length

    const safeIndex = slides.length ? this.state.activeSlideIndex % slides.length : 0
    const activeSlide = slides[safeIndex]

    // --- NEW: event types section content ---
    // Swap these image paths with your own assets (public/...)
    const eventTypes = [
      {
        title: "Weddings",
        img: "/weddings.png",
        blurb:
          "From aisle to altar, we craft floral storybook moments—lush, romantic, and unmistakably yours.",
      },
      {
        title: "Celebrations",
        img: "/celebrations.png",
        blurb:
          "Birthdays, anniversaries, and milestones—let blooms turn the air into joy and the table into art.",
      },
      {
        title: "Showers",
        img: "/showers.png",
        blurb:
          "Soft petals, bright accents, and charming details—florals that welcome love, laughter, and new beginnings.",
      },
    ]

    const sectionWrap = {
      width: "min(1200px, 92vw)",
      margin: "0 auto",
      padding: "clamp(28px, 5vw, 56px) 0",
    }

    const sectionTitleStyle = {
      fontFamily: "GeorgiaB",
      color: "#34693F",
      letterSpacing: 0.4,
      textShadow: "0 0 18px rgba(52,105,63,0.10)",
    }

    const cardStyle = {
      height: "100%",
      borderRadius: 22,
      overflow: "hidden",
      border: "1px solid rgba(107,170,106,0.25)",
      boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
      position: "relative",
    }


    const imageWrapStyle = {
      width: "100%",
      overflow: "hidden",
    }

    const imageStyle = {
        width: "100%",
        height: "100%",
        maxWidth: 300,
        objectFit: "cover",
        display: "block",
        margin: "auto",
        transform: "none",          // important
        filter: "none",             // optional (often helps perceived crispness)
    }

    const containerVariants = {
      hidden: { opacity: 0, y: 18 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, staggerChildren: 0.12 },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 18 },
      show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
    }

    return (
      <div>
        <Head>
          <title>Island Flourish</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Gravel driveways, roads, and parking area repairs. New construction for Oak Harbor, coupeville, Greenbank, Freeland, Langley, Clinton and surrounding areas."
          />
          <meta
            name="keywords"
            content="Driveways, Home, Parking resurfacing, Resonable rates, new driveway installation."
          />
        </Head>

        <Grid
            container
            spacing={3}
            style={{
                width: "min(1200px, 92vw)",
                margin: "0 auto",
                alignItems: "center",
                paddingTop: "clamp(24px, 5vw, 56px)",
                paddingBottom: "clamp(18px, 4vw, 40px)",
            }}
            >
            {/* Left column: Logo */}
            <Grid item xs={12} md={5} style={{ display: "flex", justifyContent: "center" }}>
                <img
                src="./logo.png"
                style={{
                    height: "min(350px, 70vw)",
         
                    display: "block",
                }}
                />
            </Grid>

            {/* Right column: Text + flowers */}
            <Grid item xs={12} md={7}>
                <div style={{ textAlign: "center" }}>
                <Typography
                    variant="h4"
                    align="center"
                    style={{ fontFamily: "GeorgiaB", color: "#34693F" }}
                >
                    Make the Moment
                </Typography>

                <div style={{ height: 12 }} />

                <Typography
                    variant="h2"
                    align="center"
                    style={{ fontFamily: "GeorgiaB", color: "#34693F" }}
                >
                    Bloom
                </Typography>

                <div style={{ height: 18 }} />

                <img
                    src="./flowers.png"
                    style={{
                    height: "min(350px, 70vw)",
                    display: "block",
                    margin: "0 auto",
                    }}
                />
                </div>
            </Grid>
            </Grid>


        <Grid
          container
          style={{
            height: "min(75vw, 580px)",
            minHeight: 440,
            position: "relative",
            backgroundColor: "#121212",
            overflow: "hidden",
            border: "1px solid rgba(107,170,106,0.25)",
          }}
        >
          {activeSlide ? (
            <motion.div
              key={safeIndex} // IMPORTANT: re-triggers animations each slide
              style={{ position: "absolute", inset: 0, width: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Grid
                container
                style={{
                  inset: 0,
                  padding: "clamp(14px, 4vw, 48px)",
                  alignContent: "flex-start",
                }}
              >
                {/* Item title */}
                <Grid item xs={12}>
                  <motion.div
                    animate={{
                      x: ["0%", "20%", "40%"],
                      opacity: [0, 1, 1, 1, 1, 1, 0, 0],
                    }}
                    transition={{ duration: 12 }}
                  >
                    <Typography
                      align="left"
                      variant="h3"
                      style={{
                        fontFamily: "Marcellus SC",
                        color: "#6BAA6A",
                        marginBottom: "clamp(10px, 2vw, 22px)",
                        textShadow: "0 0 18px rgba(107,170,106,0.18)",
                        maxWidth: "100%",
                      }}
                    >
                      {activeSlide.item}
                    </Typography>
                  </motion.div>
                </Grid>

                {/* 3 images (uniform size + cropped), responsive */}
                {[0, 1, 2].map((i) => (
                  <Grid key={i} item xs={4} sm={4} md={4}>
                    <motion.div
                      animate={{
                        opacity: [0, 1, 1, 1, 1, 1, 0, 0],
                        y: [10, 0, 0, 0, 0, -6, -6, -6],
                      }}
                      transition={{ duration: 12, delay: i }} // stagger within slide
                      style={{ display: "grid", padding: "5%", gap: 10 }}
                    >
                      <div
                        style={{
                          width: "100%",
                          margin: "0 auto",
                          borderRadius: 18,
                          overflow: "hidden",
                          border: "1px solid rgba(107,170,106,0.22)",
                          boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
                          background:
                            "radial-gradient(700px 240px at 20% 0%, rgba(107,170,106,0.18), rgba(18,18,18,0))",
                        }}
                      >
                        <img
                          src={activeSlide.imgs[i].url}
                          style={{
                            width: "100%",
                            height: "clamp(250px, 42vw, 320px)", // fits all window sizes
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>

                      <Typography
                        align="center"
                        variant="caption"
                        style={{
                          fontFamily: "Marcellus SC",
                          color: "rgba(107,170,106,0.95)",
                          padding: "2% 6%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          minHeight: "3.2em",
                        }}
                      >
                        {activeSlide.imgs[i].message}
                      </Typography>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : null}

          {/* CTA */}
          <Button
            style={{
              position: "absolute",
              color: "#6BAA6A",
              right: "clamp(12px, 3vw, 28px)",
              bottom: "clamp(12px, 3vw, 28px)",
              paddingTop: 0,
              borderBottom: "1px solid rgba(107,170,106,0.9)",
              borderRadius: 0,
              zIndex: 5,
              textTransform: "none",
              fontFamily: "GeorgiaB",
              background: "rgba(18,18,18,0.35)",
              backdropFilter: "blur(8px)",
            }}
            href="/works"
          >
            <Typography variant="h5" style={{ fontFamily: "Marcellus SC" }}>
              View All Moments
            </Typography>
          </Button>
        </Grid>

        {/* ===================== NEW: Events section (3 columns -> rows on small screens) ===================== */}
        <div style={sectionWrap}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={containerVariants}
          >
            <Grid container spacing={3} style={{ alignItems: "stretch" }}>
              <Grid item xs={12} style={{ marginBottom: 6 }}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h3"
                    align="center"
                    style={sectionTitleStyle}
                  >
                    Florals for Every Occasion
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    style={{
                      fontFamily: "Marcellus SC",
                      color: "rgba(52,105,63,0.85)",
                      marginTop: 10,
                      maxWidth: 820,
                      marginLeft: "auto",
                      marginRight: "auto",
                      lineHeight: 1.55,
                    }}
                  >
                    Thoughtful design, fresh blooms, and a signature touch—tailored to your day and your story.
                  </Typography>
                </motion.div>
              </Grid>

              {eventTypes.map((ev) => (
                <Grid key={ev.title} item xs={12} sm={12} md={4}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ height: "100%" }}
                  >
                      <div style={imageWrapStyle}>
                        <motion.img
                        src={ev.img}
                        alt={ev.title}
                        style={imageStyle}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 0.8 }}
                        whileHover={{ scale: 0.9 }}   // optional hover zoom
                        transition={{ duration: 0.35 }}
                        />
                      </div>

                        <Typography
                          variant="h4"
                          align="center"
                          style={{
                            fontFamily: "Marcellus SC",
                            color: "#34693F",
                            marginBottom: 10,
                            textShadow: "0 0 16px rgba(52,105,63,0.10)",
                          }}
                        >
                          {ev.title}
                        </Typography>

                        <Typography
                          variant="body1"
                          align="center"
                          style={{
                            fontFamily: "GeorgiaB",
                            color: "rgba(52,105,63,0.88)",
                            lineHeight: 1.7,
                            padding: "0 6px",
                          }}
                        >
                          {ev.blurb}
                        </Typography>

                        <div
                          style={{
                            marginTop: 16,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          
                        </div>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </div>
      

        <br />
      </div>
    )
  }
}
