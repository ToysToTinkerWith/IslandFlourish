import React, { useMemo, useState } from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import useMediaQuery from "@mui/material/useMediaQuery"
import MenuIcon from "@mui/icons-material/Menu"
import { Typography } from "@mui/material"
import { useRouter } from "next/router"

/**
 * Update:
 * - Logo moved right + made bigger
 * - Keeps active underline on current page
 * - "A La Carte" now has a cream pill background with dark green text
 * - If "A La Carte" is active, underline is also dark green
 */
export default function IslandFlourishNavBar({
  logoSrc = "/smallLogoWhite.svg",
  logoAlt = "Island Flourish",
  onNavigate,
}) {
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const isTight = useMediaQuery("(max-width:1050px)")
  const router = useRouter()

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuMode, setMenuMode] = useState("secondary")

  const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "A La Carte", href: "/carte", isCarte: true },
    { label: "Contact", href: "/contact" },
  ]

  const secondaryLinks = [
    { label: "News & Events", href: "/news-events" },
    { label: "Full Service Weddings", href: "/full-service-weddings" },
  ]

  const menuLinks = menuMode === "all" ? [...primaryLinks, ...secondaryLinks] : secondaryLinks
  const menuOpen = Boolean(menuAnchor)

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

  const go = (href) => {
    if (onNavigate) onNavigate(href)
    else if (router?.push) router.push(href)
    else window.location.href = href
  }

  const openMenu = (event, mode = "secondary") => {
    setMenuMode(mode)
    setMenuAnchor(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuAnchor(null)
  }

  const goFromMenu = (href) => {
    closeMenu()
    go(href)
  }

  const btnFontSize = isTight ? 13 : isCondensed ? 15 : 18
  const btnPx = isTight ? 1.1 : isCondensed ? 1.75 : 2.25
  const btnPy = isTight ? 0.65 : isCondensed ? 0.8 : 1.1
  const carteBtnPx = isTight ? 1.35 : isCondensed ? 2.1 : 2.9
  const carteBtnPy = isTight ? 0.75 : isCondensed ? 0.9 : 1.2
  const navGap = isCondensed ? 1.9 : 3
  const labelPadding = isTight ? 0.15 : isCondensed ? 0.3 : 0.5
  const labelLetterSpacing = isTight ? 0 : isCondensed ? 0.75 : 2

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          position: "absolute",
          backgroundColor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          color: "inherit",
          paddingTop: 4,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 76,
            px: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isTight ? 1 : 2,
            "@media (max-width:1050px)": {
              gap: 1,
            },
          }}
        >
          {/* LEFT: Logo */}
          <Box
            onClick={() => go("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              flexShrink: 0,
              ml: { xs: 1.5, md: 3.5 },
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt={logoAlt}
              sx={{
                height: { xs: 64, sm: 82, md: 104 },
                width: "auto",
                display: "block",
              }}
            />
          </Box>

          {/* RIGHT: Desktop links / Mobile menu */}
          <>
            <Box
              sx={{
                display: "flex",
                "@media (max-width:850px)": {
                  display: "none",
                },
                flexDirection: "column",
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: navGap,
                  "@media (max-width:1200px)": {
                    gap: 1.9,
                  },
                  "@media (max-width:1050px)": {
                    gap: 1.9,
                  },
                }}
              >
                {primaryLinks.map((l) => {
                  const active = isActive(l.href)
                  const isCarte = !!l.isCarte

                  return (
                    <Button
                      key={l.href}
                      onClick={() => go(l.href)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: btnFontSize,
                        letterSpacing: "0.01em",
                        borderRadius: 999,
                        px: isCarte ? carteBtnPx : btnPx,
                        py: isCarte ? carteBtnPy : btnPy,
                        lineHeight: 1,
                        "@media (max-width:1200px)": {
                          fontSize: 15,
                          px: isCarte ? 2.1 : 1.75,
                          py: isCarte ? 0.9 : 0.8,
                        },
                        "@media (max-width:1050px)": {
                          fontSize: 13,
                          px: isCarte ? 1.35 : 1.1,
                          py: isCarte ? 0.75 : 0.65,
                        },
                        textShadow: isCarte
                          ? "none"
                          : "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
                        color: isCarte ? "#304742" : "#EFE7DC",
                        backgroundColor: isCarte ? "#EFE7DC" : "transparent",
                        "&:hover": {
                          backgroundColor: isCarte
                            ? "#EFE7DC"
                            : "rgba(0,0,0,0.06)",
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          padding: labelPadding,
                          fontFamily: "Brasika",
                          fontSize: "inherit",
                          lineHeight: 1,
                          letterSpacing: labelLetterSpacing,
                          "@media (max-width:1200px)": {
                            padding: 0.3,
                            letterSpacing: 0.75,
                          },
                          "@media (max-width:1050px)": {
                            padding: 0.15,
                            letterSpacing: 0,
                          },
                          color: isCarte ? "#304742" : "#EFE7DC",
                          textDecoration: active ? "underline" : "none",
                          textUnderlineOffset: "8px",
                          textDecorationThickness: "2px",
                          textDecorationColor: isCarte ? "#304742" : "#EFE7DC",
                        }}
                      >
                        {l.label}
                      </Typography>
                    </Button>
                  )
                })}
              </Box>
              <IconButton
                aria-label="Open more navigation"
                aria-controls={menuOpen ? "nav-more-menu" : undefined}
                aria-expanded={menuOpen ? "true" : undefined}
                aria-haspopup="menu"
                onClick={(event) => openMenu(event, "secondary")}
                sx={{
                  color: "#EFE7DC",
                  borderRadius: 999,
                  border: "1px solid #EFE7DC",
                  backgroundColor: "rgba(0,0,0,0.08)",
                  mt: 1,
                  mr: 1.5,
                  transform: "translate(-10px, 20px)",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.14)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <IconButton
              aria-label="Open navigation"
              aria-controls={menuOpen ? "nav-more-menu" : undefined}
              aria-expanded={menuOpen ? "true" : undefined}
              aria-haspopup="menu"
              onClick={(event) => openMenu(event, "all")}
              sx={{
                display: "none",
                "@media (max-width:850px)": {
                  display: "inline-flex",
                },
                color: "#EFE7DC",
                borderRadius: 999,
                border: "1px solid #EFE7DC",
                backgroundColor: "transparent",
                flexShrink: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          </>
        </Toolbar>
      </AppBar>

      <Menu
        id="nav-more-menu"
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 3,
            background: "#EFE7DC",
            border: "1px solid rgba(48,71,66,0.22)",
            boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
            p: 1,
          },
        }}
      >
        {menuLinks.map((l) => {
          const active = isActive(l.href)

          return (
            <MenuItem
              key={l.href}
              onClick={() => goFromMenu(l.href)}
              sx={{
                my: 0.5,
                borderRadius: 999,
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(48,71,66,0.08)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  py: 0.35,
                  px: 0.5,
                  fontFamily: "Brasika",
                  fontSize: 18,
                  lineHeight: 1.1,
                  letterSpacing: 1,
                  color: "#304742",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "6px",
                  textDecorationThickness: "2px",
                  textDecorationColor: "#304742",
                }}
              >
                {l.label}
              </Typography>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
