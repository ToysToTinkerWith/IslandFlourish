// pages/contact/EventFlowersForm.js (or components/EventFlowersForm.js)

import React from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"
import { db } from "../Firebase/FirebaseInit"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

import {
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Alert,
  CircularProgress,
  Modal,
  IconButton,
} from "@mui/material"

import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import CloseIcon from "@mui/icons-material/Close"

function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -15% 0px",
}) {
  const ref = React.useRef(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
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
        animate={
          shown
            ? { opacity: 1, marginTop: 0, filter: "blur(0px)" }
            : { opacity: 0, marginTop: 24, filter: "blur(2px)" }
        }
        transition={{ duration: 0.85, ease: "easeOut", delay }}
        style={{ willChange: "opacity, margin, filter" }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default class EventFlowersForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      name: "",
      email: "",
      phone: "",
      preferredReach: "Email",
      eventType: "",
      eventDate: "",
      budget: "",
      details: "",
      submitting: false,
      success: false,
      error: "",
      touched: {},

      aName: "",
      aEmail: "",
      aPhone: "",
      aPreferredReach: "Email",
      aEventType: "",
      aEventDate: "",
      aNotes: "",
      aSubmitting: false,
      aSuccess: false,
      aError: "",
      aTouched: {},
      aLaCarteQuantities: {
        lushBridalBouquet: "",
        attendantsBouquet: "",
        singleVarietyBouquet: "",
        boutonniere: "",
        pocketBoutonniere: "",
        corsageWrist: "",
        corsagePinOn: "",
        flowerCrownAdult: "",
        flowerCrownChild: "",
        hairFlowers: "",
        silkRibbonTreatment: "",
        statementPiece: "",
        focalArrangement: "",
        floralChairDecor: "",
        budvase3: "",
        budvase5: "",
        petiteBouquetReception: "",
        lowLushCenterpiece: "",
        cakeFlowers: "",
        rosePetals: "",
      },

      imageModalOpen: false,
      imageModalSrc: "",
      imageModalAlt: "",
    }
  }

  personalFlowers = [
    {
      key: "lushBridalBouquet",
      title: "Lush Bridal Bouquet",
      price: "$250",
      unitPrice: 250,
      description: "Deluxe garden-inspired bouquet.",
      image: "/flowers/alacarte/lush-bridal-bouquet.jpg",
    },
    {
      key: "attendantsBouquet",
      title: "Attendant’s Bouquet",
      price: "$125",
      unitPrice: 125,
      description: "Smaller version of the bridal bouquet.",
      image: "/flowers/alacarte/attendants-bouquet.jpg",
    },
    {
      key: "singleVarietyBouquet",
      title: "Single Variety Bouquet",
      price: "$65",
      unitPrice: 65,
      description: "Perfect for a toss bouquet or young attendant.",
      image: "/flowers/alacarte/single-variety-bouquet.jpg",
    },
    {
      key: "boutonniere",
      title: "Boutonniere",
      price: "$25",
      unitPrice: 25,
      description: "Petite floral accents suitable for a coat lapel or shirt pocket.",
      image: "/flowers/alacarte/boutonniere.jpg",
    },
    {
      key: "pocketBoutonniere",
      title: "Pocket Boutonniere",
      price: "$45",
      unitPrice: 45,
      description:
        "Similar to a boutonniere, but easier. No pins, just place it in the suit pocket.",
      image: "/flowers/alacarte/pocket-boutonniere.jpg",
    },
    {
      key: "corsageWrist",
      title: "Corsage — Wrist",
      price: "$45",
      unitPrice: 45,
      description: "Floral accents designed to be worn on the wrist.",
      image: "/flowers/alacarte/corsage.jpg",
    },
    {
      key: "corsagePinOn",
      title: "Corsage — Pin-on",
      price: "$35",
      unitPrice: 35,
      description: "Floral accents designed to be pinned to a dress.",
      image: "/flowers/alacarte/corsage.jpg",
    },
    {
      key: "flowerCrownAdult",
      title: "Flower Crown — Adult",
      price: "$135",
      unitPrice: 135,
      description: "Romantic floral halo.",
      image: "/flowers/alacarte/flower-crown.jpg",
    },
    {
      key: "flowerCrownChild",
      title: "Flower Crown — Child",
      price: "$95",
      unitPrice: 95,
      description: "Floral halo sized for a child.",
      image: "/flowers/alacarte/flower-crown.jpg",
    },
    {
      key: "hairFlowers",
      title: "Hair Flowers",
      price: "$30",
      unitPrice: 30,
      description: "Individually wired flowers for pinning in hair.",
      image: "/flowers/alacarte/hair-flowers.jpg",
    },
    {
      key: "silkRibbonTreatment",
      title: "Silk Ribbon Treatment",
      price: "$20 per bouquet",
      unitPrice: 20,
      description: "Flowing silk ribbon streamers for personal bouquets.",
      image: "/flowers/alacarte/silk-ribbon-treatment.jpg",
    },
  ]

  ceremonyReceptionFlowers = [
    {
      key: "statementPiece",
      title: "Statement Piece",
      price: "$350",
      unitPrice: 350,
      description:
        "A single large, dramatic arrangement, perfect for two arrangements used as a pair to frame the front of the ceremony space.",
      image: "/flowers/alacarte/statement-piece.jpg",
    },
    {
      key: "focalArrangement",
      title: "Focal Arrangement",
      price: "$225",
      unitPrice: 225,
      description:
        "Lush, medium-size arrangement great for a guest book table, welcome sign, or bar.",
      image: "/flowers/alacarte/focal-arrangement.jpg",
    },
    {
      key: "floralChairDecor",
      title: "Floral Chair Decor",
      price: "$45",
      unitPrice: 45,
      description:
        "Petite bundles of flowers that can be attached to chairs to decorate the aisle.",
      image: "/flowers/alacarte/floral-chair-decor.jpg",
    },
    {
      key: "budvase3",
      title: "Budvase Collection — 3 Bottles",
      price: "$40",
      unitPrice: 40,
      description: "A sprinkling of bottles perfect for tables or to decorate the bar.",
      image: "/flowers/alacarte/budvase-collection.jpg",
    },
    {
      key: "budvase5",
      title: "Budvase Collection — 5 Bottles",
      price: "$60",
      unitPrice: 60,
      description: "A larger grouped budvase option for tables or accent styling.",
      image: "/flowers/alacarte/budvase-collection.jpg",
    },
    {
      key: "petiteBouquetReception",
      title: "Petite Bouquet",
      price: "$85",
      unitPrice: 85,
      description: "A sweet little arrangement perfect for cocktail tables or the lounge.",
      image: "/flowers/alacarte/petite-bouquet.jpg",
    },
    {
      key: "lowLushCenterpiece",
      title: "Low and Lush Garden Centerpiece",
      price: "$175",
      unitPrice: 175,
      description:
        "Beautiful garden-style centerpiece perfect for tables or interspersed with bud vases. It can be used as an aisle marker at the ceremony, then repurposed at the reception.",
      image: "/flowers/alacarte/low-lush-centerpiece.jpg",
    },
    {
      key: "cakeFlowers",
      title: "Cake Flowers",
      price: "$55",
      unitPrice: 55,
      description: "Small bucket of loose flowers to decorate your cake.",
      image: "/flowers/alacarte/cake-flowers.jpg",
    },
    {
      key: "rosePetals",
      title: "Rose Petals",
      price: "$20",
      unitPrice: 20,
      description:
        "Used for aisle decor or for flower girls to toss. The quantity is good for one flower girl.",
      image: "/flowers/alacarte/rose-petals.jpg",
    },
  ]

  styles() {
    const CREAM = "#EFE7DC"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"
    const WHITE = "#FFFFFF"

    return {
      page: {
        backgroundColor: CREAM,
        minHeight: "100vh",
        overflowX: "hidden",
      },

      heroWrap: {
        position: "relative",
        width: "100%",
        overflow: "hidden",
      },

      heroBg: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center top",
        display: "block",
        zIndex: 0,
      },

      heroOverlay: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.12) 38%, rgba(48,71,66,0.18) 100%)",
      },

      heroContent: {
        position: "relative",
        zIndex: 1,
        paddingTop: 50,
        paddingBottom: 34,
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
      },

      titleArea: {
        position: "relative",
        width: "100%",
        height: "clamp(260px, 46vw, 520px)",
      },

      titleCenter: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      },

      titleStack: {
        display: "grid",
        gap: 14,
        justifyItems: "center",
        padding: "clamp(14px, 3vw, 34px)",
        textAlign: "center",
      },

      heroTitle: {
        fontFamily: "Brasika",
        color: CREAM,
        letterSpacing: "clamp(0.5px, 0.15vw, 0.8px)",
        fontSize: "clamp(36px, 6vw, 78px)",
        lineHeight: 1.02,
        textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
        padding: "0 6px",
        maxWidth: 980,
        textTransform: "lowercase",
        textAlign: "center",
      },

      heroSub: {
        paddingTop: 20,
        fontFamily: "Georgia",
        color: CREAM,
        fontSize: "clamp(15px, 1.6vw, 20px)",
        lineHeight: 1.75,
        maxWidth: 760,
        textShadow: "0 8px 22px rgba(0,0,0,0.45)",
        textAlign: "center",
        margin: "0 auto",
      },

      heroPanelWrap: {
        position: "relative",
        paddingTop: 10,
        maxWidth: 1280,
        margin: "0 auto",
      },

      heroPanel: {
        maxWidth: 1100,
        margin: "0 auto",
      },

      infoBand: {
        borderRadius: 16,
        border: `1px solid rgba(239,231,220,0.78)`,
        background: "rgba(239,231,220,0.94)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
        padding: "14px 16px",
        marginBottom: 18,
        backdropFilter: "blur(8px)",
      },

      infoText: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.7,
      },

      infoLink: {
        color: GREEN,
        textDecoration: "underline",
        fontWeight: 800,
      },

      formCard: {
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        height: "100%",
        border: "1px solid rgba(48,71,66,0.18)",
        background: CREAM,
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
      },

      formCardGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(700px 240px at 0% 0%, rgba(233,118,91,0.08), rgba(255,255,255,0))," +
          "radial-gradient(700px 260px at 100% 0%, rgba(48,71,66,0.06), rgba(255,255,255,0))",
        zIndex: 0,
      },

      formInner: {
        position: "relative",
        zIndex: 1,
        padding: "16px",
      },

      formTitleRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      },

      formTitleLeft: {
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

      formTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(26px, 3vw, 36px)",
        lineHeight: 1.04,
      },

      formSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        opacity: 0.95,
        marginTop: 4,
        lineHeight: 1.7,
      },

      divider: {
        opacity: 0.18,
        marginTop: 12,
        marginBottom: 12,
        borderColor: GREEN,
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

      pillBtnSolid: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "10px 18px",
        border: `1px solid ${GREEN}`,
        color: CREAM,
        background: GREEN,
        boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
      },

      fieldSx: {
        "& .MuiInputLabel-root": {
          color: GREEN,
          fontFamily: "GeorgiaB",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: GREEN,
        },
        "& .MuiOutlinedInput-root": {
          color: GREEN,
          backgroundColor: "rgba(255,255,255,0.55)",
          borderRadius: "14px",
          fontFamily: "GeorgiaB",
          "& fieldset": {
            borderColor: "rgba(48,71,66,0.28)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(48,71,66,0.45)",
          },
          "&.Mui-focused fieldset": {
            borderColor: GREEN,
          },
        },
        "& .MuiInputBase-input": {
          fontFamily: "GeorgiaB",
          color: GREEN,
        },
        "& .MuiFormHelperText-root": {
          color: GREEN,
          opacity: 0.82,
          fontFamily: "GeorgiaB",
          marginLeft: "2px",
        },
        "& .MuiSelect-icon": {
          color: GREEN,
        },
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          filter:
            "brightness(0) saturate(100%) invert(22%) sepia(15%) saturate(826%) hue-rotate(124deg) brightness(92%) contrast(91%)",
          opacity: 0.95,
          cursor: "pointer",
        },
      },

      radioSx: {
        "& .MuiFormLabel-root": {
          color: GREEN,
          fontFamily: "GeorgiaB",
        },
        "& .MuiRadio-root": {
          color: "rgba(48,71,66,0.70)",
        },
        "& .MuiRadio-root.Mui-checked": {
          color: GREEN,
        },
        "& .MuiTypography-root": {
          color: GREEN,
          fontFamily: "GeorgiaB",
        },
      },

      helperText: {
        color: GREEN,
        opacity: 0.82,
        fontFamily: "GeorgiaB",
      },

      sectionWrap: {
        position: "relative",
        background: CREAM,
      },

      accentTL: {
        position: "absolute",
        top: 20,
        left: 0,
        width: "12vw",
        height: "auto",
        transform: "scaleY(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      accentTR: {
        position: "absolute",
        top: 20,
        right: 0,
        width: "12vw",
        height: "auto",
        transform: "scale(-1)",
        opacity: 0.95,
        pointerEvents: "none",
        userSelect: "none",
        maxWidth: 100,
      },

      accentBL: {
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

      accentBR: {
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

      lowerContent: {
        position: "relative",
        zIndex: 1,
        paddingTop: 42,
        paddingBottom: 56,
        paddingLeft: "clamp(20px, 6vw, 90px)",
        paddingRight: "clamp(20px, 6vw, 90px)",
      },

      lowerTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        letterSpacing: 0.6,
        margin: "0 auto 24px auto",
        textAlign: "center",
        textShadow: "0 0 22px rgba(48,71,66,0.12)",
        maxWidth: "60vw",
      },

      lowerBody: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.85,
        margin: "0 auto",
        maxWidth: 950,
        textAlign: "center",
      },

      lowerSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        margin: "24px auto 0 auto",
        lineHeight: 1.6,
        textAlign: "center",
        maxWidth: "60vw",
      },

      errorAlert: {
        borderRadius: 16,
        background: "rgba(233,118,91,0.13)",
        color: GREEN,
        border: `1px solid rgba(233,118,91,0.35)`,
      },

      successAlert: {
        borderRadius: 16,
        background: "rgba(48,71,66,0.10)",
        color: GREEN,
        border: "1px solid rgba(48,71,66,0.22)",
      },

      submitSpinner: {
        color: WHITE,
      },

      aLaCarteWrap: {
        position: "relative",
        background: CREAM,
      },

      aLaCarteInner: {
        position: "relative",
        zIndex: 1,
        paddingTop: 58,
        paddingBottom: 56,
        paddingLeft: "clamp(20px, 6vw, 90px)",
        paddingRight: "clamp(20px, 6vw, 90px)",
        maxWidth: 1380,
        margin: "0 auto",
      },

      sectionHeader: {
        textAlign: "center",
        marginBottom: 24,
      },

      sectionTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(32px, 4.6vw, 54px)",
        lineHeight: 1.02,
        textAlign: "center",
      },

      sectionText: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.8,
        maxWidth: 920,
        margin: "14px auto 0 auto",
        textAlign: "center",
        padding: 40,
      },

      unifiedCard: {
        borderRadius: 24,
        background: "rgba(255,255,255,0.42)",
        border: "1px solid rgba(48,71,66,0.14)",
        boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "relative",
      },

      unifiedGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(700px 280px at 0% 0%, rgba(233,118,91,0.06), rgba(255,255,255,0))," +
          "radial-gradient(700px 320px at 100% 0%, rgba(48,71,66,0.05), rgba(255,255,255,0))",
        zIndex: 0,
      },

      unifiedInner: {
        position: "relative",
        zIndex: 1,
        padding: "clamp(16px, 2vw, 24px)",
      },

      subSection: {
        paddingTop: 6,
        paddingBottom: 8,
      },

      subDivider: {
        opacity: 0.18,
        marginTop: 22,
        marginBottom: 22,
        borderColor: GREEN,
      },

      groupTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(24px, 2.7vw, 34px)",
        marginBottom: 6,
      },

      groupSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.75,
        opacity: 0.96,
        marginBottom: 12,
      },

      itemRowCard: {
        borderRadius: 18,
        background: "rgba(255,255,255,0.74)",
        border: "1px solid rgba(48,71,66,0.12)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        overflow: "hidden",
      },

      itemImageCell: {
        padding: "16px 0 16px 16px",
        display: "flex",
        alignItems: "stretch",
      },

      itemContentCell: {
        paddingRight: 16,
      },

      itemImageButton: {
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 150,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "block",
        borderRadius: 16,
        overflow: "hidden",
      },

      itemImage: {
        width: "100%",
        height: "100%",
        minHeight: 150,
        objectFit: "cover",
        display: "block",
        background: "rgba(48,71,66,0.06)",
      },

      zoomBadge: {
        position: "absolute",
        right: 12,
        bottom: 12,
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: CREAM,
      },

      itemBody: {
        padding: "18px 18px 18px 22px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      },

      itemTitle: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        fontSize: "clamp(18px, 2vw, 22px)",
        lineHeight: 1.3,
        fontWeight: 700,
      },

      itemPrice: {
        fontFamily: "GeorgiaB",
        color: ORANGE,
        fontSize: "16px",
        lineHeight: 1.5,
        marginTop: 2,
        fontWeight: 700,
      },

      itemDesc: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.65,
        opacity: 0.92,
        marginTop: 8,
      },

      qtyRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 12,
        flexWrap: "wrap",
      },

      qtyLabel: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        minWidth: 66,
      },

      itemTotal: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        fontSize: "15px",
        lineHeight: 1.6,
        fontWeight: 700,
      },

      totalsCard: {
        borderRadius: 18,
        background: "rgba(255,255,255,0.76)",
        border: "1px solid rgba(48,71,66,0.12)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        padding: "16px 18px",
      },

      totalsTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(22px, 2.4vw, 30px)",
        marginBottom: 8,
      },

      totalsRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        padding: "8px 0",
        borderBottom: "1px solid rgba(48,71,66,0.10)",
      },

      totalsLabel: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.6,
      },

      totalsValue: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.6,
        fontWeight: 700,
        whiteSpace: "nowrap",
      },

      grandTotalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        paddingTop: 14,
      },

      grandTotalLabel: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(22px, 2.4vw, 30px)",
      },

      grandTotalValue: {
        fontFamily: "GeorgiaB",
        color: ORANGE,
        fontSize: "clamp(20px, 2.4vw, 28px)",
        fontWeight: 700,
      },

      imageModalWrap: {
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background: "rgba(20,27,25,0.82)",
        padding: 16,
        cursor: "pointer",
      },

      imageModalInner: {
        position: "relative",
        maxWidth: "min(1100px, 94vw)",
        maxHeight: "90vh",
        display: "grid",
        placeItems: "center",
      },

      imageModalImg: {
        maxWidth: "100%",
        maxHeight: "90vh",
        objectFit: "contain",
        display: "block",
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
      },

      imageModalClose: {
        position: "absolute",
        top: 10,
        right: 10,
        color: CREAM,
        background: "rgba(48,71,66,0.7)",
        backdropFilter: "blur(6px)",
      },
    }
  }

  setTouched = (key) => {
    this.setState((prev) => ({
      touched: { ...prev.touched, [key]: true },
    }))
  }

  setATouched = (key) => {
    this.setState((prev) => ({
      aTouched: { ...prev.aTouched, [key]: true },
    }))
  }

  openImageModal = (src, alt) => {
    this.setState({
      imageModalOpen: true,
      imageModalSrc: src,
      imageModalAlt: alt,
    })
  }

  closeImageModal = () => {
    this.setState({
      imageModalOpen: false,
      imageModalSrc: "",
      imageModalAlt: "",
    })
  }

  parseQty = (value) => {
    const n = parseInt(value, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  formatMoney = (value) => {
    return `$${Number(value || 0).toFixed(2).replace(/\.00$/, "")}`
  }

  getSelectedBreakdown = () => {
    const allItems = [...this.personalFlowers, ...this.ceremonyReceptionFlowers]

    return allItems
      .map((item) => {
        const quantity = this.parseQty(this.state.aLaCarteQuantities[item.key])
        const total = quantity * item.unitPrice
        return {
          ...item,
          quantity,
          total,
        }
      })
      .filter((item) => item.quantity > 0)
  }

  getGrandTotal = () => {
    return this.getSelectedBreakdown().reduce((sum, item) => sum + item.total, 0)
  }

  validate() {
    const errors = {}
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())

    if (!String(this.state.name || "").trim()) errors.name = "Name is required."
    if (!String(this.state.email || "").trim()) errors.email = "Email is required."
    else if (!isEmail(this.state.email)) errors.email = "Please enter a valid email."
    if (!String(this.state.phone || "").trim()) errors.phone = "Phone is required."
    if (!String(this.state.preferredReach || "").trim()) {
      errors.preferredReach = "Please select a preferred contact method."
    }
    if (!String(this.state.eventType || "").trim()) errors.eventType = "Event type is required."
    if (!String(this.state.eventDate || "").trim()) errors.eventDate = "Event date is required."

    return errors
  }

  validateALaCarte() {
    const errors = {}
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim())
    const hasAnyQty = Object.values(this.state.aLaCarteQuantities || {}).some(
      (v) => this.parseQty(v) > 0
    )

    if (!hasAnyQty) errors.products = "Please select at least one flower item."
    if (!String(this.state.aName || "").trim()) errors.aName = "Name is required."
    if (!String(this.state.aEmail || "").trim()) errors.aEmail = "Email is required."
    else if (!isEmail(this.state.aEmail)) errors.aEmail = "Please enter a valid email."
    if (!String(this.state.aPhone || "").trim()) errors.aPhone = "Phone is required."
    if (!String(this.state.aPreferredReach || "").trim()) {
      errors.aPreferredReach = "Please select a preferred contact method."
    }
    if (!String(this.state.aEventType || "").trim()) errors.aEventType = "Event type is required."
    if (!String(this.state.aEventDate || "").trim()) errors.aEventDate = "Event date is required."

    return errors
  }

  updateQty = (key, value) => {
    if (value === "") {
      this.setState((prev) => ({
        aLaCarteQuantities: {
          ...prev.aLaCarteQuantities,
          [key]: "",
        },
      }))
      return
    }

    const next = Math.max(0, parseInt(value || 0, 10) || 0)

    this.setState((prev) => ({
      aLaCarteQuantities: {
        ...prev.aLaCarteQuantities,
        [key]: String(next),
      },
    }))
  }

  async handleSubmit(e) {
    e.preventDefault()

    this.setState({
      success: false,
      error: "",
      touched: {
        name: true,
        email: true,
        phone: true,
        preferredReach: true,
        eventType: true,
        eventDate: true,
        budget: true,
        details: true,
      },
    })

    const errors = this.validate()
    if (Object.keys(errors).length) {
      this.setState({ error: "Please complete the required fields." })
      return
    }

    try {
      this.setState({ submitting: true, error: "" })

      await addDoc(collection(db, "eventInquiries"), {
        name: String(this.state.name || "").trim(),
        email: String(this.state.email || "").trim(),
        phone: String(this.state.phone || "").trim(),
        preferredReach: this.state.preferredReach,
        eventType: String(this.state.eventType || "").trim(),
        eventDate: this.state.eventDate,
        budget: this.state.budget || "",
        details: String(this.state.details || "").trim(),
        createdAt: serverTimestamp(),
        source: this.props.source || "web",
      })

      this.setState({
        submitting: false,
        success: true,
        error: "",
        name: "",
        email: "",
        phone: "",
        preferredReach: "Email",
        eventType: "",
        eventDate: "",
        budget: "",
        details: "",
        touched: {},
      })
    } catch (err) {
      console.error(err)
      this.setState({
        submitting: false,
        success: false,
        error: "Something went wrong while submitting. Please try again in a moment.",
      })
    }
  }

  async handleALaCarteSubmit(e) {
    e.preventDefault()

    this.setState({
      aSuccess: false,
      aError: "",
      aTouched: {
        products: true,
        aName: true,
        aEmail: true,
        aPhone: true,
        aPreferredReach: true,
        aEventType: true,
        aEventDate: true,
      },
    })

    const errors = this.validateALaCarte()
    if (Object.keys(errors).length) {
      this.setState({ aError: "Please complete the required fields for the A La Carte request." })
      return
    }

    try {
      this.setState({ aSubmitting: true, aError: "" })

      const selectedItems = [...this.personalFlowers, ...this.ceremonyReceptionFlowers]
        .map((item) => {
          const quantity = this.parseQty(this.state.aLaCarteQuantities[item.key])
          return {
            key: item.key,
            title: item.title,
            price: item.price,
            unitPrice: item.unitPrice,
            quantity,
            total: quantity * item.unitPrice,
          }
        })
        .filter((item) => item.quantity > 0)

      await addDoc(collection(db, "aLaCarteInquiries"), {
        name: String(this.state.aName || "").trim(),
        email: String(this.state.aEmail || "").trim(),
        phone: String(this.state.aPhone || "").trim(),
        preferredReach: this.state.aPreferredReach,
        eventType: String(this.state.aEventType || "").trim(),
        eventDate: this.state.aEventDate,
        notes: String(this.state.aNotes || "").trim(),
        items: selectedItems,
        quantities: this.state.aLaCarteQuantities,
        grandTotal: this.getGrandTotal(),
        createdAt: serverTimestamp(),
        source: this.props.source || "web",
      })

      this.setState({
        aSubmitting: false,
        aSuccess: true,
        aError: "",
        aName: "",
        aEmail: "",
        aPhone: "",
        aPreferredReach: "Email",
        aEventType: "",
        aEventDate: "",
        aNotes: "",
        aTouched: {},
        aLaCarteQuantities: {
          lushBridalBouquet: "",
          attendantsBouquet: "",
          singleVarietyBouquet: "",
          boutonniere: "",
          pocketBoutonniere: "",
          corsageWrist: "",
          corsagePinOn: "",
          flowerCrownAdult: "",
          flowerCrownChild: "",
          hairFlowers: "",
          silkRibbonTreatment: "",
          statementPiece: "",
          focalArrangement: "",
          floralChairDecor: "",
          budvase3: "",
          budvase5: "",
          petiteBouquetReception: "",
          lowLushCenterpiece: "",
          cakeFlowers: "",
          rosePetals: "",
        },
      })
    } catch (err) {
      console.error(err)
      this.setState({
        aSubmitting: false,
        aSuccess: false,
        aError: "Something went wrong while submitting your A La Carte request.",
      })
    }
  }

  renderItemRow(item, s, delay = 0) {
    const quantityValue = this.state.aLaCarteQuantities[item.key]
    const quantity = this.parseQty(quantityValue)
    const total = quantity * item.unitPrice

    return (
      <Card style={s.itemRowCard} elevation={0}>
        <Grid container wrap="nowrap" alignItems="stretch">
          <Grid item xs={4} sm={4} md={3}>
            <div style={s.itemImageCell}>
              <button
                type="button"
                style={s.itemImageButton}
                onClick={() => this.openImageModal(item.image, item.title)}
                aria-label={`View larger image for ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={s.itemImage}
                  onError={(e) => {
                    e.currentTarget.src = "/splash.png"
                  }}
                />
                <div style={s.zoomBadge}>
                  <ZoomInIcon fontSize="small" />
                </div>
              </button>
            </div>
          </Grid>

          <Grid item xs={8} sm={8} md={9} style={s.itemContentCell}>
            <div style={s.itemBody}>
              <Typography style={s.itemTitle}>{item.title}</Typography>
              <Typography style={s.itemPrice}>{item.price}</Typography>
              <Typography variant="body2" style={s.itemDesc}>
                {item.description}
              </Typography>

              <div style={s.qtyRow}>
                <Typography style={s.qtyLabel}>Quantity</Typography>

                <TextField
                  type="number"
                  size="small"
                  inputProps={{ min: 0 }}
                  value={quantityValue}
                  placeholder="0"
                  onChange={(e) => this.updateQty(item.key, e.target.value)}
                  sx={{
                    ...s.fieldSx,
                    width: 132,
                    "& .MuiOutlinedInput-root": {
                      color: "#304742",
                      backgroundColor: "rgba(255,255,255,0.82)",
                      borderRadius: "14px",
                      fontFamily: "GeorgiaB",
                      "& fieldset": {
                        borderColor: "rgba(48,71,66,0.28)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(48,71,66,0.45)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#304742",
                      },
                    },
                  }}
                />

                <Typography style={s.itemTotal}>
                  Item Total: {this.formatMoney(total)}
                </Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </Card>
    )
  }

  render() {
    const s = this.styles()
    const errors = this.validate()
    const aErrors = this.validateALaCarte()
    const breakdown = this.getSelectedBreakdown()
    const grandTotal = this.getGrandTotal()

    const showErr = (key) => Boolean(this.state.touched[key] && errors[key])
    const showAErr = (key) => Boolean(this.state.aTouched[key] && aErrors[key])

    const budgets = [
      "Under $1,500",
      "$1,500 - $3,000",
      "$3,000 - $5,000",
      "$5,000 - $7,000",
      "$7,000 - $10,000",
      "Over $10,000",
    ]

    const directEmail = this.props.directEmail || "islandflourish@gmail.com"
    const directSubject = encodeURIComponent("Event Flowers Inquiry")
    const directBody = encodeURIComponent(
      "Hi Island Flourish team,\n\nI'm interested in event florals. Here are a few details:\n- Event Type:\n- Event Date:\n- Venue/Location:\n- Estimated Budget:\n- Notes:\n\nThank you!"
    )
    const mailtoHref = `mailto:${directEmail}?subject=${directSubject}&body=${directBody}`

    return (
      <div style={s.page}>
        <Head>
          <title>Contact | Island Flourish</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Contact Island Flourish about event florals, wedding flowers, and custom floral design."
          />
        </Head>

        <div style={s.heroWrap}>
          <img src="/splash.png" alt="Island Flourish splash" style={s.heroBg} />
          <div style={s.heroOverlay} />

          <div style={s.heroContent}>
            <Grid container style={{ width: "100%" }}>
              <Grid item xs={12}>
                <div style={s.titleArea}>
                  <div style={s.titleCenter}>
                    <div style={s.titleStack}>
                      <Typography component="h1" style={s.heroTitle}>
                        contact
                      </Typography>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>

            <div style={s.heroPanelWrap}>
              <div style={s.heroPanel}>
                <div style={s.infoBand}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="body1" style={s.infoText}>
                      Prefer to email a team member directly? Reach us at{" "}
                      <a href={mailtoHref} style={s.infoLink}>
                        {directEmail}
                      </a>
                      .
                    </Typography>

                    <Button
                      component="a"
                      href={mailtoHref}
                      style={s.pillBtn}
                      disabled={this.state.submitting}
                    >
                      <Typography style={{ fontFamily: "GeorgiaB" }}>
                        Email a team member
                      </Typography>
                    </Button>
                  </div>
                </div>

                <Card style={s.formCard} elevation={0}>
                  <div style={s.formCardGlow} />

                  <div style={s.formInner}>
                    <div style={s.formTitleRow}>
                      <div style={s.formTitleLeft}>
                        <div style={s.floralDot}>
                          <LocalFloristIcon />
                        </div>

                        <div>
                          <Typography variant="h4" style={s.formTitle}>
                            Event Flowers Inquiry
                          </Typography>

                          <Typography variant="body1" style={s.formSub}>
                            Tell us about your event, your preferred contact method, and the kind
                            of floral design you’re envisioning.
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <Divider style={s.divider} />

                    <form onSubmit={(e) => this.handleSubmit(e)}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={this.state.name}
                            onChange={(e) => this.setState({ name: e.target.value })}
                            onBlur={() => this.setTouched("name")}
                            error={showErr("name")}
                            helperText={showErr("name") ? errors.name : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={this.state.email}
                            onChange={(e) => this.setState({ email: e.target.value })}
                            onBlur={() => this.setTouched("email")}
                            error={showErr("email")}
                            helperText={showErr("email") ? errors.email : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={this.state.phone}
                            onChange={(e) => this.setState({ phone: e.target.value })}
                            onBlur={() => this.setTouched("phone")}
                            error={showErr("phone")}
                            helperText={showErr("phone") ? errors.phone : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl component="fieldset" sx={{ width: "100%", ...s.radioSx }}>
                            <FormLabel component="legend">
                              How do you prefer to be reached
                            </FormLabel>
                            <RadioGroup
                              row
                              value={this.state.preferredReach}
                              onChange={(e) => this.setState({ preferredReach: e.target.value })}
                              onBlur={() => this.setTouched("preferredReach")}
                            >
                              <FormControlLabel value="Phone" control={<Radio />} label="Phone" />
                              <FormControlLabel value="Email" control={<Radio />} label="Email" />
                            </RadioGroup>

                            <Typography variant="caption" style={s.helperText}>
                              {showErr("preferredReach") ? errors.preferredReach : " "}
                            </Typography>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Type"
                            placeholder="Wedding, Birthday, Bridal Shower, etc."
                            value={this.state.eventType}
                            onChange={(e) => this.setState({ eventType: e.target.value })}
                            onBlur={() => this.setTouched("eventType")}
                            error={showErr("eventType")}
                            helperText={showErr("eventType") ? errors.eventType : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={this.state.eventDate}
                            onChange={(e) => this.setState({ eventDate: e.target.value })}
                            onBlur={() => this.setTouched("eventDate")}
                            error={showErr("eventDate")}
                            helperText={showErr("eventDate") ? errors.eventDate : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            select
                            label="Estimated Budget for Florals"
                            value={this.state.budget}
                            onChange={(e) => this.setState({ budget: e.target.value })}
                            onBlur={() => this.setTouched("budget")}
                            sx={s.fieldSx}
                          >
                            {budgets.map((b) => (
                              <MenuItem key={b} value={b}>
                                {b}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            label="Describe your event / Details and notes"
                            value={this.state.details}
                            onChange={(e) => this.setState({ details: e.target.value })}
                            onBlur={() => this.setTouched("details")}
                            helperText="Tell us the vibe, colors, venue, guest count, and anything you love."
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <AnimatePresence>
                            {this.state.error ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Alert severity="error" style={s.errorAlert}>
                                  {this.state.error}
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>

                          <AnimatePresence>
                            {this.state.success ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                                style={{ marginTop: 12 }}
                              >
                                <Alert severity="success" style={s.successAlert}>
                                  Submitted successfully. We’ll reach out soon.
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </Grid>

                        <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            type="submit"
                            style={s.pillBtnSolid}
                            disabled={this.state.submitting}
                          >
                            {this.state.submitting ? (
                              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <CircularProgress size={18} style={s.submitSpinner} />
                                <span style={{ fontFamily: "GeorgiaB" }}>Submitting…</span>
                              </span>
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div style={s.aLaCarteWrap}>
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTL} />
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTR} />
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBL} />
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBR} />

          <div style={s.aLaCarteInner}>
            <RevealOnScroll delay={0.02} threshold={0} rootMargin="0px 0px -10% 0px">
              <div style={s.sectionHeader}>
                <Typography variant="h2" style={s.sectionTitle}>
                  A La Carte
                </Typography>

                <Typography variant="body1" style={s.sectionText}>
                  Select individual floral pieces for personal flowers, ceremony flowers, and
                  reception flowers. Choose the quantities you want, then enter your event details
                  below and submit your request.
                </Typography>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.04} threshold={0} rootMargin="0px 0px -6% 0px">
              <Card style={s.unifiedCard} elevation={0}>
                <div style={s.unifiedGlow} />

                <div style={s.unifiedInner}>
                  <form onSubmit={(e) => this.handleALaCarteSubmit(e)}>
                    <div style={s.subSection}>
                      <Typography style={s.groupTitle}>Personal Flowers</Typography>
                      <Typography variant="body1" style={s.groupSub}>
                        Bouquets, boutonnieres, corsages, crowns, and floral finishing details.
                      </Typography>

                      <Grid container spacing={1.5}>
                        {this.personalFlowers.map((item, idx) => (
                          <Grid item xs={12} key={item.key}>
                            {this.renderItemRow(item, s, 0.02 + idx * 0.015)}
                          </Grid>
                        ))}
                      </Grid>
                    </div>

                    <Divider style={s.subDivider} />

                    <div style={s.subSection}>
                      <Typography style={s.groupTitle}>Ceremony & Reception Flowers</Typography>
                      <Typography variant="body1" style={s.groupSub}>
                        Statement arrangements, table flowers, aisle accents, cake flowers, and
                        more.
                      </Typography>

                      <Grid container spacing={1.5}>
                        {this.ceremonyReceptionFlowers.map((item, idx) => (
                          <Grid item xs={12} key={item.key}>
                            {this.renderItemRow(item, s, 0.02 + idx * 0.015)}
                          </Grid>
                        ))}
                      </Grid>
                    </div>

                    <Divider style={s.subDivider} />

                    <div style={s.subSection}>
                      <Typography style={s.groupTitle}>Selected Items Breakdown</Typography>
                      <Typography variant="body1" style={s.groupSub}>
                        Review your selected quantities and estimated totals before submitting.
                      </Typography>

                      <Card style={s.totalsCard} elevation={0}>
                        <Typography style={s.totalsTitle}>Order Summary</Typography>

                        {breakdown.length ? (
                          <>
                            {breakdown.map((item) => (
                              <div key={item.key} style={s.totalsRow}>
                                <Typography style={s.totalsLabel}>
                                  {item.title} × {item.quantity}
                                </Typography>
                                <Typography style={s.totalsValue}>
                                  {this.formatMoney(item.total)}
                                </Typography>
                              </div>
                            ))}

                            <div style={s.grandTotalRow}>
                              <Typography style={s.grandTotalLabel}>Total</Typography>
                              <Typography style={s.grandTotalValue}>
                                {this.formatMoney(grandTotal)}
                              </Typography>
                            </div>
                          </>
                        ) : (
                          <Typography style={s.totalsLabel}>
                            No items selected yet. Add quantities above to see your breakdown.
                          </Typography>
                        )}
                      </Card>
                    </div>

                    <Divider style={s.subDivider} />

                    <div style={s.subSection}>
                      <Typography style={s.groupTitle}>Your Event Information</Typography>
                      <Typography variant="body1" style={s.groupSub}>
                        Tell us who you are and when your event is happening so we can follow up.
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <AnimatePresence>
                            {showAErr("products") ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Alert severity="error" style={s.errorAlert}>
                                  {aErrors.products}
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={this.state.aName}
                            onChange={(e) => this.setState({ aName: e.target.value })}
                            onBlur={() => this.setATouched("aName")}
                            error={showAErr("aName")}
                            helperText={showAErr("aName") ? aErrors.aName : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={this.state.aEmail}
                            onChange={(e) => this.setState({ aEmail: e.target.value })}
                            onBlur={() => this.setATouched("aEmail")}
                            error={showAErr("aEmail")}
                            helperText={showAErr("aEmail") ? aErrors.aEmail : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={this.state.aPhone}
                            onChange={(e) => this.setState({ aPhone: e.target.value })}
                            onBlur={() => this.setATouched("aPhone")}
                            error={showAErr("aPhone")}
                            helperText={showAErr("aPhone") ? aErrors.aPhone : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControl component="fieldset" sx={{ width: "100%", ...s.radioSx }}>
                            <FormLabel component="legend">
                              How do you prefer to be reached
                            </FormLabel>
                            <RadioGroup
                              row
                              value={this.state.aPreferredReach}
                              onChange={(e) => this.setState({ aPreferredReach: e.target.value })}
                              onBlur={() => this.setATouched("aPreferredReach")}
                            >
                              <FormControlLabel value="Phone" control={<Radio />} label="Phone" />
                              <FormControlLabel value="Email" control={<Radio />} label="Email" />
                            </RadioGroup>

                            <Typography variant="caption" style={s.helperText}>
                              {showAErr("aPreferredReach") ? aErrors.aPreferredReach : " "}
                            </Typography>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Type"
                            placeholder="Wedding, Shower, Dinner, Reception, etc."
                            value={this.state.aEventType}
                            onChange={(e) => this.setState({ aEventType: e.target.value })}
                            onBlur={() => this.setATouched("aEventType")}
                            error={showAErr("aEventType")}
                            helperText={showAErr("aEventType") ? aErrors.aEventType : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={this.state.aEventDate}
                            onChange={(e) => this.setState({ aEventDate: e.target.value })}
                            onBlur={() => this.setATouched("aEventDate")}
                            error={showAErr("aEventDate")}
                            helperText={showAErr("aEventDate") ? aErrors.aEventDate : " "}
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Additional Notes"
                            value={this.state.aNotes}
                            onChange={(e) => this.setState({ aNotes: e.target.value })}
                            helperText="Share colors, venue, style notes, or any special requests."
                            sx={s.fieldSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <AnimatePresence>
                            {this.state.aError ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Alert severity="error" style={s.errorAlert}>
                                  {this.state.aError}
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>

                          <AnimatePresence>
                            {this.state.aSuccess ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                                style={{ marginTop: 12 }}
                              >
                                <Alert severity="success" style={s.successAlert}>
                                  Your A La Carte request was submitted successfully.
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </Grid>

                        <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            type="submit"
                            style={s.pillBtnSolid}
                            disabled={this.state.aSubmitting}
                          >
                            {this.state.aSubmitting ? (
                              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <CircularProgress size={18} style={s.submitSpinner} />
                                <span style={{ fontFamily: "GeorgiaB" }}>Submitting…</span>
                              </span>
                            ) : (
                              "Submit A La Carte Request"
                            )}
                          </Button>
                        </Grid>
                      </Grid>
                    </div>
                  </form>
                </div>
              </Card>
            </RevealOnScroll>
          </div>
        </div>

        <RevealOnScroll delay={0.02} threshold={0}>
          <div style={s.sectionWrap}>
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTL} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTR} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBL} />
            <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBR} />

            <div style={s.lowerContent}>
              <Typography variant="h2" style={s.lowerTitle}>
                Let’s Plan Something Beautiful
              </Typography>

              <Typography variant="body1" style={s.lowerBody}>
                Island Flourish creates floral designs with a romantic, garden-inspired feel for
                weddings, celebrations, and meaningful gatherings. Use the form above to share your
                event type, date, floral budget, and the overall look you’re dreaming of, and we’ll
                follow up with next steps.
              </Typography>

              <Typography variant="h6" style={s.lowerSub}>
                Whether you already have a clear vision or just a few ideas, we’d love to hear more
                about your event.
              </Typography>
            </div>
          </div>
        </RevealOnScroll>

        <Modal open={this.state.imageModalOpen} onClose={this.closeImageModal}>
          <div style={s.imageModalWrap} onClick={this.closeImageModal} role="button" tabIndex={0}>
            <div style={s.imageModalInner}>
              <IconButton
                style={s.imageModalClose}
                onClick={this.closeImageModal}
                aria-label="Close image preview"
              >
                <CloseIcon />
              </IconButton>

              <img
                src={this.state.imageModalSrc || "/splash.png"}
                alt={this.state.imageModalAlt || "Flower arrangement preview"}
                style={s.imageModalImg}
                onClick={this.closeImageModal}
                onError={(e) => {
                  e.currentTarget.src = "/splash.png"
                }}
              />
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}