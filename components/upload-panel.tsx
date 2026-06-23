"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Link, FileImage, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface UploadPanelProps {
  onScanStart: (file: File | string) => void
  isScanning: boolean
  errorMessage?: string | null
}

export function UploadPanel({ onScanStart, isScanning, errorMessage }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleScan = () => {
    if (selectedFile) {
      onScanStart(selectedFile)
    } else if (urlInput.trim()) {
      onScanStart(urlInput.trim())
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setUrlInput("")
  }

  return (
    <section id="scan" className="py-20 sm:py-24 px-4 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Live Content Scan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload an image or provide a URL to begin forensic analysis. 
            Our AI will detect manipulation, verify authenticity, and generate a trust score.
          </p>
        </motion.div>

        {/* Upload Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl p-5 sm:p-8 glow-border panel-gradient"
        >
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8 p-1.5 bg-secondary/50 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setInputMode("upload")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                inputMode === "upload"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setInputMode("url")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                inputMode === "url"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link className="inline-block w-4 h-4 mr-2" />
              URL Input
            </button>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl p-7 sm:p-12 text-center transition-all cursor-pointer bg-card/20",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    selectedFile && "border-primary bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <FileImage className="w-16 h-16 text-primary" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            clearSelection()
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:scale-105 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-secondary">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          Drop your image here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter image URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="bg-secondary/50 border-border focus-visible:ring-primary/45"
                  />
                  {urlInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelection}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter a direct link to an image for analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {errorMessage && (
            <p className="mt-4 text-sm text-destructive text-center" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Scan Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleScan}
              disabled={isScanning || (!selectedFile && !urlInput.trim())}
              className="min-w-[220px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 soft-ring"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Begin Analysis
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
