"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings } from "lucide-react";

interface SettingsDialogProps {
  apiKey?: string; // optional - deprecated single key prop
  onApiKeyChange?: (apiKey: string) => void; // optional for backward compat
  selectedAgentName?: string;
  requiredKeyNames?: string[]; // support multiple env keys
  values?: Record<string, string>;
  onChange?: (key: string, value: string) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  apiKey = "",
  onApiKeyChange,
  selectedAgentName = "Agent",
  requiredKeyNames = ["API_KEY"],
  values = {},
  onChange,
}) => {
  const [tempKeys, setTempKeys] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    requiredKeyNames.forEach((k) => {
      initial[k] = values[k] ?? "";
    });
    return initial;
  });
  const [isOpen, setIsOpen] = useState(false);

  // Update temp keys when props change
  React.useEffect(() => {
    const updated: Record<string, string> = {};
    requiredKeyNames.forEach((k) => {
      updated[k] = values[k] ?? "";
    });
    setTempKeys(updated);
  }, [JSON.stringify(requiredKeyNames), JSON.stringify(values)]);

  const handleSave = () => {
    // Backwards compatible single apiKey handler
    if (onApiKeyChange && requiredKeyNames.length === 1) {
      onApiKeyChange(tempKeys[requiredKeyNames[0]] ?? "");
    }

    // Call generic onChange for each key
    if (onChange) {
      Object.entries(tempKeys).forEach(([k, v]) => onChange(k, v));
    }

    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to original values
    const reset: Record<string, string> = {};
    requiredKeyNames.forEach((k) => {
      reset[k] = values[k] ?? "";
    });
    setTempKeys(reset);
    setIsOpen(false);
  };

  const hasAnyKey = Object.values(values).some((v) => (v ?? "").trim().length > 0) || apiKey.trim().length > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant={hasAnyKey ? "outline" : "destructive"} 
                size="sm"
                className={!hasAnyKey ? "animate-pulse" : ""}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasAnyKey ? "Settings" : "Set API Key Required"}</p>
          </TooltipContent>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>Settings - {selectedAgentName}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Configure your keys to use the {selectedAgentName} functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {requiredKeyNames.map((keyName) => (
            <div key={keyName} className="space-y-2">
              <Label htmlFor={keyName} className="text-sm font-medium">
                {keyName}
              </Label>
              <Input
                id={keyName}
                type="password"
                value={tempKeys[keyName] ?? ""}
                onChange={(e) => setTempKeys((s) => ({ ...s, [keyName]: e.target.value }))}
                className="w-full"
                placeholder={`Enter your ${keyName}`}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      </Tooltip>
    </TooltipProvider>
  );
};
