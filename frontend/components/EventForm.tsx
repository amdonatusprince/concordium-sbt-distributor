import React, { useState } from "react";
import { ErrorMessage, Field, FormikErrors } from "formik";
import ImageUploader from "./ImageUploader";
import { InitiaValues } from "@/app/page";
import toast from "react-hot-toast";
import FormikErrorMessage from "./FormikErrorMessage";

interface EventForms {
  values: InitiaValues;
  setMetadataCID: React.Dispatch<React.SetStateAction<string>>;
  isValid: boolean;
  dirty: boolean;
  setMetadataUrl: React.Dispatch<React.SetStateAction<string>>;
  setFieldValue: (
    field: string,
    value: string,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<InitiaValues>>;
}

const EventForm = ({
  values,
  setFieldValue,
  setMetadataCID,
  setMetadataUrl,
  isValid,
  dirty,
}: EventForms) => {
  const [uploading, setUploading] = useState(false);

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
    ? `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}`
    : "https://gateway.pinata.cloud";

  const uploadNftData = async () => {
    try {
      setUploading(true);
      // const formData = new FormData();
      // formData.append("file", fileToUpload, `${fileToUpload.name}`);
      const request = await fetch("/api/metadata", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          symbol: values.symbol,
          decimals: Number(values.decimals),
          unique: values.unique,
          thumbnail: { url: values.nftImageUrl },
          display: {
            url: values.nftImageUrl,
          },
        }),
      });
      const response = await request.json();

      if (request.ok) {
        setMetadataCID(response.IpfsHash);
        setMetadataUrl(`${GATEWAY_URL}/ipfs/${response.IpfsHash}?`);
        toast.success("SBT created successfully");
      } else {
        toast.error("Error uploading file");
      }
      setUploading(false);
    } catch (e) {
      console.error(e);
      setUploading(false);
      toast.error("Trouble uploading file");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-[16px] font-medium text-gray-700 "
        >
          Name
        </label>
        <Field
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter title"
          className="border border-gray-300 w-full p-2 rounded-md outline-none mt-2"
        />
        <ErrorMessage name="name" component={FormikErrorMessage} />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-[16px] font-medium text-gray-700"
        >
          Description
        </label>
        <Field
          type="text"
          id="description"
          name="description"
          required
          placeholder="Enter SBT description"
          className="border border-gray-300 w-full p-2 rounded-md outline-none mt-2"
        />
        <ErrorMessage name="description" component={FormikErrorMessage} />
      </div>
      <ImageUploader setFieldValue={setFieldValue} values={values} />
      <button
        type="button"
        disabled={values.nftImageUrl === "" && uploading}
        className={`${
          values.nftImageUrl === "" || uploading
            ? "bg-blue-200 text-white"
            : "bg-blue-500 text-white"
        } border w-full p-3 rounded-md `}
        onClick={() => {
          if (isValid && dirty) {
            uploadNftData();
          } else {
            toast.error(
              "Please fill all required fields and validate the form"
            );
          }
        }}
      >
        Create SBT
      </button>
    </div>
  );
};

export default EventForm;
