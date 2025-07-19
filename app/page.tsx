import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto ">
      <div className="h-dvh flex items-center justify-center">
        <div>
          <h1 className="text-4xl font-bold text-center">
            Silahkan masuk ke Sistem Informasi
          </h1>
          <div className="flex space-x-6 justify-center mt-4">
            <Link href="/login">
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
