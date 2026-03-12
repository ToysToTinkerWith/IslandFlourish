import React, { useMemo, useState } from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
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
  const isMobile = useMediaQuery("(max-width:850px)")
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const links = [
    { label: "Home", href: "/" },
    { label: "Gallery", href: "/gallery" },
    { label: "A La Carte", href: "/carte", isCarte: true },
    { label: "Contact", href: "/contact" },
  ]

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

  const btnFontSize = isCondensed ? 16 : 18
  const btnPx = isCondensed ? 3.5 : 2.25
  const btnPy = isCondensed ? 0.9 : 1.1

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
            gap: 2,
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
          {!isMobile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isCondensed ? 2.75 : 3,
                flexShrink: 0,
              }}
            >
              {links.map((l) => {
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
                      px: isCarte ? (isCondensed ? 2.6 : 2.9) : btnPx,
                      py: isCarte ? (isCondensed ? 1.05 : 1.2) : btnPy,
                      lineHeight: 1,
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
                        padding: 0.5,
                        fontFamily: "Brasika",
                        lineHeight: 1,
                        letterSpacing: 2,
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
          ) : (
            <IconButton
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              sx={{
                color: "#EFE7DC",
                borderRadius: 999,
                border: "1px solid #EFE7DC",
                backgroundColor: "transparent",
                flexShrink: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, pt: 1, background: "#121212", height: "100%" }}>
          <List>
            {links.map((l) => {
              const active = isActive(l.href)
              const isCarte = !!l.isCarte

              return (
                <ListItemButton
                  key={l.href}
                  onClick={() => {
                    setOpen(false)
                    go(l.href)
                  }}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 999,
                    backgroundColor: isCarte ? "#EFE7DC" : "transparent",
                    "&:hover": {
                      backgroundColor: isCarte
                        ? "#EFE7DC"
                        : "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 800,
                            fontSize: 18,
                            color: isCarte ? "#304742" : "#EFE7DC",
                            fontFamily: "Brasika",
                            textDecoration: active ? "underline" : "none",
                            textUnderlineOffset: "6px",
                            textDecorationThickness: "2px",
                            textDecorationColor: isCarte
                              ? "#304742"
                              : "#EFE7DC",
                          }}
                        >
                          {l.label}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              )
            })}
          </List>
        </Box>
      </Drawer>
    </>
  )
}