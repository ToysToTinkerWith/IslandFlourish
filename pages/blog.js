import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Box, CircularProgress } from "@mui/material"

export default function BlogRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/news-events")
  }, [router])

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Head>
        <title>Blog | Island Flourish</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CircularProgress sx={{ color: "#304742" }} />
    </Box>
  )
}
