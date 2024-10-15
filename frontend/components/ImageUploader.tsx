import { InitiaValues } from "@/app/page";
// import { pinata } from "@/config";
import { FormikErrors } from "formik";
import Image from "next/image";
import { FileObject } from "pinata";
import React, { use, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BarLoader } from "react-spinners";

interface Image {
  values: InitiaValues;
  setFieldValue: (
    field: string,
    value: string,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<InitiaValues>>;
}

const ImageUploader = ({ setFieldValue, values }: Image) => {
  const inputFile = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cid, setCid] = useState("");

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
    ? `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}`
    : "https://gateway.pinata.cloud";

  const uploadFile = async (fileToUpload: any) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", fileToUpload, `${fileToUpload.name}`);
      // const uploadData = await pinata.upload.file(formData);
      // ("use server");
      // const data = (await formData.get("file")) as unknown as FileObject;

      // const response = await pinata.upload.file(data);

      const request = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const response = await request.json();
      console.log(response);
      if (request.ok) {
        setFieldValue(
          "nftImageUrl",
          `${GATEWAY_URL}/ipfs/${response.IpfsHash}` // Use the IpfsHash returned from Pinata
        );
        toast.success("Uploaded file successfully");
      } else {
        toast.error("Error uploading file");
      }
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      toast.success("Trouble uploading file");
    }
  };

  const handleChange = (e: any) => {
    // setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  return (
    <div className="mt-4">
      <label className="block text-[16PX] font-medium text-gray-700 mb-2">
        Upload NFT Image
      </label>
      {values.nftImageUrl === "" ? (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          {uploading ? (
            <div className="flex flex-col gap-3 items-center">
              <p className="text-[#3b82f6]">Uploading...</p>
              <BarLoader color="#3b82f6" />
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 items-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-offset-1 focus-within:ring-indigo-500 focus-within:p-1"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".jpeg,.jpg,.png,"
                    className="sr-only"
                    ref={inputFile}
                    onChange={handleChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>
      ) : (
        <Image
          src={values.nftImageUrl}
          alt={values.name}
          width={300}
          height={300}
          // className="rounded-md"
        />
      )}
    </div>
  );
};

export default ImageUploader;
