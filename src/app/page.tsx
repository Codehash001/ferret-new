
import { DarkModeToggle } from "@/components/topBar/dark-mode-toggle";
import { Chat } from "@/components/chat/chat";
import { env } from "@/lib/config";

export default function Home() {


    const url = env.SUPABASE_KEY
    console.log(url)

  return (
    <main className="relative container flex min-h-screen flex-col">
      <div className=" p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <span className="font-bold">Home Page</span>
        <DarkModeToggle />
      </div>
      <div className="flex flex-1 py-4">
        <div className="w-full">
          {/* <Chat /> */}
         
        </div>
      </div>
    </main>
  );
}
