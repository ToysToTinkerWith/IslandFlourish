import React, { useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import Alert from "@mui/material/Alert"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Typography } from "@mui/material"
import { useRouter } from "next/router"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

import { db } from "../Firebase/FirebaseInit"

/**
 * Island Flourish Footer (creative layout)
 * - Shows a flower on the right side of the active page under Explore
 * - Active state matches exact path OR nested routes:
 *   e.g. /moments/1234 still highlights /moments
 * - Scrolls to top on footer navigation
 */
export default function IslandFlourishFooter({
  logoSrc = "/smallLogo.svg",
  logoAlt = "Island Flourish",
  onNavigate, // optional: (path) => void
  companyName = "Island Flourish",
  tagline = "Floral design for weddings, events, and venues",
  email = "hello@islandflourish.com", // change if needed
  locationText = "Floral design for weddings, events, and venues",
  showTopDivider = true,
}) {
  const isMobile = useMediaQuery("(max-width:600px)")
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const router = useRouter()
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    service: "",
    review: "",
  })
  const [reviewStatus, setReviewStatus] = useState(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const links = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Gallery", href: "/gallery" },
      { label: "A La Carte", href: "/carte" },
      { label: "Contact", href: "/contact" },
    ],
    []
  )

  const eventLinks = useMemo(
    () => [
      { label: "News & Events", href: "/news-events" },
      { label: "Full Service Weddings", href: "/full-service-weddings" },
    ],
    []
  )

  const scrollTop = () => {
    if (typeof window === "undefined") return
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }

  const go = async (href) => {
    scrollTop()

    if (onNavigate) {
      onNavigate(href)
      return
    }

    if (router?.push) {
      await router.push(href, undefined, { scroll: true })
      scrollTop()
      return
    }

    window.location.href = href
  }

  const currentPath = useMemo(() => {
    const asPath = router?.asPath || ""
    const clean = asPath.split("?")[0].split("#")[0]
    if (clean) return clean
    if (typeof window !== "undefined") return window.location.pathname || "/"
    return "/"
  }, [router?.asPath])

  const isActive = (href) => {
    const normalize = (p) => {
      if (!p) return "/"
      const clean = p.split("?")[0].split("#")[0]
      if (clean === "/") return "/"
      return clean.replace(/\/+$/, "")
    }

    const path = normalize(currentPath)
    const target = normalize(href)

    if (target === "/") return path === "/"
    return path === target || path.startsWith(`${target}/`)
  }

  const updateReviewField = (field) => (event) => {
    setReviewForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (reviewStatus) setReviewStatus(null)
  }

  const submitReview = async (event) => {
    event.preventDefault()

    const name = reviewForm.name.trim()
    const email = reviewForm.email.trim()
    const service = reviewForm.service.trim()
    const review = reviewForm.review.trim()

    if (!name || !review) {
      setReviewStatus({
        severity: "error",
        message: "Please add your name and review before sending.",
      })
      return
    }

    setIsSubmittingReview(true)

    try {
      await addDoc(collection(db, "serviceReviews"), {
        name,
        email: email || null,
        service: service || null,
        review,
        approved: false,
        source: "footer",
        created: serverTimestamp(),
      })

      setReviewForm({ name: "", email: "", service: "", review: "" })
      setReviewStatus({
        severity: "success",
        message: "Thank you for sharing your review.",
      })
    } catch (error) {
      setReviewStatus({
        severity: "error",
        message: "Your review could not be sent right now. Please try again soon.",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const year = new Date().getFullYear()
  const logoH = isMobile ? 120 : isCondensed ? 150 : 175

  return (
    <Box component="footer" sx={{ background: "#EFE7DC", color: "inherit" }}>
      <hr style={{ margin: 40, marginBottom: 0, border: "1px solid #304742" }} />

      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 4, md: 5 },
          pb: { xs: 3, md: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Grid
          container
          spacing={isMobile ? 3 : 2.5}
          justifyContent="center"
          sx={{ position: "relative" }}
        >
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 1.1,
              }}
            >
              <Box
                onClick={() => go("/")}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                  borderRadius: 999,
                  px: 3,
                  py: 2,
                }}
              >
                <Box
                  component="img"
                  src={logoSrc}
                  alt={logoAlt}
                  sx={{
                    height: logoH,
                    width: "auto",
                    display: "block",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  maxWidth: 380,
                  color: "#304742",
                  fontFamily: "GeorgiaB",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                {tagline}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 1,
                  pt: 0.5,
                  width: "min(100%, 520px)",
                }}
              >
                {eventLinks.map((l) => {
                  const active = isActive(l.href)

                  return (
                    <Button
                      key={l.href}
                      onClick={() => go(l.href)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        fontWeight: 800,
                        color: "#304742",
                        borderRadius: 999,
                        px: 1.4,
                        py: 0.85,
                        border: "1px solid #304742",
                        minWidth: 0,
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "GeorgiaB",
                          fontWeight: 800,
                          color: "#304742",
                          fontSize: { xs: 11, sm: 12 },
                          lineHeight: 1.15,
                          textAlign: "center",
                        }}
                      >
                        {l.label}
                      </Typography>

                      <Box
                        sx={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 16,
                          height: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        {active ? (
                          <Typography
                            aria-hidden="true"
                            sx={{
                              color: "#304742",
                              fontFamily: "GeorgiaB",
                              fontSize: "0.9rem",
                              lineHeight: 1,
                              fontWeight: 800,
                            }}
                          >
                            ✿
                          </Typography>
                        ) : null}
                      </Box>
                    </Button>
                  )
                })}
              </Box>

              <Button
                onClick={() => window.open("https://www.instagram.com/island.flourish/")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 0.8,
                  px: 0,
                  py: 0.4,
                  borderRadius: 0,
                  textTransform: "none",
                  color: "#304742",
                  borderBottom: "1px solid #304742",
                }}
              >
                <Box
                  component="img"
                  src="/insta.png"
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: 28,
                    height: 28,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#304742",
                    fontFamily: "GeorgiaB",
                    fontWeight: 800,
                  }}
                >
                  Island Flourish Instagram
                </Typography>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 5,
                p: 2.2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: "GeorgiaB",
                  fontWeight: 800,
                  color: "#304742",
                  letterSpacing: "0.02em",
                  mb: 1.25,
                }}
              >
                Explore
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.05 }}>
                {links.map((l) => {
                  const active = isActive(l.href)

                  return (
                    <Button
                      key={l.href}
                      onClick={() => go(l.href)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        fontWeight: 800,
                        color: "#304742",
                        borderRadius: 999,
                        px: 2,
                        py: 1.05,
                        border: "1px solid #304742",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            fontFamily: "GeorgiaB",
                            fontWeight: 800,
                            letterSpacing: "0.01em",
                            color: "#304742",
                          }}
                        >
                          {l.label}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ml: 1.25,
                          flexShrink: 0,
                        }}
                      >
                        {active ? (
                          <Typography
                            aria-hidden="true"
                            sx={{
                              color: "#304742",
                              fontFamily: "GeorgiaB",
                              fontSize: "1rem",
                              lineHeight: 1,
                              fontWeight: 800,
                            }}
                          >
                            ✿
                          </Typography>
                        ) : null}
                      </Box>
                    </Button>
                  )
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        component="section"
        sx={{
          width: "100%",
          px: { xs: 2, md: 4 },
          pb: { xs: 3.5, md: 4.5 },
        }}
      >
        <Divider sx={{ borderColor: "rgba(48,71,66,0.28)", mb: { xs: 2.5, md: 3 } }} />

        <Box
          component="form"
          onSubmit={submitReview}
          sx={{
            display: "grid",
            gap: 1.25,
            width: "100%",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "GeorgiaB",
              fontWeight: 800,
              color: "#304742",
              letterSpacing: "0.02em",
            }}
          >
            Share a Review
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
              gap: 1,
            }}
          >
            <TextField
              value={reviewForm.name}
              onChange={updateReviewField("name")}
              label="Name"
              size="small"
              required
              fullWidth
              sx={reviewFieldSx}
            />
            <TextField
              value={reviewForm.email}
              onChange={updateReviewField("email")}
              label="Email"
              type="email"
              size="small"
              fullWidth
              sx={reviewFieldSx}
            />
            <TextField
              value={reviewForm.service}
              onChange={updateReviewField("service")}
              label="Service or event"
              size="small"
              fullWidth
              sx={reviewFieldSx}
            />
          </Box>

          <TextField
            value={reviewForm.review}
            onChange={updateReviewField("review")}
            label="Review"
            required
            multiline
            minRows={3}
            fullWidth
            sx={reviewFieldSx}
          />

          {reviewStatus ? (
            <Alert
              severity={reviewStatus.severity}
              sx={{
                fontFamily: "Georgia",
                color: "#304742",
                backgroundColor:
                  reviewStatus.severity === "success"
                    ? "rgba(48,71,66,0.10)"
                    : "rgba(233,118,91,0.16)",
                "& .MuiAlert-icon": {
                  color: reviewStatus.severity === "success" ? "#304742" : "#E9765B",
                },
              }}
            >
              {reviewStatus.message}
            </Alert>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmittingReview}
            sx={{
              justifySelf: "start",
              textTransform: "none",
              fontFamily: "GeorgiaB",
              fontWeight: 800,
              color: "#EFE7DC",
              backgroundColor: "#304742",
              borderRadius: 999,
              px: 2.5,
              py: 0.9,
              "&:hover": {
                backgroundColor: "#263935",
              },
              "&.Mui-disabled": {
                color: "rgba(239,231,220,0.72)",
                backgroundColor: "rgba(48,71,66,0.58)",
              },
            }}
          >
            {isSubmittingReview ? "Sending..." : "Send Review"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#304742" }} />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#304742",
            fontFamily: "GeorgiaB",
            fontWeight: 800,
            letterSpacing: "0.02em",
          }}
        >
          © {year} {companyName}. All rights reserved.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Button
            style={{
              display: "flex",
              margin: "auto",
              borderBottom: "1px solid #304742",
              borderRadius: 0,
              textTransform: "none",
            }}
            onClick={() => window.open("https://bergquistapplications.com")}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "GeorgiaB",
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#304742",
              }}
            >
              Website created by Bergquist Applications LLC
            </Typography>
          </Button>

          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#304742",
              boxShadow: "0 0 18px #304742",
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

const reviewFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "rgba(247,241,232,0.78)",
    color: "#304742",
    fontFamily: "Georgia",
    "& fieldset": {
      borderColor: "rgba(48,71,66,0.42)",
    },
    "&:hover fieldset": {
      borderColor: "#304742",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#304742",
      borderWidth: 1,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#304742",
    fontFamily: "Georgia",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#304742",
  },
}
