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
  tagline = "Serving Whidbey Island Events & Venues",
  email = "hello@islandflourish.com", // change if needed
  locationText = "Serving Whidbey Island Events & Venues",
  showTopDivider = true,
}) {
  const isMobile = useMediaQuery("(max-width:600px)")
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const router = useRouter()

  const links = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Gallery", href: "/gallery" },
      { label: "A La Carte", href: "/carte" },
      { label: "Contact", href: "/contact" },
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