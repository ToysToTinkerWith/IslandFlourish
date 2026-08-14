import React from "react"
import Head from "next/head"
import { motion } from "framer-motion"
import { Box, Button, Card, Divider, Grid, Typography } from "@mui/material"
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"

const CREAM = "#EFE7DC"
const GREEN = "#304742"
const ORANGE = "#E9765B"
const BG = "#F2EADF"
const SOFT = "#F7F1E8"
const BORDER = "rgba(48,71,66,0.18)"

function RevealOnScroll({ children, delay = 0 }) {
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
      { threshold: 0, root: null, rootMargin: "0px" }
    )

    obs.observe(el)

    return () => {
      try {
        obs.disconnect()
      } catch {}
    }
  }, [shown])

  return (
    <Box ref={ref} style={{ minHeight: 1 }}>
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
    </Box>
  )
}

function SectionHeading({ title, children }) {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "center", mb: 3 }}>
      <Typography
        component="h2"
        sx={{
          color: GREEN,
          fontFamily: "Brasika",
          fontSize: "clamp(32px, 4vw, 54px)",
          lineHeight: 1.04,
        }}
      >
        {title}
      </Typography>
      {children ? (
        <Typography
          sx={{
            mt: 1.5,
            color: GREEN,
            fontFamily: "Georgia",
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          {children}
        </Typography>
      ) : null}
    </Box>
  )
}

function InfoCard({ icon, title, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.86)",
        p: 2.4,
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            minWidth: 42,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: CREAM,
            background: ORANGE,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ color: GREEN, fontFamily: "Brasika", lineHeight: 1.08 }}
          >
            {title}
          </Typography>
          <Typography sx={{ mt: 1, color: GREEN, fontFamily: "Georgia", lineHeight: 1.78 }}>
            {children}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

const fullServiceItems = [
  {
    title: "A design process that starts with you",
    body:
      "Before I ever think about flowers, I want to know how you want your wedding to feel. The light, the mood, the details you keep coming back to on your inspiration board - and the ones that do not quite fit but you cannot explain why. That conversation is where the design begins.",
  },
  {
    title: "Every piece, considered",
    body:
      "From your ceremony arch to the bud vase at the end of the buffet table, each element is designed as part of a whole. I think about how things move together through the day: what your guests see when they arrive, what appears at the altar, and what surrounds them at dinner. Nothing is incidental.",
  },
  {
    title: "Day-of execution, handled",
    body:
      "Delivery, installation, and styling are all part of the package. You will not be sending panicked texts about where the centerpieces are. I will be there, making sure everything looks the way we planned and quietly problem-solving anything that does not.",
  },
]

const fitItems = [
  "Are looking for a true full service experience - from the first consultation through installation, takedown, and strike, every detail is handled for you.",
  "Want florals that feel cohesive and deeply considered.",
  "Value sustainability and locally grown, seasonal ingredients.",
  "Are drawn to organic, textural design - think foliage, movement, and layers.",
  "Want a florist who is a true creative partner, not just a vendor.",
]

const investmentItems = [
  {
    title: "Minimum Investment",
    body:
      "Full service weddings with Island Flourish begin at a $4,000 product minimum for 2027 bookings. This includes all rentals - vases, vessels, arches, pillars, and luxury statement pieces - so what you see in your proposal is a true reflection of your day, with nothing hidden. Delivery and labor are quoted separately as part of your comprehensive proposal.",
  },
  {
    title: "Securing Your Date",
    body:
      "Dates are offered on a first come, first served basis. Your date is not held until a signed contract and retainer of $1,250 are received.",
  },
]

const processItems = [
  {
    title: "Consultations",
    body:
      "From our first conversation to the final details, I am with you every step of the way. There is no limit on consultations - we will meet as many times as needed to make sure your vision is clear and your flowers feel exactly right.",
  },
  {
    title: "Finalizing Your Scope",
    body:
      "Your final scope of work is due 60 days before your wedding date. This is when we confirm all pieces, quantities, and installations so that sourcing and planning can be finalized.",
  },
  {
    title: "A Note on Flower Varieties",
    body:
      "I promise you an aesthetic, not a specific stem. Flowers are living things, shaped by the season, the weather, and the unpredictability of growing and sourcing. If a specific variety is not available or is not at its best, I will always find something that honors the look, feel, and spirit of your design. You will never notice what is not there, only how beautiful it all is. That said, if there is a flower or element that is truly meaningful to you, tell me. I will do everything I can to make it happen.",
  },
]

const practicalItems = [
  {
    title: "Service Area",
    body:
      "Island Flourish serves all of Washington state, and I am happy to travel beyond state lines for the right wedding - just ask. Travel fees are factored into your comprehensive quote so there are no surprises.",
  },
  {
    title: "My Role on Your Wedding Day",
    body:
      "I work exclusively as your florist, and I think that is the way it should be. Flowers are my whole focus, from the first installation to the last arrangement placed. I love collaborating with planners and coordinators, and if you do not yet have one and are thinking about it, I am happy to point you toward some wonderful people I trust and admire. Full vendor list coming soon.",
  },
]

const journeyGroups = [
  {
    label: "The Dream",
    steps: [
      {
        number: "1",
        title: "You dream it",
        body:
          "It starts with a feeling - a mood board, a saved post, a photo tucked away for years. You start collecting the looks that feel like your love story.",
      },
      {
        number: "2",
        title: "You find your people",
        body:
          "You start searching for your vendor team - a planner or coordinator, a venue, and of course, a florist. And then you find Island Flourish.",
      },
    ],
  },
  {
    label: "The Connection",
    steps: [
      {
        number: "3",
        title: "Fill out an inquiry form",
        body:
          "Share your name, contact info, wedding date, and venue if you have one. That is all we need to get started.",
      },
      {
        number: "4",
        title: "I will reach out within a week",
        body:
          "Within a week, I will be in touch to schedule a phone call so we can make sure we are the right fit for each other. Come to the call with your aesthetic, color palette, event scope, and a rough investment range - it makes the conversation so much smoother.",
      },
      {
        number: "5",
        title: "We make it official",
        body:
          "If everything feels aligned, I will send over a contract and we will get a retainer squared away. Both secure Island Flourish for your wedding date. Your date is yours.",
      },
    ],
  },
  {
    label: "The Fun Part",
    steps: [
      {
        number: "6",
        title: "Your lookbook comes to life",
        body:
          "I begin building your custom proposal and lookbook - full of details, seasonal flower varieties, and choices made specifically for your aesthetic and love story. No two lookbooks are ever the same.",
      },
      {
        number: "7",
        title: "We collaborate",
        body:
          "As many check-ins as you want, or a fully hands-off approach where I work directly with your planner. We can adjust your order any time up until 60 days before your wedding. That is also when the remainder of your balance is due. We are all here to make the lead-up as stress-free as possible.",
      },
    ],
  },
  {
    label: "The Final Stretch",
    steps: [
      {
        number: "8",
        title: "One last check-in before the big day",
        body:
          "In the two weeks before your wedding, I will connect with you, your coordinator, or your planner to go over every last detail and make sure everything is perfectly in place. No surprises - just confidence.",
      },
    ],
  },
  {
    label: "The Day",
    steps: [
      {
        number: "9",
        title: "Now just enjoy your wedding",
        body:
          "The flowers are handled. The details are set. All you have to do is be present and soak in every beautiful moment.",
      },
    ],
  },
]

export default function FullServiceWeddingsPage() {
  return (
    <Box sx={{ background: BG, color: GREEN, minHeight: "100vh", overflowX: "hidden" }}>
      <Head>
        <title>Full Service Weddings | Island Flourish</title>
        <meta
          name="description"
          content="Bespoke full service wedding florals by Island Flourish, including design, planning, installation, logistics, and floral journey guidance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <Box
          component="img"
          src="/splash.png"
          alt="Island Flourish wedding florals"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 52%, rgba(48,71,66,0.24) 100%)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "clamp(430px, 54vw, 680px)",
            display: "grid",
            placeItems: "center",
            px: { xs: 2, md: 4 },
            pt: 8,
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: "Brasika",
                color: CREAM,
                fontSize: "clamp(38px, 6vw, 82px)",
                lineHeight: 1.02,
                textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
              }}
            >
              full service weddings
            </Typography>
          </motion.div>
        </Box>
      </Box>

      <Box sx={{ position: "relative", px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box
          component="img"
          src="/accent.svg"
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "12vw",
            maxWidth: 100,
            transform: "scaleY(-1)",
            opacity: 0.85,
            pointerEvents: "none",
          }}
        />
        <Box
          component="img"
          src="/accent.svg"
          alt=""
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "12vw",
            maxWidth: 100,
            transform: "scaleX(-1)",
            opacity: 0.85,
            pointerEvents: "none",
          }}
        />

        <Box sx={{ maxWidth: 1180, mx: "auto", position: "relative", zIndex: 1 }}>
          <RevealOnScroll>
            <SectionHeading title={'What "Full Service" Actually Means'}>
              Full service means I am with you from the first conversation to the last
              bloom placed on the morning of your wedding. It means your florals are not
              an afterthought or a line item - they are woven into the whole design story
              of your day.
            </SectionHeading>
          </RevealOnScroll>

          <Grid container spacing={2.4}>
            {fullServiceItems.map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <RevealOnScroll delay={index * 0.05}>
                  <InfoCard icon={<LocalFloristIcon />} title={item.title}>
                    {item.body}
                  </InfoCard>
                </RevealOnScroll>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box sx={{ background: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1080, mx: "auto" }}>
          <RevealOnScroll>
            <SectionHeading title="Why Bespoke Matters">
              Every love story is different, and your flowers should be too.
            </SectionHeading>
          </RevealOnScroll>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: `1px solid ${BORDER}`,
                  background: GREEN,
                  color: CREAM,
                  p: { xs: 2.4, md: 3 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Georgia",
                    fontSize: "clamp(20px, 2.5vw, 30px)",
                    lineHeight: 1.45,
                  }}
                >
                  "Bespoke - made to order, custom-crafted to the exact specifications
                  and desires of the individual. Nothing pre-made, nothing off the shelf.
                  Created entirely and intentionally for one person, one moment, one
                  occasion."
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography sx={{ color: GREEN, fontFamily: "Georgia", lineHeight: 1.9 }}>
                When you choose full service, you are getting a design built specifically
                for your venue, your colors, your people, and your day. I want the
                flowers to feel like you. Are you and your partner playful and a little
                wild, deeply romantic, classically elegant, or chaotic and full of
                laughter? Whatever the answer, that is where the design starts.
              </Typography>
              <Typography sx={{ mt: 2, color: GREEN, fontFamily: "Georgia", lineHeight: 1.9 }}>
                Your florals should tell your story - not someone else's version of what
                a wedding is supposed to look like. This is the work I love most: the
                long planning conversations, the sketch that finally clicks, and the
                moment on your wedding morning when everything comes together in a way
                that feels both completely surprising and entirely inevitable.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1120, mx: "auto" }}>
          <RevealOnScroll>
            <SectionHeading title="Is This the Right Fit?">
              Full service weddings are ideal for couples who:
            </SectionHeading>
          </RevealOnScroll>

          <Grid container spacing={1.6}>
            {fitItems.map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    borderRadius: 2,
                    border: `1px solid ${BORDER}`,
                    background: "rgba(239,231,220,0.72)",
                    p: 1.6,
                    height: "100%",
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ color: ORANGE, mt: 0.2 }} />
                  <Typography sx={{ color: GREEN, fontFamily: "Georgia", lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box sx={{ background: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <RevealOnScroll>
            <SectionHeading title="Investment & Logistics" />
          </RevealOnScroll>

          <Grid container spacing={2.4}>
            {investmentItems.map((item) => (
              <Grid item xs={12} md={6} key={item.title}>
                <InfoCard icon={<EventAvailableOutlinedIcon />} title={item.title}>
                  {item.body}
                </InfoCard>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5, borderColor: GREEN, opacity: 0.18 }} />

          <RevealOnScroll>
            <SectionHeading title="The Design Process" />
          </RevealOnScroll>

          <Grid container spacing={2.4}>
            {processItems.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <InfoCard icon={<AutoStoriesOutlinedIcon />} title={item.title}>
                  {item.body}
                </InfoCard>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5, borderColor: GREEN, opacity: 0.18 }} />

          <RevealOnScroll>
            <SectionHeading title="Practical Details" />
          </RevealOnScroll>

          <Grid container spacing={2.4}>
            {practicalItems.map((item) => (
              <Grid item xs={12} md={6} key={item.title}>
                <InfoCard icon={<HandshakeOutlinedIcon />} title={item.title}>
                  {item.body}
                </InfoCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <RevealOnScroll>
            <SectionHeading title="Step by Step">
              A guide to your bespoke wedding florals with Island Flourish.
            </SectionHeading>
          </RevealOnScroll>

          <Box sx={{ display: "grid", gap: 2.4 }}>
            {journeyGroups.map((group) => (
              <Card
                key={group.label}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${BORDER}`,
                  background: "rgba(239,231,220,0.82)",
                  p: { xs: 2, md: 2.6 },
                  boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Typography
                  sx={{
                    color: ORANGE,
                    fontFamily: "GeorgiaB",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    mb: 1.6,
                  }}
                >
                  {group.label}
                </Typography>

                <Grid container spacing={1.6}>
                  {group.steps.map((step) => (
                    <Grid item xs={12} md={group.steps.length === 1 ? 12 : 6} key={step.number}>
                      <Box sx={{ display: "flex", gap: 1.4, height: "100%" }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            color: CREAM,
                            background: GREEN,
                            fontFamily: "GeorgiaB",
                            fontWeight: 800,
                          }}
                        >
                          {step.number}
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ color: GREEN, fontFamily: "Brasika", lineHeight: 1.1 }}
                          >
                            {step.title}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.8,
                              color: GREEN,
                              fontFamily: "Georgia",
                              lineHeight: 1.72,
                            }}
                          >
                            {step.body}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ background: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1040, mx: "auto" }}>
          <RevealOnScroll>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${BORDER}`,
                background: SOFT,
                p: { xs: 2.4, md: 3.4 },
                boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                <FavoriteBorderOutlinedIcon sx={{ color: ORANGE }} />
                <Typography
                  variant="h3"
                  sx={{ color: GREEN, fontFamily: "Brasika", lineHeight: 1.05 }}
                >
                  A Note to Planners
                </Typography>
              </Box>

              <Typography sx={{ color: GREEN, fontFamily: "Georgia", lineHeight: 1.88 }}>
                Hello -
              </Typography>
              <Typography sx={{ mt: 1.4, color: GREEN, fontFamily: "Georgia", lineHeight: 1.88 }}>
                I am Alexandra, and I am so excited to work alongside you. Being part of
                a talented planning team is something I truly cherish, and I am fully
                committed to showing up for you and your couples with intention and care,
                every single time.
              </Typography>
              <Typography sx={{ mt: 1.4, color: GREEN, fontFamily: "Georgia", lineHeight: 1.88 }}>
                I cannot wait to hear your couple's story. The way they love each other,
                the details they have been dreaming about, the feeling they want to carry
                through their day - that is where the magic lives for me. No two love
                stories are the same, and I believe the flowers should reflect that
                beautifully.
              </Typography>
              <Typography sx={{ mt: 1.4, color: GREEN, fontFamily: "Georgia", lineHeight: 1.88 }}>
                I am always excited for a new adventure. New venues, unexpected color
                palettes, outside-of-the-box installations - I welcome all of it with
                open arms. The most meaningful work often begins where the familiar ends.
              </Typography>
              <Typography sx={{ mt: 1.4, color: GREEN, fontFamily: "Georgia", lineHeight: 1.88 }}>
                More than anything, I want to know how I can best serve your couple's
                vision. Please do not hesitate to reach out - I would love nothing more
                than to create something truly unforgettable together.
              </Typography>
              <Typography
                sx={{ mt: 1.6, color: GREEN, fontFamily: "GeorgiaB", fontWeight: 800 }}
              >
                With warmth and excitement,
                <br />
                Alexandra
              </Typography>
            </Card>
          </RevealOnScroll>
        </Box>
      </Box>

      <Box sx={{ background: GREEN, color: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            maxWidth: 1000,
            mx: "auto",
            display: "grid",
            justifyItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontFamily: "Brasika", color: CREAM, lineHeight: 1.05 }}
          >
            Ready to Begin?
          </Typography>
          <Typography
            sx={{
              maxWidth: 760,
              color: CREAM,
              fontFamily: "Georgia",
              fontSize: 18,
              lineHeight: 1.8,
            }}
          >
            When you are ready to take the first step, I have put together a guide
            that walks you through everything - from how to inquire to what to expect
            along the way. No rushing, no pressure, just a clear and gentle path forward.
          </Typography>
          <Button
            href="/contact"
            sx={{
              mt: 1,
              color: GREEN,
              background: CREAM,
              border: `1px solid ${CREAM}`,
              borderRadius: 2,
              px: 2.4,
              py: 1.2,
              textTransform: "none",
              fontFamily: "GeorgiaB",
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              "&:hover": {
                background: CREAM,
              },
            }}
          >
            Begin Your Floral Journey
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
