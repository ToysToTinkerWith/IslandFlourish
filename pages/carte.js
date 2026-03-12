// pages/alacarte.js
// Full code change
// - Keeps only top-left and bottom-right accent corners for each section
// - Keeps the shortened intro content in the hero area
// - Keeps the splash background behavior aligned with the other pages
// - Keeps reveal-on-scroll without transform-based movement so sticky behavior is preserved

import React from "react"
import Head from "next/head"
import { motion } from "framer-motion"

import { Grid, Card, Typography, Divider, Button } from "@mui/material"

import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"

function RevealOnScroll({
  children,
  delay = 0,
  threshold = 0.35,
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

export default class ALaCartePage extends React.Component {
  styles() {
    const CREAM = "#EFE7DC"
    const GREEN = "#304742"
    const ORANGE = "#E9765B"

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
        paddingTop: 18,
        maxWidth: 1320,
        margin: "0 auto",
      },

      heroPanel: {
        maxWidth: 1140,
        margin: "0 auto",
      },

      solidBtn: {
        textTransform: "none",
        fontFamily: "GeorgiaB",
        borderRadius: 12,
        padding: "11px 20px",
        border: `1px solid ${GREEN}`,
        color: CREAM,
        background: GREEN,
        boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
      },

      card: {
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        height: "100%",
        border: "1px solid rgba(48,71,66,0.18)",
        background: CREAM,
        boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
      },

      cardGlow: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(700px 240px at 0% 0%, rgba(233,118,91,0.08), rgba(255,255,255,0))," +
          "radial-gradient(700px 260px at 100% 0%, rgba(48,71,66,0.06), rgba(255,255,255,0))",
        zIndex: 0,
      },

      cardInner: {
        position: "relative",
        zIndex: 1,
        padding: "clamp(24px, 3vw, 38px)",
      },

      titleRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 4,
      },

      titleLeft: {
        display: "flex",
        gap: 14,
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

      sectionTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(26px, 3vw, 38px)",
        lineHeight: 1.04,
      },

      sectionSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        opacity: 0.95,
        marginTop: 6,
        lineHeight: 1.85,
        maxWidth: 820,
      },

      divider: {
        opacity: 0.18,
        marginTop: 18,
        marginBottom: 24,
        borderColor: GREEN,
      },

      centeredParagraph: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.95,
        textAlign: "center",
        maxWidth: 980,
        margin: "0 auto",
        paddingLeft: "clamp(8px, 2vw, 24px)",
        paddingRight: "clamp(8px, 2vw, 24px)",
      },

      strongLine: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.9,
        textAlign: "center",
        fontWeight: 700,
        maxWidth: 980,
        margin: "0 auto",
        paddingLeft: "clamp(8px, 2vw, 24px)",
        paddingRight: "clamp(8px, 2vw, 24px)",
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
        paddingTop: 54,
        paddingBottom: 72,
        paddingLeft: "clamp(22px, 6vw, 96px)",
        paddingRight: "clamp(22px, 6vw, 96px)",
      },

      image: {
        width: "100%",
        display: "block",
        borderRadius: 18,
        objectFit: "cover",
        boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
      },

      imageTall: {
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "block",
        borderRadius: 18,
        objectFit: "cover",
        boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
      },

      miniCard: {
        borderRadius: 18,
        background: "rgba(255,255,255,0.44)",
        border: "1px solid rgba(48,71,66,0.14)",
        padding: "20px 20px 18px",
        height: "100%",
        boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
      },

      miniLabel: {
        fontFamily: "Brasika",
        color: GREEN,
        fontSize: "clamp(18px, 2vw, 24px)",
        lineHeight: 1.05,
        marginBottom: 12,
      },

      miniBody: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.85,
      },

      howItem: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 22,
        alignItems: "start",
        padding: "18px 4px",
      },

      howLabel: {
        fontFamily: "Brasika",
        color: GREEN,
        lineHeight: 1.02,
        fontSize: "clamp(24px, 2.6vw, 34px)",
        textAlign: "left",
      },

      howText: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.9,
        paddingRight: "clamp(0px, 1vw, 10px)",
      },

      menuItem: {
        marginBottom: 24,
        paddingLeft: "clamp(2px, 0.6vw, 8px)",
        paddingRight: "clamp(2px, 0.6vw, 8px)",
      },

      menuItemTitle: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        fontWeight: 700,
        lineHeight: 1.65,
        marginBottom: 4,
      },

      menuItemDesc: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        lineHeight: 1.82,
      },

      note: {
        fontStyle: "italic",
        opacity: 0.9,
      },

      softSectionTitle: {
        fontFamily: "Brasika",
        color: GREEN,
        textAlign: "center",
        fontSize: "clamp(32px, 4.8vw, 60px)",
        marginBottom: 12,
        lineHeight: 1,
        paddingLeft: "clamp(8px, 2vw, 18px)",
        paddingRight: "clamp(8px, 2vw, 18px)",
      },

      softSectionSub: {
        fontFamily: "GeorgiaB",
        color: GREEN,
        textAlign: "center",
        maxWidth: 920,
        margin: "0 auto 34px auto",
        lineHeight: 1.9,
        paddingLeft: "44px",
        paddingRight: "44px",
      },

      deliveryHeroImage: {
        width: "100%",
        borderRadius: 24,
        display: "block",
        objectFit: "cover",
        maxHeight: 620,
        boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
      },

      deliveryTitleOverlay: {
        position: "absolute",
        left: "50%",
        bottom: "clamp(18px, 5vw, 48px)",
        transform: "translateX(-50%)",
        color: CREAM,
        fontFamily: "Brasika",
        fontSize: "clamp(36px, 6vw, 82px)",
        textAlign: "center",
        width: "90%",
        lineHeight: 0.95,
        textShadow: "0 12px 30px rgba(0,0,0,0.5)",
      },

      ctaRow: {
        display: "flex",
        justifyContent: "center",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 12,
      },
    }
  }

  renderIntroCard(s) {
    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <LocalFloristIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  A La Carte
                </Typography>
                <Typography variant="body1" style={s.sectionSub}>
                  Simple, beautiful wedding florals with Island Flourish’s romantic,
                  garden-inspired style.
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <div style={{ display: "grid", gap: 24 }}>
            <Typography variant="body1" style={s.centeredParagraph}>
              We know wedding planning can feel overwhelming, which is why we’ve created a
              streamlined, thoughtful approach to florals. Our à la carte collection features
              romantic, garden-style arrangements made with locally grown blooms at their seasonal
              peak. Designed in your chosen color palette with transparent pricing, your florals
              will feel personal, effortless, and beautifully aligned with your vision.
            </Typography>

            <Typography variant="body1" style={s.centeredParagraph}>
              On the following sections, you’ll find everything you need to get started.
            </Typography>

            <Typography variant="h6" style={s.strongLine}>
              We look forward to working with you!
            </Typography>
          </div>
        </div>
      </Card>
    )
  }

  renderHowItWorks(s) {
    const steps = [
      {
        label: "Review the Packet",
        text:
          "Choosing your wedding flowers should be fun. We’ve created this packet to make the process as straightforward as possible.",
        icon: <CheckCircleOutlineIcon />,
      },
      {
        label: "Submit the Order Form",
        text:
          "Complete the attached à la carte order form and send it to islandflourish@gmail.com, with your name and wedding date in the subject line.",
        icon: <EmailOutlinedIcon />,
      },
      {
        label: "Review Estimate",
        text:
          "Within a week of receiving your order form, Island Flourish will email you an estimate for your wedding flowers based on the details you provided.",
        icon: <EmailOutlinedIcon />,
      },
      {
        label: "Send Contract and Deposit",
        text:
          "Once your order is approved, a nonrefundable $250 deposit, along with a signed contract, is required to secure your wedding date on our calendar. The deposit will be applied toward your final balance. We gladly accept checks (payable to Island Flourish) and cash as preferred forms of payment. Payments made via PayPal or Venmo are welcome and will include a 5% processing fee.",
        icon: <PaymentsOutlinedIcon />,
      },
      {
        label: "Make Final Changes",
        text:
          "Five weeks before your event, we’ll be in touch to finalize the details of your order. During this time, you’re welcome to make additions, substitutions, or small adjustments as needed. Please note that while we’re happy to accommodate updates, we’re unable to reduce the size of your order within 30 days of your event.",
        icon: <EventAvailableOutlinedIcon />,
      },
      {
        label: "Submit Payment",
        text: "Final payment is due 30 days prior to your event.",
        icon: <PaymentsOutlinedIcon />,
      },
      {
        label: "Enjoy Your Flowers!",
        text:
          "Your floral arrangements will be carefully prepared and available for pickup at our Clinton, WA studio. For your convenience, delivery is available the day before your wedding to locations on Whidbey Island or to the Mukilteo Ferry Terminal for a small additional fee.",
        icon: <LocalShippingOutlinedIcon />,
      },
    ]

    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <CheckCircleOutlineIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  How It Works
                </Typography>
                <Typography variant="body1" style={s.sectionSub}>
                  A simple step-by-step process designed to make choosing your wedding flowers feel
                  easy and enjoyable.
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <div style={{ display: "grid", gap: 4 }}>
            {steps.map((step, idx) => (
              <React.Fragment key={step.label}>
                <div style={s.howItem}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div
                      style={{
                        ...s.floralDot,
                        width: 38,
                        height: 38,
                        minWidth: 38,
                      }}
                    >
                      {step.icon}
                    </div>
                    <Typography variant="h6" style={s.howLabel}>
                      {step.label}
                    </Typography>
                  </div>

                  <Typography variant="body1" style={s.howText}>
                    {step.text}
                  </Typography>
                </div>

                {idx < steps.length - 1 ? <Divider style={s.divider} /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  renderPersonalFlowers(s) {
    const items = [
      {
        title: "1. Lush Bridal Bouquet $250",
        desc: "Deluxe garden-inspired bouquet.",
      },
      {
        title: "2. Attendant’s Bouquet $125",
        desc: "Smaller version of the bridal bouquet.",
      },
      {
        title: "3. Single Variety Bouquet $65",
        desc: "Perfect for a toss bouquet or young attendant.",
      },
      {
        title: "4. Boutonniere $25",
        desc: "Petite floral accents suitable for a coat lapel or shirt pocket.",
      },
      {
        title: "5. Pocket Boutonniere $45",
        desc: "Similar to a boutonniere, but easier. No pins, just place it in the suit pocket.",
      },
      {
        title: "6. Corsage: Wrist $45, Pin-on $35",
        desc: "Floral accents are designed to be worn on the wrist or pinned to a dress.",
        note: "(not pictured)",
      },
      {
        title: "7. Flower Crown $135 / $95",
        desc: "Romantic floral halo and floral halo for a child.",
        note: "(not pictured)",
      },
      {
        title: "8. Hair Flowers $30",
        desc: "Individually wired flowers for pinning in hair.",
        note: "(not pictured)",
      },
      {
        title: "9. Silk Ribbon Treatment $20 per bouquet",
        desc: "Flowing silk ribbon streamers for personal bouquets—our favorite!",
      },
    ]

    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <LocalFloristIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  Personal Flowers
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <div style={{ display: "grid", gap: 18 }}>
                <img
                  src="/alacarte/personal-1.jpg"
                  alt="Lush bridal bouquet"
                  style={{ ...s.image, minHeight: 320 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={7}>
                    <img
                      src="/alacarte/personal-2.jpg"
                      alt="Attendant bouquets"
                      style={{ ...s.image, minHeight: 220 }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <div style={{ display: "grid", gap: 16, height: "100%" }}>
                      <img
                        src="/alacarte/personal-3.jpg"
                        alt="Single variety bouquet"
                        style={{ ...s.imageTall, minHeight: 102 }}
                      />
                      <img
                        src="/alacarte/personal-4.jpg"
                        alt="Boutonnieres"
                        style={{ ...s.imageTall, minHeight: 102 }}
                      />
                    </div>
                  </Grid>
                </Grid>

                <img
                  src="/alacarte/personal-5.jpg"
                  alt="Pocket boutonniere on suit"
                  style={{ ...s.image, minHeight: 240 }}
                />
              </div>
            </Grid>

            <Grid item xs={12} md={6}>
              <div style={{ height: "100%", paddingTop: 4 }}>
                {items.map((item) => (
                  <div key={item.title} style={s.menuItem}>
                    <Typography variant="body1" style={s.menuItemTitle}>
                      {item.title}{" "}
                      {item.note ? <span style={s.note}>{item.note}</span> : null}
                    </Typography>
                    <Typography variant="body1" style={s.menuItemDesc}>
                      {item.desc}
                    </Typography>
                  </div>
                ))}
              </div>
            </Grid>
          </Grid>
        </div>
      </Card>
    )
  }

  renderCeremonyReception(s) {
    const items = [
      {
        title: "1. Statement Piece $350",
        desc:
          "A single large, dramatic arrangement, perfect for two arrangements used as a pair to frame the front of the ceremony space.",
      },
      {
        title: "2. Focal Arrangement $225",
        desc:
          "Lush, medium-size arrangement great for a guest book table, welcome sign, or bar.",
      },
      {
        title: "3. Floral Chair Decor $45",
        desc: "Petite bundles of flowers that can be attached to chairs to decorate the aisle.",
        note: "(not pictured)",
      },
      {
        title: "4. Budvase Collection with Flowers",
        desc:
          "3 bottles $40 – 5 bottles $60. A sprinkling of bottles is perfect for tables or to decorate the bar.",
      },
      {
        title: "5. Petite Bouquet $85",
        desc: "A sweet little arrangement perfect for cocktail tables or the lounge.",
      },
      {
        title: "6. Low and Lush Garden Centerpiece $175",
        desc:
          "Beautiful garden-style centerpiece perfect for tables or interspersed with bud vases. It can be used as an aisle marker at the ceremony, then repurposed at the reception. Round or rectangular options are available.",
      },
      {
        title: "7. Cake Flowers $55",
        desc: "Small bucket of loose flowers to decorate your cake.",
        note: "(not pictured)",
      },
      {
        title: "8. Rose Petals $20",
        desc:
          "Used for aisle decor or for flower girls to toss. The quantity is good for one flower girl.",
        note: "(not pictured)",
      },
    ]

    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={s.titleRow}>
            <div style={s.titleLeft}>
              <div style={s.floralDot}>
                <LocalFloristIcon />
              </div>

              <div>
                <Typography variant="h4" style={s.sectionTitle}>
                  Ceremony & Reception Flowers
                </Typography>
              </div>
            </div>
          </div>

          <Divider style={s.divider} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <img
                    src="/alacarte/ceremony-1.jpg"
                    alt="Statement arrangement"
                    style={{ ...s.image, minHeight: 300 }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <div style={{ display: "grid", gap: 16 }}>
                    <img
                      src="/alacarte/ceremony-2.jpg"
                      alt="Budvase collection"
                      style={{ ...s.image, minHeight: 138 }}
                    />
                    <img
                      src="/alacarte/ceremony-3.jpg"
                      alt="Petite bouquet"
                      style={{ ...s.image, minHeight: 138 }}
                    />
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <img
                    src="/alacarte/ceremony-4.jpg"
                    alt="Focal arrangement by sign"
                    style={{ ...s.image, minHeight: 240 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <img
                    src="/alacarte/ceremony-5.jpg"
                    alt="Low and lush centerpiece"
                    style={{ ...s.image, minHeight: 240 }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <div style={{ paddingTop: 4 }}>
                {items.map((item) => (
                  <div key={item.title} style={s.menuItem}>
                    <Typography variant="body1" style={s.menuItemTitle}>
                      {item.title} {item.note ? <span style={s.note}>{item.note}</span> : null}
                    </Typography>
                    <Typography variant="body1" style={s.menuItemDesc}>
                      {item.desc}
                    </Typography>
                  </div>
                ))}
              </div>
            </Grid>
          </Grid>
        </div>
      </Card>
    )
  }

  renderPickupDelivery(s) {
    return (
      <Card style={s.card} elevation={0}>
        <div style={s.cardGlow} />
        <div style={s.cardInner}>
          <div style={{ position: "relative" }}>
            <img
              src="/carte.png"
              alt="Pick-up and delivery floral display"
              style={s.deliveryHeroImage}
            />
            <Typography variant="h2" style={s.deliveryTitleOverlay}>
              Pick-Up & Delivery
            </Typography>
          </div>

          <Divider style={s.divider} />

          <div style={{ display: "grid", gap: 22, paddingTop: 4 }}>
            <Typography variant="body1" style={s.centeredParagraph}>
              Your order will be packaged with care instructions and labeled for pickup at our
              studio in Clinton, WA. Please arrange to pick up your order within the following time
              frames:
            </Typography>

            <Typography variant="h6" style={s.strongLine}>
              Studio: Friday 8 am - 4 pm
              <br />
              Saturday 8 am - 10 am
            </Typography>

            <Typography variant="body1" style={s.centeredParagraph}>
              If your wedding venue is on Whidbey Island and south of Oak Harbor or you wish to
              pick up at the Mukilteo Ferry Terminal, delivery is $95.
            </Typography>

            <Typography variant="body1" style={s.strongLine}>
              On island deliveries are made Saturday mornings at 10 am.
              <br />
              Mukilteo Ferry Terminal pick-ups are on Fridays at 4:30 pm.
            </Typography>

            <Typography variant="h6" style={s.strongLine}>
              If your order is $2,500+, your delivery fee will be waived.
            </Typography>
          </div>
        </div>
      </Card>
    )
  }

  renderBottomNotes(s) {
    return (
      <Grid container spacing={3} sx={{ padding: 3, paddingBottom: 0 }}>
        <Grid item xs={12} md={4}>
          <div style={s.miniCard}>
            <Typography variant="h6" style={s.miniLabel}>
              Seasonal Minimums
            </Typography>
            <Typography variant="body1" style={s.miniBody}>
              Weddings held May through September have a $250 minimum. Weddings held October
              through April have a $750 minimum.
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <div style={s.miniCard}>
            <Typography variant="h6" style={s.miniLabel}>
              Best Fit
            </Typography>
            <Typography variant="body1" style={s.miniBody}>
              A La Carte is best for couples who want beautiful florals without large installations
              or full on-site setup.
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12} md={4}>
          <div style={s.miniCard}>
            <Typography variant="h6" style={s.miniLabel}>
              Ordering
            </Typography>
            <Typography variant="body1" style={s.miniBody}>
              Complete the order form, send it by email, review your estimate, then confirm with a
              signed contract and deposit.
            </Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  renderSectionShell(content, corners = "all") {
    const s = this.styles()

    return (
      <div style={s.sectionWrap}>
        {(corners === "all" || corners.includes("tl")) && (
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTL} />
        )}
        {(corners === "all" || corners.includes("tr")) && (
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentTR} />
        )}
        {(corners === "all" || corners.includes("bl")) && (
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBL} />
        )}
        {(corners === "all" || corners.includes("br")) && (
          <img src="/accent.svg" alt="" aria-hidden="true" style={s.accentBR} />
        )}

        <div style={s.lowerContent}>{content}</div>
      </div>
    )
  }

  render() {
    const s = this.styles()
    const mailtoHref = "/contact"

    return (
      <div style={s.page}>
        <Head>
          <title>A La Carte | Island Flourish</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Explore Island Flourish A La Carte wedding flowers, including personal flowers, ceremony florals, reception pieces, pickup, and delivery details."
          />
        </Head>

        <div style={s.heroWrap}>
          <img
            src="/splash.png"
            alt="Island Flourish wedding flowers"
            style={s.heroBg}
          />
          <div style={s.heroOverlay} />

          <div style={s.heroContent}>
            <Grid container style={{ width: "100%" }}>
              <Grid item xs={12}>
                <div style={s.titleArea}>
                  <div style={s.titleCenter}>
                    <RevealOnScroll>
                      <div style={s.titleStack}>
                        <Typography component="h1" style={s.heroTitle}>
                          a la carte
                        </Typography>

       
                      </div>
                    </RevealOnScroll>
                  </div>
                </div>
              </Grid>
            </Grid>

            <RevealOnScroll delay={0.06} threshold={0} rootMargin="0px 0px -10% 0px">
              <div style={s.heroPanelWrap}>
                <div style={s.heroPanel}>{this.renderIntroCard(s)}</div>
              </div>
            </RevealOnScroll>
          </div>
        </div>

        <RevealOnScroll delay={0.02} threshold={0}>
          {this.renderSectionShell(this.renderBottomNotes(s), "tlbr")}
        </RevealOnScroll>

        <RevealOnScroll delay={0.03} threshold={0}>
          {this.renderSectionShell(this.renderHowItWorks(s), "tlbr")}
        </RevealOnScroll>

        <RevealOnScroll delay={0.04} threshold={0}>
          {this.renderSectionShell(
            <div id="menu">
              <Typography variant="h2" style={s.softSectionTitle}>
                The Menu
              </Typography>

              <Typography variant="body1" style={s.softSectionSub}>
                Browse personal flowers, ceremony pieces, and reception florals to build the mix
                that fits your day.
              </Typography>

              {this.renderPersonalFlowers(s)}
            </div>,
            "tlbr"
          )}
        </RevealOnScroll>

        <RevealOnScroll delay={0.05} threshold={0}>
          {this.renderSectionShell(this.renderCeremonyReception(s), "tlbr")}
        </RevealOnScroll>

        <RevealOnScroll delay={0.06} threshold={0}>
          {this.renderSectionShell(this.renderPickupDelivery(s), "tlbr")}
        </RevealOnScroll>

        <RevealOnScroll delay={0.07} threshold={0}>
          {this.renderSectionShell(
            <div>
              <Typography variant="h2" style={s.softSectionTitle}>
                Let’s Get Started
              </Typography>

              <Typography variant="body1" style={s.softSectionSub}>
                Choose your sizes and quantities, share your color palette, and Island Flourish
                will take care of the rest with a thoughtful, streamlined floral experience.
              </Typography>

              <div style={s.ctaRow}>
                <Button component="a" href={mailtoHref} style={s.solidBtn}>
                  Start Your Order
                </Button>
              </div>
            </div>,
            "tlbr"
          )}
        </RevealOnScroll>
      </div>
    )
  }
}