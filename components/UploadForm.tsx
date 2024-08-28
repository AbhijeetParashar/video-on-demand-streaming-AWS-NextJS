"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BsFillCloudUploadFill } from "react-icons/bs";

export default function UploadForm() {
  // Use correct typing for useRef and useState
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSucces] = useState<boolean>(false);
  const router = useRouter();

  // Handle file upload button click
  const handleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (file && !loading) {
      setLoading(true);
      console.log(file);
      const formData: any = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        console.log("response", response);
        if (response.ok) {
          const data = await response.json();
          setMessage(`File uploaded successfully: ${data.fileName}`);
          setLoading(false);
          setIsSucces(true);
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          setMessage("File upload failed.");
          setIsSucces(false);
        }
      } catch (error) {
        setMessage(`Error: ${error}`);
        setIsSucces(false);
      } finally {
        setLoading(false);
      }
    }
  };

  // Trigger file input click on icon click
  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className="h-[200px] w-[300px] border-2 border-dashed border-sky-700 relative flex justify-center items-center cursor-pointer"
        onClick={handleIconClick}
      >
        <BsFillCloudUploadFill color="#0369a1" size={40} />
        <input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files?.[0] || null)
          }
          type="file"
          accept="video/*"
          ref={inputRef}
          hidden
        />
      </div>
      {file && <p className="text-2xl text-orange-700 mt-2">{file.name}</p>}
      <button
        className="my-2 w-full text-center text-xl font-bold border-solid border-2 bg-emerald-500 text-white p-2 rounded-lg"
        onClick={handleUpload}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && (
        <div
          className={
            isSuccess ? "text-lg text-sky-800" : "text-xl text-red-600"
          }
        >
          {message}
        </div>
      )}
    </div>
  );
}
