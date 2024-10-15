"use client";

import React, { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import EventForm from "@/components/EventForm";
import EmailList from "@/components/EmailList";
import EmailEditor from "@/components/EmailEditor";
import { Formik, Form } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { WEB_URL } from "@/config";
import { BiLoader, BiLoaderCircle } from "react-icons/bi";
import { FaCircleNotch } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { BeatLoader, BarLoader } from "react-spinners";
import { Resend } from "resend";

export interface InitiaValues {
  name: string;
  description: string;
  symbol: string;
  decimals: string;
  unique: true;
  nftImageUrl: string;
  //   emailSubject: string;
  //   emailInput: string;
}

export default function Home() {
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [metadataCID, setMetadataCID] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  const nftLink = `${WEB_URL}/${metadataCID}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nftLink);
      setCopySuccess(true);

      // Reset the copySuccess state after a delay
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const initiaValues: InitiaValues = {
    name: "",
    description: "",
    symbol: "TECHFIESTA",
    decimals: "0",
    unique: true,
    nftImageUrl: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters long"),

    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters long"),

    // decimals: Yup.number()
    //   .required("Decimals are required")
    //   .typeError("Decimals must be a number")
    //   .min(0, "Decimals must be at least 0")
    //   .max(18, "Decimals cannot exceed 18"),

    // unique: Yup.boolean().required("Unique field is required"),

    // nftImageUrl: Yup.string()
    //   .required("NFT image URL is required")
    //   .url("Must be a valid URL"),
  });

  console.log(emailList);
  console.log(metadataCID);
  console.log(emailContent);

  const sendEmail = async (resetForm: () => void) => {
    try {
      setUploadingMetadata(true);
      const request = await fetch("/api/send_email", {
        method: "POST",
        body: JSON.stringify({
          // from: "noreply@techfiesta.dev",
          to: emailList,
          subject: emailSubject,
          emailContent: emailContent,
        }),
      });
      const response = await request.json();
      console.log(response);
      if (response.statusCode === 202) {
        toast.success("Email sent Successfully");
        resetForm();
        setEmailContent("");
        setEmailList([]);
        setEmailSubject("");
      } else {
        toast.error("Trouble sending emails");
      }
      setUploadingMetadata(false);
    } catch (e) {
      setUploadingMetadata(false);
      console.log(e);
      toast.error("Trouble sending emails");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold">TechFiesta SBT Mailer</h1>
      </header>
      <main>
        <Formik
          initialValues={initiaValues}
          onSubmit={() => {}}
          validationSchema={validationSchema}
        >
          {({ values, setFieldValue, isValid, dirty, resetForm }) => (
            <Form>
              <div className="flex-grow  w-full p-4 md:p-8 space-y-8 md:space-y-0 md:flex md:space-x-8">
                <section className="bg-white rounded-lg shadow-md p-6 md:w-[50%]">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    SBT Details
                  </h2>
                  <EventForm
                    values={values}
                    setFieldValue={setFieldValue}
                    setMetadataCID={setMetadataCID}
                    isValid={isValid}
                    dirty={dirty}
                    setMetadataUrl={setMetadataUrl}
                  />
                </section>
                <div className=" md:w-[50%] space-y-8">
                  <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Compose Email
                    </h2>
                    {metadataCID !== "" && (
                      <div className="mb-2">
                        <p className="block text-[16px] font-medium text-gray-700 mb-2">
                          Nft Mint Link:
                        </p>
                        <div className=" bg-white border shadow-lg mb-5 rounded p-4 text-xs flex justify-between items-center">
                          <div className=" border border-[#aba2a2b8] w-[70%] p-3 overflow-x-auto whitespace-nowrap ">
                            <p> {nftLink}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md font-normal text-sm"
                          >
                            {copySuccess ? "Copied!" : "Copy NFT Link"}
                          </button>
                        </div>
                      </div>
                    )}
                    <EmailEditor
                      setEmailContent={setEmailContent}
                      setEmailSubject={setEmailSubject}
                    />
                  </section>
                  <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Recipients
                    </h2>
                    <EmailList
                      setEmailList={setEmailList}
                      emailList={emailList}
                    />
                  </section>
                </div>
              </div>

              <div className="bg-blue-500 text-white p-4 text-center">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-blue-500 font-bold py-2 px-4 rounded transition duration-300"
                  disabled={uploadingMetadata}
                  onClick={() => {
                    console.log();
                    if (
                      emailSubject !== "" &&
                      emailContent !== "" &&
                      emailList.length > 0
                    ) {
                      sendEmail(resetForm);
                    } else {
                      toast.error("Please fill out all email required fields");
                      resetForm();
                    }
                  }}
                >
                  {uploadingMetadata ? (
                    <BeatLoader color="#3b82f6" />
                  ) : (
                    "Send SBT Link"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}
