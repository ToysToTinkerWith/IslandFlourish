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
 * - Shows a small /flower.png next to the current page link
 * - No active border / gradient / background styling
 */
export default function IslandFlourishNavBar({
  logoSrc = "/smallLogo.svg",
  logoAlt = "Island Flourish",
  onNavigate, // optional: (path) => void
}) {
  const isMobile = useMediaQuery("(max-width:600px)")
  const isCondensed = useMediaQuery("(max-width:1200px)")
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const links = [
    { label: "Home", href: "/" },
    { label: "Moments", href: "/moments" },
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
    const norm = (p) => (p !== "/" ? p.replace(/\/+$/, "") : "/")
    return norm(currentPath) === norm(href)
  }

  const go = (href) => {
    if (onNavigate) onNavigate(href)
    else if (router?.push) router.push(href)
    else window.location.href = href
  }

  const btnFontSize = isCondensed ? 16 : 18
  const btnPx = isCondensed ? 3.5 : 2.25
  const btnPy = isCondensed ? 0.9 : 1.1

  const Flower = ({ show }) =>
    show ? (
      <Box
        component="img"
        src="/flower.png"
        alt=""
        aria-hidden="true"
        sx={{
          height: 18,
          width: 18,
          display: "block",
          ml: 1,
        }}
      />
    ) : null

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "#121212",
          backdropFilter: "blur(10px)",
          color: "inherit",
        }}
      >
        <Toolbar sx={{ minHeight: 76, px: { xs: 2, md: 3 } }}>
          {/* Logo */}
          <Box
            onClick={() => go("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt={logoAlt}
              sx={{ height: 106, width: "auto", display: "block" }}
            />
          </Box>

          <Box sx={{ flexGrow: 0.9 }} />

          {/* Desktop links */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: isCondensed ? 2.75 : 3 }}>
              {links.map((l) => {
                const active = isActive(l.href)
                return (
                  <Button
                    key={l.href}
                    onClick={() => go(l.href)}
                    sx={{
                      textTransform: "none",
                      fontFamily: "GeorgiaB",
                      fontWeight: 700,
                      fontSize: btnFontSize,
                      letterSpacing: "0.01em",
                      borderRadius: 999,
                      px: btnPx,
                      py: btnPy,
                      lineHeight: 1,
                      color: "#6BAA6A",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: "GeorgiaB", lineHeight: 1 }}
                      >
                        {l.label}
                      </Typography>
                      <Flower show={active} />
                    </Box>
                  </Button>
                )
              })}
            </Box>
          )}

          {/* Mobile menu */}
          {isMobile && (
            <IconButton
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              sx={{
                color: "#6BAA6A",
                borderRadius: 999,
                border: "1px solid #6BAA6A",
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, pt: 1 }}>
          <List>
            {links.map((l) => {
              const active = isActive(l.href)
              return (
                <ListItemButton
                  key={l.href}
                  onClick={() => {
                    setOpen(false)
                    go(l.href)
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box component="span" sx={{ fontWeight: 800, fontSize: 18 }}>
                          {l.label}
                        </Box>
                        <Flower show={active} />
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
