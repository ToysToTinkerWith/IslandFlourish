import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import Head from "next/head"
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material"
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined"
import { motion } from "framer-motion"
import { AuthContext } from "../Firebase/FirebaseAuth"
import { db, storage } from "../Firebase/FirebaseInit"
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

const ADMIN_EMAILS = ["abergquist96@gmail.com", "islandflourish@gmail.com"]

const GREEN = "#304742"
const CREAM = "#EFE7DC"
const BG = "#F2EADF"
const SOFT = "#F7F1E8"
const ORANGE = "#E9765B"
const BORDER = "rgba(48,71,66,0.18)"

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: `${GREEN} !important`,
    fontFamily: "Georgia",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: `${GREEN} !important`,
  },
  "& .MuiOutlinedInput-root": {
    color: GREEN,
    backgroundColor: "rgba(247,241,232,0.86)",
    borderRadius: 3,
    fontFamily: "Georgia",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(48,71,66,0.30)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(48,71,66,0.55)" },
  },
  "& .MuiFormHelperText-root": {
    color: `${GREEN} !important`,
    opacity: 0.72,
    fontFamily: "Georgia",
  },
  "& textarea, & input": {
    fontFamily: "Georgia",
  },
}

function parseResources(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim())
      if (parts.length >= 2) {
        return { label: parts[0], url: parts.slice(1).join("|") }
      }
      const isUrl = /^https?:\/\//i.test(line)
      return { label: line, url: isUrl ? line : "" }
    })
}

function formatPostDate(value) {
  try {
    if (value?.toDate) {
      return value.toDate().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
    if (value) {
      return new Date(value).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
  } catch {}

  return ""
}

function makeImageItems(files) {
  return Array.from(files || []).map((file) => ({
    id: `${Date.now()}-${Math.random().toString(20).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }))
}

function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
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
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.45, ease: "easeOut", delay }}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </Box>
  )
}

export default function NewsEventsPage() {
  const { currentUser } = useContext(AuthContext) || {}
  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email || "")

  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    body: "",
    resources: "",
  })
  const [images, setImages] = useState([])
  const [captions, setCaptions] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const imagesRef = useRef([])

  useEffect(() => {
    const postsQuery = query(collection(db, "newsEvents"), orderBy("created", "desc"))

    const unsubscribe = onSnapshot(
      postsQuery,
      (snap) => {
        const next = []
        snap.forEach((postDoc) => {
          next.push({ id: postDoc.id, ...postDoc.data() })
        })
        setPosts(next)
        setLoadingPosts(false)
      },
      (err) => {
        console.error(err)
        setError(err?.message || "Could not load posts.")
        setLoadingPosts(false)
      }
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [])

  const sortedPosts = useMemo(() => posts || [], [posts])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleImages = (event) => {
    const nextImages = makeImageItems(event.target.files)
    setImages((prev) => [...prev, ...nextImages])
    setError("")
    setSuccess("")
    event.target.value = null
  }

  const removeImage = (id) => {
    setImages((prev) => {
      const removed = prev.find((image) => image.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((image) => image.id !== id)
    })
    setCaptions((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const clearForm = () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setForm({ title: "", subtitle: "", body: "", resources: "" })
    setImages([])
    setCaptions({})
    setSubmitting(false)
    setProgress(0)
    setError("")
    setSuccess("")
  }

  const submitPost = async () => {
    const title = form.title.trim()
    const body = form.body.trim()

    if (!title || !body) {
      setError("Please add a title and post text before publishing.")
      return
    }

    try {
      setSubmitting(true)
      setProgress(0)
      setError("")
      setSuccess("")

      const docRef = await addDoc(collection(db, "newsEvents"), {
        title,
        subtitle: form.subtitle.trim(),
        body,
        resources: parseResources(form.resources),
        images: [],
        authorEmail: currentUser?.email || "",
        created: serverTimestamp(),
        updated: serverTimestamp(),
      })

      const uploadedImages = []

      for (let index = 0; index < images.length; index += 1) {
        const image = images[index]
        const safeName = image.file.name.replace(/[^a-z0-9._-]/gi, "-")
        const imgRef = ref(storage, `newsEventsImages/${docRef.id}/${image.id}-${safeName}`)

        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(imgRef, image.file)

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const fileProgress = snapshot.totalBytes
                ? snapshot.bytesTransferred / snapshot.totalBytes
                : 0
              setProgress(Math.round(((index + fileProgress) / images.length) * 100))
            },
            (uploadError) => reject(uploadError),
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref)
                uploadedImages.push({
                  index,
                  url,
                  caption: captions[image.id] || "",
                  name: image.file.name,
                })
                resolve()
              } catch (downloadError) {
                reject(downloadError)
              }
            }
          )
        })
      }

      if (uploadedImages.length) {
        await updateDoc(doc(db, "newsEvents", docRef.id), {
          images: uploadedImages,
          updated: serverTimestamp(),
        })
      }

      clearForm()
      setSuccess("Post published.")
    } catch (err) {
      console.error(err)
      setSubmitting(false)
      setError(err?.message || "Could not publish the post. Please try again.")
    }
  }

  return (
    <Box sx={{ background: BG, color: GREEN, minHeight: "100vh", overflowX: "hidden" }}>
      <Head>
        <title>News & Events | Island Flourish</title>
        <meta
          name="description"
          content="News, events, resources, venue notes, and floral planning guidance from Island Flourish."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <Box
          component="img"
          src="/splash.png"
          alt="Island Flourish splash"
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
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "clamp(360px, 46vw, 560px)",
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
                fontSize: "clamp(38px, 6vw, 78px)",
                lineHeight: 1.02,
                textShadow: "0 12px 34px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.55)",
              }}
            >
              news & events
            </Typography>
          </motion.div>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 5, md: 7 },
          position: "relative",
        }}
      >
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
            top: 0,
            right: 0,
            width: "12vw",
            maxWidth: 100,
            transform: "scale(-1)",
            opacity: 0.85,
            pointerEvents: "none",
          }}
        />

        <Box sx={{ maxWidth: 1180, mx: "auto", position: "relative", zIndex: 1 }}>
          {isAdmin ? (
            <Card
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                border: `1px solid ${BORDER}`,
                background: "rgba(239,231,220,0.82)",
                boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                p: { xs: 2, md: 3 },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle at 8% 10%, rgba(233,118,91,0.10) 0%, rgba(233,118,91,0) 30%)," +
                    "radial-gradient(circle at 90% 16%, rgba(48,71,66,0.09) 0%, rgba(48,71,66,0) 32%)",
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                  <LocalFloristIcon sx={{ color: GREEN }} />
                  <Typography
                    variant="h4"
                    sx={{ color: GREEN, fontFamily: "Brasika", lineHeight: 1.05 }}
                  >
                    Add a Post
                  </Typography>
                </Box>

                <Typography sx={{ color: GREEN, fontFamily: "Georgia", lineHeight: 1.7 }}>
                  Write longer updates, venue notes, vendor tips, recommendations, resources,
                  and event announcements.
                </Typography>

                <Divider sx={{ my: 2, borderColor: GREEN, opacity: 0.16 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      label="Post Title"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Subtitle or Short Summary"
                      name="subtitle"
                      value={form.subtitle}
                      onChange={handleFormChange}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Post Text"
                      name="body"
                      value={form.body}
                      onChange={handleFormChange}
                      helperText="Use line breaks for paragraphs. This can be as long as you need."
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Resources"
                      name="resources"
                      value={form.resources}
                      onChange={handleFormChange}
                      helperText="Optional. One per line, like: Venue name | https://example.com"
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      startIcon={<AddPhotoAlternateOutlinedIcon />}
                      disabled={submitting}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${GREEN}`,
                        color: GREEN,
                        background: CREAM,
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        px: 2,
                        py: 1,
                      }}
                    >
                      Add Images
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImages}
                      />
                    </Button>
                    <Typography
                      component="span"
                      sx={{ ml: 1.4, color: GREEN, fontFamily: "Georgia" }}
                    >
                      {images.length} selected
                    </Typography>
                  </Grid>

                  {images.length ? (
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {images.map((image, index) => (
                          <Grid item xs={12} sm={6} md={4} key={image.id}>
                            <Box
                              sx={{
                                p: 1.4,
                                borderRadius: 2,
                                border: `1px solid ${BORDER}`,
                                background: "rgba(247,241,232,0.86)",
                              }}
                            >
                              <Box
                                component="img"
                                src={image.previewUrl}
                                alt=""
                                sx={{
                                  width: "100%",
                                  height: 160,
                                  objectFit: "cover",
                                  borderRadius: 1.5,
                                  display: "block",
                                }}
                              />
                              <TextField
                                fullWidth
                                label={`Image ${index + 1} Caption`}
                                value={captions[image.id] || ""}
                                onChange={(event) =>
                                  setCaptions((prev) => ({
                                    ...prev,
                                    [image.id]: event.target.value,
                                  }))
                                }
                                sx={{ ...fieldSx, mt: 1.3 }}
                              />
                              <Button
                                onClick={() => removeImage(image.id)}
                                disabled={submitting}
                                sx={{
                                  mt: 1,
                                  color: ORANGE,
                                  textTransform: "none",
                                  fontFamily: "GeorgiaB",
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  ) : null}

                  {submitting ? (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${BORDER}`,
                          background: SOFT,
                        }}
                      >
                        <Typography sx={{ color: GREEN, fontFamily: "GeorgiaB" }}>
                          Publishing... {progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ mt: 1, borderRadius: 999, height: 8 }}
                        />
                      </Box>
                    </Grid>
                  ) : null}

                  {error ? (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  ) : null}

                  {success ? (
                    <Grid item xs={12}>
                      <Alert severity="success">{success}</Alert>
                    </Grid>
                  ) : null}

                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1.2 }}
                  >
                    <Button
                      onClick={clearForm}
                      disabled={submitting}
                      sx={{
                        color: GREEN,
                        border: `1px solid ${GREEN}`,
                        borderRadius: 2,
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        px: 2,
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={submitPost}
                      disabled={submitting}
                      sx={{
                        color: CREAM,
                        background: `linear-gradient(180deg, ${ORANGE}, #d86245)`,
                        border: `1px solid ${ORANGE}`,
                        borderRadius: 2,
                        textTransform: "none",
                        fontFamily: "GeorgiaB",
                        px: 2,
                        "&:hover": {
                          background: "#d86245",
                        },
                      }}
                    >
                      {submitting ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CircularProgress size={17} sx={{ color: CREAM }} />
                          Publishing
                        </Box>
                      ) : (
                        "Publish Post"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ) : null}

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.4 }}>
            <Typography
              variant="h3"
              sx={{
                color: GREEN,
                fontFamily: "Brasika",
                lineHeight: 1.05,
                textAlign: "center",
              }}
            >
              latest posts
            </Typography>
          </Box>

          {loadingPosts ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <CircularProgress sx={{ color: GREEN }} />
            </Box>
          ) : null}

          {!loadingPosts && sortedPosts.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${BORDER}`,
                background: "rgba(239,231,220,0.82)",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: GREEN, fontFamily: "GeorgiaB" }}>
                No posts have been published yet.
              </Typography>
            </Card>
          ) : null}

          <Grid container spacing={3}>
            {sortedPosts.map((post, index) => {
              const resources = Array.isArray(post.resources) ? post.resources : []
              const postImages = Array.isArray(post.images) ? post.images : []

              return (
                <Grid item xs={12} key={post.id}>
                  <RevealOnScroll delay={Math.min(index * 0.04, 0.18)}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: `1px solid ${BORDER}`,
                        background: "rgba(239,231,220,0.82)",
                        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <Grid container>
                        {postImages[0]?.url ? (
                          <Grid item xs={12} md={5}>
                            <Box
                              component="img"
                              src={postImages[0].url}
                              alt={postImages[0].caption || post.title || ""}
                              sx={{
                                width: "100%",
                                height: "100%",
                                minHeight: { xs: 260, md: 420 },
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </Grid>
                        ) : null}

                        <Grid item xs={12} md={postImages[0]?.url ? 7 : 12}>
                          <Box sx={{ p: { xs: 2.4, md: 3.4 } }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: GREEN,
                                fontFamily: "GeorgiaB",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                opacity: 0.78,
                              }}
                            >
                              {formatPostDate(post.created)}
                            </Typography>

                            <Typography
                              variant="h3"
                              sx={{
                                mt: 1,
                                color: GREEN,
                                fontFamily: "Brasika",
                                lineHeight: 1.08,
                              }}
                            >
                              {post.title}
                            </Typography>

                            {post.subtitle ? (
                              <Typography
                                sx={{
                                  mt: 1.2,
                                  color: GREEN,
                                  fontFamily: "GeorgiaB",
                                  lineHeight: 1.7,
                                  fontSize: 18,
                                }}
                              >
                                {post.subtitle}
                              </Typography>
                            ) : null}

                            <Typography
                              sx={{
                                mt: 2,
                                color: GREEN,
                                fontFamily: "Georgia",
                                lineHeight: 1.85,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {post.body}
                            </Typography>

                            {resources.length ? (
                              <Box sx={{ mt: 2.4 }}>
                                <Typography
                                  sx={{
                                    mb: 1,
                                    color: GREEN,
                                    fontFamily: "GeorgiaB",
                                    fontWeight: 800,
                                  }}
                                >
                                  Resources
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  {resources.map((resource, resourceIndex) =>
                                    resource.url ? (
                                      <Button
                                        key={`${resource.label}-${resourceIndex}`}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        endIcon={<OpenInNewOutlinedIcon />}
                                        sx={{
                                          color: GREEN,
                                          border: `1px solid ${GREEN}`,
                                          borderRadius: 2,
                                          textTransform: "none",
                                          fontFamily: "GeorgiaB",
                                          background: SOFT,
                                        }}
                                      >
                                        {resource.label || resource.url}
                                      </Button>
                                    ) : (
                                      <Typography
                                        key={`${resource.label}-${resourceIndex}`}
                                        sx={{
                                          color: GREEN,
                                          border: `1px solid ${BORDER}`,
                                          borderRadius: 2,
                                          px: 1.4,
                                          py: 0.85,
                                          fontFamily: "GeorgiaB",
                                          background: SOFT,
                                        }}
                                      >
                                        {resource.label}
                                      </Typography>
                                    )
                                  )}
                                </Box>
                              </Box>
                            ) : null}

                            {postImages.length > 1 ? (
                              <Box sx={{ mt: 2.8 }}>
                                <Grid container spacing={1.4}>
                                  {postImages.slice(1).map((image, imageIndex) => (
                                    <Grid item xs={6} md={4} key={`${image.url}-${imageIndex}`}>
                                      <Box
                                        component="img"
                                        src={image.url}
                                        alt={image.caption || post.title || ""}
                                        sx={{
                                          width: "100%",
                                          aspectRatio: "1 / 1",
                                          objectFit: "cover",
                                          borderRadius: 2,
                                          border: `1px solid ${BORDER}`,
                                          display: "block",
                                        }}
                                      />
                                      {image.caption ? (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "block",
                                            mt: 0.6,
                                            color: GREEN,
                                            fontFamily: "Georgia",
                                            lineHeight: 1.35,
                                          }}
                                        >
                                          {image.caption}
                                        </Typography>
                                      ) : null}
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            ) : null}
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </RevealOnScroll>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
