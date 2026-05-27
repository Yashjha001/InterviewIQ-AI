"use client";

import { useState } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadPage() {

  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </main>
    );
  }

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      setResponse(data);

    } catch (error) {

      console.error(error);
      alert("Something went wrong");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-10">

      <h1 className="text-4xl font-bold mb-6">
        Upload Resume
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-xl mt-4 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

      {response && (
        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-4">
            Extracted Skills
          </h2>

          <ul className="mb-6 list-disc pl-6">
            {response.skills?.map((skill: string, index: number) => (
              <li key={index}>
                {skill}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mb-4">
            AI Interview Questions
          </h2>

          <pre className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap">
            {response.questions}
          </pre>

        </div>
      )}

    </main>
  );
}