import React, { useEffect, useRef, useState } from "react"
import Head from "next/head"
import { Grid, Button, Typography } from "@mui/material"
import { db } from "../Firebase/FirebaseInit"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { motion } from "framer-motion"

function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.35,
  rootMargin = "0px 0px -15% 0px",
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
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
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.85, ease: "easeOut", delay }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

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
  worksUnsub = null
  imgsUnsubs = new Map()

  componentDidMount() {
    const worksRef = collection(db, "works")

    this.worksUnsub = onSnapshot(worksRef, (workSnap) => {
      this.setState({ works: [], imgs: [] })

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

        this.setState((prev) => ({
          works: [...prev.works, normalized],
        }))

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
            imgs: [...prev.imgs, ...imgs],
          }))
        })

        this.imgsUnsubs.set(workId, unsubImgs)
      })
    })

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

        {/* =========================
            HERO WRAP: splash image continues behind slideshow
           ========================= */}
        <div
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* Background image spans BOTH sections */}
          <img
            src="/splash.png"
            alt="Island Flourish splash"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              zIndex: 0,
            }}
          />

          {/* Optional: subtle readability overlay (NOT a fade-to-black; just a light tint) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: "rgba(0,0,0,0.10)",
            }}
          />

          {/* Foreground content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              paddingTop: 50, // ✅ moves BOTH title + slideshow down ~200px
            }}
          >
            {/* Splash title area */}
            <Grid container style={{ width: "100%" }}>
              <Grid item xs={12}>
                <RevealOnScroll>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "clamp(260px, 46vw, 520px)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        component="h2"
                        style={{
                          fontFamily: "Brasika",
                          color: "#EFE7DC",
                          letterSpacing: "clamp(0.5px, 0.15vw, 0.8px)",
                          fontSize: "clamp(36px, 6vw, 78px)",
                          lineHeight: 1.02,
                          textShadow:
                            "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
                          padding: "0 6px",
                          maxWidth: 980,
                        }}
                      >
                        ISLAND FLOURISH
                      </Typography>
                    </div>
                  </div>
                </RevealOnScroll>
              </Grid>
            </Grid>

            {/* Slideshow section now sits INSIDE the same hero background */}
            <RevealOnScroll delay={0.06} threshold={0} rootMargin="0px 0px -10% 0px">
              <Grid
                container
                style={{
                  height: "min(75vw, 580px)",
                  minHeight: 440,
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: "transparent",
                  backdropFilter: "blur(2px)",
                }}
              >
                {activeSlide ? (
                  <motion.div
                    key={safeIndex}
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
                              fontFamily: "Brasika",
                              color: "#EFE7DC",
                              marginBottom: "clamp(10px, 2vw, 22px)",
                              textShadow: "0 0 18px rgba(107,170,106,0.18)",
                              maxWidth: "100%",
                              textShadow:
                            "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
                            }}
                          >
                            {activeSlide.item}
                          </Typography>
                        </motion.div>
                      </Grid>

                      {[0, 1, 2].map((i) => (
                        <Grid key={i} item xs={4} sm={4} md={4}>
                          <motion.div
                            animate={{
                              opacity: [0, 1, 1, 1, 1, 1, 0, 0],
                              y: [10, 0, 0, 0, 0, -6, -6, -6],
                            }}
                            transition={{ duration: 12, delay: i }}
                            style={{ display: "grid", padding: "5%", gap: 10 }}
                          >
                            <div
                              style={{
                                width: "100%",
                                margin: "0 auto",
                                borderRadius: 10,
                                overflow: "hidden",
                                border: "1px solid #EFE7DC",
                                boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
                                background:
                                  "radial-gradient(700px 240px at 20% 0%, rgba(107,170,106,0.18), rgba(18,18,18,0))",
                              }}
                            >
                              <img
                                src={activeSlide.imgs[i].url}
                                style={{
                                  width: "100%",
                                  height: "clamp(250px, 42vw, 320px)",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                alt={`${activeSlide.item} ${i + 1}`}
                              />
                            </div>

                            <Typography
                              align="center"
                              variant="caption"
                              style={{
                                fontFamily: "Georgia",
                                color: "#EFE7DC",
                                padding: "2% 6%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                minHeight: "3.2em",
                                textShadow: "0 2px 10px rgba(0,0,0,0.45)",
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

                <Button
                  style={{
                    position: "absolute",
                    color: "#304742",
                    right: "clamp(12px, 3vw, 28px)",
                    bottom: "clamp(12px, 3vw, 28px)",
                    padding: 10,
                    border: "1px solid #304742",
                    borderRadius: 10,
                    zIndex: 5,
                    textTransform: "none",
                    fontFamily: "GeorgiaB",
                    background: "#EFE7DC",
                    backdropFilter: "blur(8px)",
                  }}
                  href="/gallery"
                >
                  <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                    View Gallery
                  </Typography>
                </Button>
              </Grid>
            </RevealOnScroll>
          </div>
        </div>

        {/* =========================
            A LA CARTE SECTION (replaces Events)
           ========================= */}
        <div>
          <RevealOnScroll delay={0.02} threshold={0}>
            <div
              style={{
                position: "relative",
                background: "#EFE7DC",
              }}
            >
              {/* Corner accents */}
              <img
                src="/accent.svg"
                alt=""
                aria-hidden="true"
                style={{
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
                }}
              />
              <img
                src="/accent.svg"
                alt=""
                aria-hidden="true"
                style={{
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
                }}
              />
              <img
                src="/accent.svg"
                alt=""
                aria-hidden="true"
                style={{
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
                }}
              />
              <img
                src="/accent.svg"
                alt=""
                aria-hidden="true"
                style={{
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
                }}
              />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h2"
                  align="center"
                  style={{
                    fontFamily: "Brasika",
                    color: "#304742",
                    letterSpacing: 0.6,
                    margin: "3vw",
                    paddingTop: 40,
                    textShadow: "0 0 22px rgba(48,71,66,0.12)",
                  }}
                >
                  A LA CARTE
                </Typography>

                <Typography
                  variant="body1"
                  align="center"
                  style={{
                    fontFamily: "GeorgiaB",
                    color: "#304742",
                    lineHeight: 1.85,
                    margin: "auto",
                    paddingLeft: "12vw",
                    paddingRight: "12vw",
                  }}
                >
                  Our à la carte wedding package is ideal for couples drawn to Island Flourish’s
                  whimsical, garden-inspired aesthetic who are seeking something beautifully simple.
                  Designed for celebrations that don’t require large-scale installations or on-site
                  setup, this option is perfect for personal flowers, centerpieces, and a few
                  thoughtfully placed focal arrangements. À la carte orders have a seasonal minimum
                  of $250 for weddings held May through September and $750 for weddings October
                  through April. Simply choose your sizes and quantities, share your color palette,
                  and trust us to take care of the rest.
                </Typography>

                <div style={{ height: 18 }} />

                <Typography
                  variant="h6"
                  align="center"
                  style={{
                    fontFamily: "GeorgiaB",
                    color: "#304742",
                    margin: "0 auto",
                    maxWidth: 900,
                    lineHeight: 1.6,
                    paddingLeft: "10vw",
                    paddingRight: "10vw",
                  }}
                >
                  This package is best suited for couples with flexible flower preferences and
                  uncomplicated design needs.
                </Typography>

                <br />

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    href="/carte"
                    style={{
                      textTransform: "none",
                      fontFamily: "GeorgiaB",
                      borderRadius: 12,
                      padding: "10px 18px",
                      border: "1px solid #304742",
                      color: "#304742",
                      background: "#EFE7DC",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
                    }}
                  >
                    <Typography variant="h6" style={{ fontFamily: "GeorgiaB" }}>
                      More Details
                    </Typography>
                  </Button>
                </div>

                <br />
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <br />
      </div>
    )
  }
}