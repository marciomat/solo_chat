"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { ChatRoomState, useSendMessage } from "@/lib/jazz/hooks";
import { setupPasteHandler } from "@/lib/images/paste-handler";
import { uploadImage } from "@/lib/images/upload";
import { useAccount } from "@/lib/jazz/provider";

interface MessageInputProps {
  room: ChatRoomState;
}

export function MessageInput({ room }: MessageInputProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage(room);
  const me = useAccount();

  // Setup paste handler for images
  useEffect(() => {
    const cleanup = setupPasteHandler((blob) => {
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
      setImageBlob(blob);
    });

    return cleanup;
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
    }
  }, [text]);

  const handleSend = useCallback(async () => {
    console.log("handleSend called", { text, room, isLoaded: room?.$isLoaded, isSending });
    
    if ((!text.trim() && !imageBlob) || isSending) return;
    
    // Check if room is ready - be more lenient
    if (!room) {
      console.error("Room not available");
      return;
    }

    setIsSending(true);
    try {
      let uploadedImage = undefined;

      // Upload image if present
      if (imageBlob && me && room.$jazz?.owner) {
        uploadedImage = await uploadImage(imageBlob, room.$jazz.owner);
      }

      // Send the message
      await sendMessage(text.trim(), uploadedImage);

      // Clear inputs
      setText("");
      setImagePreview(null);
      setImageBlob(null);
      
      // Focus textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [text, imageBlob, room, isSending, me, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleRemoveImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageBlob(null);
  }, [imagePreview]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageBlob(file);
    }
    // Reset input
    e.target.value = "";
  }, []);

  const canSend = (text.trim() || imageBlob) && !isSending;

  return (
    <div className="border-t bg-background p-4 safe-bottom">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-lg border"
          />
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            type="button"
            asChild
          >
            <span>
              <ImageIcon className="w-5 h-5" />
            </span>
          </Button>
        </label>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="resize-none min-h-[44px] max-h-[150px]"
          disabled={isSending}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send • Shift+Enter for new line • Paste images from clipboard
      </p>
    </div>
  );
}
