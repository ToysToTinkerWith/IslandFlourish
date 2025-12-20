import React, { useMemo } from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Typography } from "@mui/material"
import { useRouter } from "next/router"

/**
 * Island Flourish Footer (creative layout)
 * - Adds a small /flower.png next to the current page link (same as nav)
 */
export default function IslandFlourishFooter({
  logoSrc = "/smallLogo.svg",
  logoAlt = "Island Flourish",
  onNavigate, // optional: (path) => void
  companyName = "Island Flourish",
  tagline = "Florals for meaningful moments",
  email = "hello@islandflourish.com", // change if needed
  locationText = "Serving  Whidbey Island events & venues",
  showTopDivider = true,
}) {
  const isMobile = useMediaQuery("(max-width:600px)")
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const router = useRouter()

  const links = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Moments", href: "/moments" },
      { label: "Contact", href: "/contact" },
    ],
    []
  )

  const go = (href) => {
    if (onNavigate) onNavigate(href)
    else if (router?.push) router.push(href)
    else window.location.href = href
  }

  const currentPath = useMemo(() => {
    const asPath = router?.asPath || ""
    const clean = asPath.split("?")[0].split("#")[0]
    if (clean) return clean
    if (typeof window !== "undefined") return window.location.pathname || "/"
    return "/"
  }, [router?.asPath])

  const isActive = (href) => {
    const norm = (p) => (p !== "/" ? p.replace(/\/+$/, "") : "/")
    return norm(currentPath) === norm(href)
  }

  const Flower = ({ show }) =>
    show ? (
      <Box
        component="img"
        src="/flower.png"
        alt=""
        aria-hidden="true"
        sx={{
          height: 16,
          width: 16,
          display: "block",
          ml: 1,
        }}
      />
    ) : null

  const year = new Date().getFullYear()
  const logoH = isMobile ? 120 : isCondensed ? 150 : 175

  return (
    <Box component="footer" sx={{ background: "#121212", color: "inherit" }}>
      {/* Top “crest” section */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 4, md: 5 },
          pb: { xs: 3, md: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow + subtle texture */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: -2,
            pointerEvents: "none",
            opacity: 0.18,
            filter: "blur(0.2px)",
          }}
        />

        <Grid
          container
          spacing={isMobile ? 3 : 2.5}
          alignItems="center"
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
                {/* petal halo */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: -26,
                    borderRadius: 999,
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(107,170,106,0.22), transparent 60%)",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                  }}
                />

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
                    filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.55))",
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  maxWidth: 380,
                  color: "rgba(107,170,106,0.72)",
                  fontFamily: "GeorgiaB",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                {tagline}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "GeorgiaB",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {locationText}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 5,
                border: "1px solid rgba(107,170,106,0.22)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                p: 2.2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: "GeorgiaB",
                  fontWeight: 800,
                  color: "#6BAA6A",
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
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        fontWeight: 800,
                        color: "rgba(107,170,106,0.92)",
                        borderRadius: 999,
                        px: 2,
                        py: 1.05,
                        background:
                          "linear-gradient(90deg, rgba(107,170,106,0.08), transparent)",
                        border: "1px solid rgba(107,170,106,0.18)",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, rgba(107,170,106,0.14), transparent)",
                          borderColor: "rgba(107,170,106,0.30)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            fontFamily: "GeorgiaB",
                            fontWeight: 800,
                            letterSpacing: "0.01em",
                          }}
                        >
                          {l.label}
                        </Typography>
                        <Flower show={active} />
                      </Box>
                    </Button>
                  )
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Bottom bar */}
      <Divider sx={{ borderColor: "rgba(107,170,106,0.18)" }} />
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
            color: "rgba(107,170,106,0.65)",
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
              borderBottom: "1px solid rgba(107,170,106,0.92)",
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
                color: "rgba(107,170,106,0.92)",
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
              backgroundColor: "rgba(107,170,106,0.85)",
              boxShadow: "0 0 18px rgba(107,170,106,0.25)",
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
