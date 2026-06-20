"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faComments,
  faClock,
  faHome,
  faImage,
  faMap,
  faXmark,
  faTrashCan,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function useObjectUrl(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return previewUrl;
}

function ScannerHeader() {
  return (
      <div className="bg-linear-to-r from-green-700 to-green-600 px-6 pb-8 pt-6 text-white dark:from-green-900 dark:to-green-800 rounded-b-3xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-green-700">
            🤖
          </div>
          <h1 className="text-lg font-semibold">SEB: Eco Assistant</h1>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-none">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Eco Legend in Training</p>
              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                Points: <span className="text-green-700">12,450</span>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">🏅</span>
              <span className="mt-1 text-xs text-gray-500">Level 7</span>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-green-600" style={{ width: "70%" }} />
          </div>
        </div>
      </div>
  );
}

function ScannerFooter() {
  return (
      <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-black flex justify-around">
        <Link href="../HomePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-green-700">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs font-medium">Scanner</span>
        </button>
        <Link href="../MapPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faMap} className="text-xl" />
          <span className="text-xs font-medium">Map</span>
        </Link>
        <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
          <span className="text-xs font-medium">SEB</span>
        </Link>
        <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
  );
}

function ScannerTips() {
  return (
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tip 1</p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">Fill the frame with the item</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tip 2</p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">Use good lighting for better results</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tip 3</p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">Keep labels and materials visible</p>
        </div>
      </div>
  );
}

function CameraCaptureModal({
                              onCapture,
                              onClose,
                            }: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Camera access is unavailable. Please allow permissions or use storage instead.");
        }
      } finally {
        if (!cancelled) {
          setIsStarting(false);
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function handleClose() {
    stopCamera();
    onClose();
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      onCapture(file);
      onClose();
    }, "image/jpeg", 0.92);
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Camera mode</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Take a picture</h3>
            </div>
            <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Close camera"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="space-y-4 bg-linear-to-br from-green-50 via-white to-emerald-50 p-5 dark:from-gray-900 dark:via-gray-950 dark:to-green-950/20">
            {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                  {errorMessage}
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl bg-black shadow-inner">
                  <video
                      ref={videoRef}
                      className="h-105 w-full object-cover"
                      autoPlay
                      muted
                      playsInline
                  />
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isStarting ? "Starting camera..." : "Frame the waste item, then tap capture."}
              </p>

              <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                    type="button"
                    onClick={handleCapture}
                    disabled={isStarting || !!errorMessage}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-green-600/30 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 disabled:shadow-none"
                >
                  <FontAwesomeIcon icon={faCamera} />
                  Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function ScannerControls({
                           onOpenCamera,
                           onOpenGallery,
                         }: {
  onOpenCamera: () => void;
  onOpenGallery: () => void;
}) {
  return (
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
            type="button"
            onClick={onOpenCamera}
            className="cursor-pointer flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-4 text-left shadow-sm transition-colors hover:bg-green-50 dark:border-green-900/50 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200">
          <FontAwesomeIcon icon={faCamera} className="text-lg" />
        </span>
          <span>
          <span className="block font-semibold text-gray-900 dark:text-white">Take a picture</span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">Open the camera on your device</span>
        </span>
        </button>

        <button
            type="button"
            onClick={onOpenGallery}
            className="cursor-pointer flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <FontAwesomeIcon icon={faImage} className="text-lg" />
        </span>
          <span>
          <span className="block font-semibold text-gray-900 dark:text-white">Choose from storage</span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">Pick an existing image file</span>
        </span>
        </button>
      </div>
  );
}

function PreviewCard({
                       file,
                       previewUrl,
                       onClear,
                       isScanning,
                       onScan,
                     }: {
  file: File | null;
  previewUrl: string | null;
  onClear: () => void;
  isScanning: any;
  onScan: any;
}) {
  return (
      <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {file ? file.name : "No image selected yet"}
            </p>
          </div>
          {file && (
              <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-l font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  Clear
                </button>
                <button
                    type="button"
                    onClick={onScan}
                    disabled={isScanning}
                    className="ml-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-l font-semibold text-white shadow-lg shadow-green-600/30 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 disabled:shadow-none"
                >
                  <FontAwesomeIcon icon={faCamera} />
                  {isScanning ? "Scanning..." : "Scan"}
                </button>
              </div>
          )}
        </div>

        <div className="flex min-h-72 flex-col items-center justify-center bg-linear-to-br from-green-50 via-white to-emerald-50 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/20">
          {previewUrl ? (
              <img
                  src={previewUrl}
                  alt="Selected waste preview"
                  className="h-auto w-auto rounded-2xl object-cover shadow-sm"
              />
          ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-white/80 px-6 text-center dark:border-green-900/60 dark:bg-gray-900/80">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200">
                  <FontAwesomeIcon icon={faCamera} className="text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Your photo will appear here</h4>
                <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                  Use the camera button to capture new waste or the storage button to select an existing image.
                </p>
              </div>
          )}
        </div>
      </div>
  );
}

function ScannerBody({
                       file,
                       previewUrl,
                       scanResult,
                       isScanning,
                       onOpenCamera,
                       onOpenGallery,
                       onClear,
                       onScan,
                     }: {
  file: File | null;
  previewUrl: string | null;
  scanResult: string | null;
  isScanning: boolean;
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onClear: () => void;
  onScan: () => void;
}) {
  return (
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Scanner</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Take or upload a photo</h2>
          </div>
          <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-200">
            Image input
          </div>
        </div>

        <section className="space-y-5">
          <div className="rounded-3xl bg-linear-to-br from-green-50 via-white to-emerald-50 p-5 shadow-sm ring-1 ring-green-100 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/30 dark:ring-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scan your waste</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose how to add an image</h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-300">
              Ready
            </span>
            </div>

            <ScannerControls onOpenCamera={onOpenCamera} onOpenGallery={onOpenGallery} />
            <PreviewCard file={file} previewUrl={previewUrl} onClear={onClear} isScanning={isScanning} onScan={onScan} />
            <ScannerTips />

            <div className="mt-5 rounded-3xl border border-dashed border-green-200 bg-white p-5 shadow-sm dark:border-green-900/60 dark:bg-gray-950">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Scan summary
                  </h4>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-200">
                Ready to scan
              </span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-green-50/70 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {isScanning ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200">
                        <FontAwesomeIcon icon={faCamera} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Scanning in progress</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          Please wait while the example result is being prepared.
                        </p>
                      </div>
                    </div>
                ) : scanResult ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Scan result</p>
                        <p className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-200">{scanResult}</p>
                      </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                        <FontAwesomeIcon icon={faCamera} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">No result yet</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          Choose a photo and press <span className="font-semibold text-green-700 dark:text-green-300">Scan</span> to see a preview result.
                        </p>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}

export default function ScannerPage() {
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const previewUrl = useObjectUrl(selectedFile);

  function handleGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function openCamera() {
    setIsCameraOpen(true);
  }

  function openGallery() {
    galleryInputRef.current?.click();
  }

  function clearSelection() {
    setSelectedFile(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    setScanResult(null);
  }

  async function handleScan() {
    setIsScanning(true);

    // EXAMPLE SCAN START
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!selectedFile) {
      setScanResult("Demo scan: no image selected yet. Add a photo first, then connect the backend here.");
    } else {
      setScanResult(
          `Demo scan result for ${selectedFile.name}: likely recyclable plastic/metal packaging. Replace this with your backend response.`
      );
    }
    // EXAMPLE SCAN END

    setIsScanning(false);
  }

  return (
      <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-black">
        <ScannerHeader />

        <ScannerBody
            file={selectedFile}
            previewUrl={previewUrl}
            scanResult={scanResult}
            isScanning={isScanning}
            onOpenCamera={openCamera}
            onOpenGallery={openGallery}
            onClear={clearSelection}
            onScan={handleScan}
        />

        <ScannerFooter />

        <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryChange}
        />

        {isCameraOpen && (
            <CameraCaptureModal
                onCapture={(file) => setSelectedFile(file)}
                onClose={() => setIsCameraOpen(false)}
            />
        )}
      </div>
  );
}