import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { Suspense } from "react"

export default async function PlayerPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  const username = typeof searchParams.username === 'string' ? searchParams.username : '';
  // The IP will be handled by the VideoPlayer component itself


  return (
    <main className="min-h-screen flex flex-col">
      <Header username={username} />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer token={token} username={username} />
        </Suspense>
      </div>
    </main>
  )
}
