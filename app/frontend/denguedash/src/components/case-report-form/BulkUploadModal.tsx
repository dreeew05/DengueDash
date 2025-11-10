"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import { Button } from "@shadcn/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@shadcn/components/ui/alert";
import { Progress } from "@shadcn/components/ui/progress";
import { Separator } from "@shadcn/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@shadcn/components/ui/dialog";
import postService from "@/services/post.service";
import { BaseServiceResponse } from "@/interfaces/services/services.interface";

type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkUploadModal({ open, onOpenChange }: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setStatus("idle");
      setMessage("");
    } else {
      setSelectedFile(null);
      setStatus("error");
      setMessage("Please upload a valid CSV file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      // todo: add toast notification
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    try {
      setStatus("uploading");
      setProgress(20);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response: BaseServiceResponse =
        await postService.submitBulkForm(formData);
      // console.log("Upload response:", response);

      // Clear interval if it's still running
      clearInterval(progressInterval);

      if (response.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }

      setMessage(response.message);
      setProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      setMessage("Upload failed. Please try again.");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setStatus("idle");
    setProgress(0);
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (status !== "uploading" && status !== "validating") {
      resetUpload();
      onOpenChange(false);
    }
  };

  const downloadTemplate = () => {
    // In a real application, this would generate and download a CSV template
    const csvContent = `firstName,middleName,lastName,suffix,sex,civilStatus,dateOfBirth,region,province,city,barangay,street,houseNo,dateOfFirstVaccination,dateOfLastVaccination,dateAdmitted,isAdmitted,dateOnsetOfIllness,clinicalClassification,ns1_result,ns1_date,igGElisa,igGElisaDate,igMElisa,igMElisaDate,pcr,pcrDate,caseClassification,outcome,dateOfDeath
John,,Doe,,male,single,1990-01-01,region1,province1,city1,barangay1,Main St,123,2022-01-15,2022-04-15,2023-05-10,yes,2023-05-08,no-warning-signs,PR,2023-05-10,PR,2023-05-10,PR,2023-05-10,PR,2023-05-10,suspect,alive,`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_cases_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Patient Cases</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple patient cases at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              status === "error"
                ? "border-red-400 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            } transition-colors cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
              aria-label="Upload CSV file"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload"}
                </p>
                <p className="text-xs text-gray-500">
                  CSV files only (max 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-gray-500">
                  Download our CSV template to get started
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload Progress */}
          {(status === "validating" || status === "uploading") && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {status === "validating" ? "Validating..." : "Uploading..."}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-800">
                Upload Successful
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {status === "error" && (
            <div className="space-y-3">
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-800">Upload Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* CSV Format Guide */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              CSV Format Requirements
            </h3>
            <Separator className="my-2" />
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
              <li>First row must contain column headers</li>
              <li>Dates should be in YYYY/MM/DD format</li>
              <li>
                Required fields: First Name, Last Name, Sex, Date of Birth,
                Civil Status, Region, Province, City, Barangay, Date of
                Consultation, Is Admitted, Date of Onset of Illness, Clinical
                Classification, Lab Result, Case Classification, Outcome
                province, city, barangay
              </li>
              <li>Sex values: M (Male) F (Female)</li>
              <li>
                Civil Status values: S (Single), M (Married), W (Widowed) SEP
                (Separated)
              </li>
              <li>
                Clinical Classification values: N (No Warning Signs), W (Warning
                Signs), S (Severe Dengue)
              </li>
              <li>
                Lab Results values: PR (Pending), P (Positive), N (Negative), E
                (Equivocal)
              </li>
              <li>
                Case Classification values: C (Confirmed), S (Suspected), P
                (Probable)
              </li>
              <li>Outcome values A (Alive), D (Dead)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={resetUpload}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile || status === "validating" || status === "uploading"
            }
          >
            <Upload className="h-4 w-4 mr-2" />
            {status === "validating"
              ? "Validating..."
              : status === "uploading"
                ? "Uploading..."
                : "Upload CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
