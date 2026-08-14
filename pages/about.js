import React from "react"
import Head from "next/head"
import { motion } from "framer-motion"
import { Box, Button, Card, Divider, Grid, Typography } from "@mui/material"
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import RecyclingOutlinedIcon from "@mui/icons-material/RecyclingOutlined"
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined"

const CREAM = "#EFE7DC"
const GREEN = "#304742"
const ORANGE = "#E9765B"
const BG = "#F2EADF"
const SOFT = "#F7F1E8"
const BORDER = "rgba(48,71,66,0.18)"

const studioParagraphs = [
  "Island Flourish is a floral design studio based on Whidbey Island, specializing in weddings, celebrations of life, and other meaningful occasions. At the heart of every arrangement is a commitment to intentional design - rooted in the beauty of the Pacific Northwest and brought to life through seasonal and locally sourced flora.",
  "Working with Island Flourish is a deeply personal and collaborative experience. From the very first conversation, the goal is to truly know you - your vision, your story, and the feeling you want your florals to evoke. No two couples are the same, and no two designs should be either. You are encouraged to dream boldly, embrace creativity, and trust that your vision will be heard, honored, and brought to life in a way that is uniquely yours.",
  "Island Flourish is also committed to caring for the world we design in. By sourcing locally, staying foam free, and utilizing reusable and recyclable materials such as chicken wire and moss, every decision is made with both beauty and the earth in mind. Every choice, from the first stem to the last detail, is made with both intention and care - for your day, and for the world around us.",
]

const alexandraParagraphs = [
  "My name is Alexandra - though most call me Alex. I am the founder and head designer of Island Flourish, based on my beloved Whidbey Island. I am so excited to not only share my story and my business with you, but to help tell yours.",
  "Some of my most cherished memories are of sunny Whidbey Island days picking flowers from my grandparents' garden with my cousins, playing \"flower fairy.\" And then there were the tea parties - dressed up in tulle, making little bouquets for the table while my Nana and great-grandma helped us sip our \"fancy\" tea. I blame Nana Marian entirely for my love of both flowers and hosting. It was joyful and simple, but looking back, those traditions planted something lasting in me. Flowers are intentional. Whether you're gifting them to someone or using them to create a space to share with others, they carry emotion in a way that words sometimes can't.",
  "That love never really left - it just waited. It wasn't until COVID brought me back home to Whidbey that floristry truly found me. What started as a small roadside flower stand quickly pulled me down a rabbit hole of flower growing and floral design. Like so many in the PNW, I became completely hooked on Floret - and that influence shows up naturally in the way I design. A lush, garden-style aesthetic has always been at the heart of my work, and while I love exploring other styles, that garden-inspired foundation is unmistakably mine.",
  "Along the way I've had the pleasure of finding mentors who have helped shape my approach, including Tobey Nelson, whose guidance has deepened my commitment to sustainable floristry. I knew this was the work I was meant to do when I realized that no matter how demanding or exhausting a day might be, I wake up the next morning genuinely excited to do it all over again.",
  "At the heart of what I do is working with couples, and it's something I genuinely treasure. Being trusted to translate the feeling of someone's most important day into something living and beautiful is extraordinary. I love getting to know the people I work with - understanding not just the colors and aesthetic they're drawn to, but the emotion they want to walk into and the details that make their relationship uniquely theirs. That's where the real design begins.",
  "What started with flower fairies and tea parties has grown into something I am endlessly proud of. I show up every day with the same intention Nana Marian taught me - that flowers are never just flowers. They are the feeling behind them. At the end of the day, this work is about connection - to place, to people, and to the moments that matter most. I am grateful every single day that flowers found me, and even more grateful for the opportunity to share that with you.",
]

const values = [
  {
    title: "Intentional Design",
    icon: <FavoriteBorderOutlinedIcon />,
    body:
      "Every arrangement starts with the feeling behind the moment, then becomes color, movement, texture, and form.",
  },
  {
    title: "Seasonal Roots",
    icon: <SpaOutlinedIcon />,
    body:
      "The Pacific Northwest is part of the work. Seasonal and locally sourced flora guide the palette whenever possible.",
  },
  {
    title: "Earth-Minded Care",
    icon: <RecyclingOutlinedIcon />,
    body:
      "Island Flourish is foam free and leans on reusable, recyclable mechanics like chicken wire and moss.",
  },
]

function Reveal({ children, delay = 0 }) {
  const ref = React.useRef(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    if (shown) return undefined

    if (typeof window === "undefined") {
      setShown(true)
      return undefined
    }

    const el = ref.current
    if (!el) {
      setShown(true)
      return undefined
    }

    let active = true
    let observer = null
    let frame = null
    let interval = null

    const cleanup = () => {
      active = false
      if (observer) observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      if (interval) window.clearInterval(interval)
      window.removeEventListener("scroll", scheduleCheck, true)
      window.removeEventListener("resize", scheduleCheck)
    }

    const revealIfVisible = () => {
      if (!active) return false

      const rect = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth
      const isVerticallyVisible = rect.top < viewportHeight && rect.bottom > 0
      const isHorizontallyVisible = rect.left < viewportWidth && rect.right > 0

      if (isVerticallyVisible && isHorizontallyVisible) {
        setShown(true)
        cleanup()
        return true
      }

      return false
    }

    function scheduleCheck() {
      if (frame || !active) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        revealIfVisible()
      })
    }

    if (revealIfVisible()) return cleanup

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(() => revealIfVisible(), {
        threshold: 0,
        root: null,
        rootMargin: "0px",
      })
      observer.observe(el)
    }

    window.addEventListener("scroll", scheduleCheck, true)
    window.addEventListener("resize", scheduleCheck)
    interval = window.setInterval(revealIfVisible, 250)

    return cleanup
  }, [shown])

  return (
    <Box ref={ref} style={{ minHeight: 1 }}>
      <motion.div
        initial={false}
        animate={
          shown
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 18, filter: "blur(2px)" }
        }
        transition={{ duration: 0.65, ease: "easeOut", delay }}
        style={{ willChange: "opacity, transform, filter" }}
      >
        {children}
      </motion.div>
    </Box>
  )
}

function Paragraphs({ items, sx }) {
  return (
    <>
      {items.map((item) => (
        <Typography
          key={item}
          sx={{
            color: GREEN,
            fontFamily: "Georgia",
            fontSize: { xs: 16, md: 17 },
            lineHeight: 1.9,
            mb: 1.7,
            ...sx,
          }}
        >
          {item}
        </Typography>
      ))}
    </>
  )
}

function SectionTitle({ title, align = "left" }) {
  return (
    <Box sx={{ textAlign: align, mb: 2.2 }}>
      <Typography
        component="h2"
        sx={{
          color: GREEN,
          fontFamily: "Brasika",
          fontSize: "clamp(34px, 4vw, 58px)",
          lineHeight: 1.04,
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}

function ValueCard({ icon, title, body }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2,
        border: `1px solid ${BORDER}`,
        background: "rgba(239,231,220,0.84)",
        p: 2.4,
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            minWidth: 44,
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
          <Typography sx={{ mt: 1, color: GREEN, fontFamily: "Georgia", lineHeight: 1.75 }}>
            {body}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

export default function AboutPage() {
  return (
    <Box sx={{ background: BG, color: GREEN, minHeight: "100vh", overflowX: "hidden" }}>
      <Head>
        <title>about</title>
        <meta
          name="description"
          content="Meet Island Flourish and Alexandra, the Whidbey Island floral designer behind intentional, seasonal, earth-minded floral design."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <Box
          component="img"
          src="/splash.png"
          alt="Island Flourish bouquet held toward a blue sky"
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
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.18) 54%, rgba(48,71,66,0.24) 100%)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "clamp(390px, 50vw, 620px)",
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
                fontSize: "clamp(44px, 7vw, 88px)",
                lineHeight: 1.02,
                textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
              }}
            >
              about
            </Typography>
          </motion.div>
        </Box>
      </Box>

      <Box sx={{ position: "relative", px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1180, mx: "auto", position: "relative", zIndex: 1 }}>
          <Grid container spacing={3.5} alignItems="stretch">
            <Grid item xs={12} md={6.8}>
              <Reveal>
                <SectionTitle title="Island Flourish" />
                <Paragraphs items={studioParagraphs} />
              </Reveal>
            </Grid>

            <Grid item xs={12} md={5.2}>
              <Reveal delay={0.08}>
                <Box
                  sx={{
                    height: "100%",
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      minHeight: { xs: 330, md: 520 },
                      borderRadius: 2,
                      overflow: "hidden",
                      border: `1px solid ${BORDER}`,
                      boxShadow: "0 18px 48px rgba(0,0,0,0.16)",
                    }}
                  >
                    <Box
                      component="img"
                      src="/gallery.png"
                      alt="A floral table setting by Island Flourish"
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        inset: 0,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${BORDER}`,
                      background: GREEN,
                      color: CREAM,
                      p: 2.4,
                    }}
                  >
                    <Typography
                      sx={{
                        color: CREAM,
                        fontFamily: "Georgia",
                        fontSize: 18,
                        lineHeight: 1.7,
                      }}
                    >
                      "Flowers are intentional. They carry emotion in a way that words
                      sometimes can't."
                    </Typography>
                  </Card>
                </Box>
              </Reveal>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ background: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <Reveal>
            <SectionTitle title="Meet Alexandra" align="center" />
          </Reveal>

          <Grid container spacing={3.5} alignItems="start">
            <Grid item xs={12} md={4.7}>
              <Reveal delay={0.06}>
                <Box
                  sx={{
                    position: { md: "sticky" },
                    top: { md: 24 },
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      minHeight: { xs: 340, md: 560 },
                      borderRadius: 2,
                      overflow: "hidden",
                      border: `1px solid ${BORDER}`,
                      boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
                      background: SOFT,
                    }}
                  >
                    <Box
                      component="img"
                      src="/contact.png"
                      alt="Fresh seasonal flowers"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${BORDER}`,
                      background: SOFT,
                      p: 2.4,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", mb: 1 }}>
                      <AutoStoriesOutlinedIcon sx={{ color: ORANGE }} />
                      <Typography
                        variant="h5"
                        sx={{ color: GREEN, fontFamily: "Brasika", lineHeight: 1.08 }}
                      >
                        Nana Marian's Lesson
                      </Typography>
                    </Box>
                    <Typography sx={{ color: GREEN, fontFamily: "Georgia", lineHeight: 1.75 }}>
                      A small memory of flower fairies, tea parties, and handmade table
                      bouquets became a lifelong belief: flowers are never just flowers.
                    </Typography>
                  </Card>
                </Box>
              </Reveal>
            </Grid>

            <Grid item xs={12} md={7.3}>
              <Reveal delay={0.12}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${BORDER}`,
                    background: "rgba(247,241,232,0.72)",
                    p: { xs: 2.4, md: 3.4 },
                    boxShadow: "0 14px 30px rgba(0,0,0,0.06)",
                  }}
                >
                  <Paragraphs items={alexandraParagraphs} />
                  <Box
                    sx={{
                      mt: 2.4,
                      pt: 2.2,
                      borderTop: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <LocalFloristIcon sx={{ color: ORANGE }} />
                    <Typography
                      sx={{
                        color: GREEN,
                        fontFamily: "GeorgiaB",
                        fontWeight: 800,
                        lineHeight: 1.5,
                      }}
                    >
                      With intention, care, and a very real love for Whidbey Island.
                    </Typography>
                  </Box>
                </Card>
              </Reveal>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 1180, mx: "auto" }}>
          <Reveal>
            <SectionTitle title="Care in Every Stem" align="center" />
          </Reveal>

          <Grid container spacing={2.4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={value.title}>
                <Reveal delay={index * 0.05}>
                  <ValueCard {...value} />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box sx={{ background: GREEN, color: CREAM, px: { xs: 2, md: 4 }, py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            maxWidth: 980,
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
            Flowers, feeling, and place.
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
            Island Flourish exists to honor the stories, celebrations, and tender
            thresholds that flowers are invited into. When you are ready, Alexandra
            would love to hear what you are dreaming about.
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
            Start a Conversation
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
