import { cookies } from "next/headers";
import Link from "next/link";

export default function Home() {
  const cookieStore = cookies();
  const authToken = cookieStore.get("next-auth.session-token")?.value || "";
  return (
    <main className="flex flex-col items-center p-24">
      <h1 className="text-3xl text-[#DA3E99] my-4 font-medium">
        Welcome to V-O-D stream Demo using AWS and Next JS
      </h1>
      <h2 className="text-3xl text-[#70204f] my-4 font-bold">
        Course Name : AWS VOD
      </h2>
      {authToken ? (
        <div className="flex gap-3 items-center justify-between">
          <Link href="/upload">
            <div className="my-2 items-center justify-between text-xl font-bold border-solid border-2 bg-emerald-500 text-white p-2 rounded-lg">
              Upload More Lessons
            </div>
          </Link>

          <Link href="/course">
            <div className="my-2 items-center justify-between text-xl font-bold border-solid border-2 bg-[#4183c3]  text-white p-2 rounded-lg">
              View Course Contents
            </div>
          </Link>
        </div>
      ) : (
        <div className="text-2xl font-semibold mb-4 text-sky-500">
          {" "}
          Login to View Course{" "}
        </div>
      )}
    </main>
  );
}
