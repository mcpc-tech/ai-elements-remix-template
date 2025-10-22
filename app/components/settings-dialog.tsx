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
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  selectedAgentName?: string;
  requiredKeyName?: string;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  apiKey,
  onApiKeyChange,
  selectedAgentName = "Agent",
  requiredKeyName = "API_KEY",
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isOpen, setIsOpen] = useState(false);

  // Update temp key when prop changes
  React.useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeyChange(tempApiKey);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempApiKey(apiKey); // Reset to original value
    setIsOpen(false);
  };

  const hasApiKey = apiKey.trim().length > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant={hasApiKey ? "outline" : "destructive"} 
                size="sm"
                className={!hasApiKey ? "animate-pulse" : ""}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasApiKey ? "Settings" : "Set API Key Required"}</p>
          </TooltipContent>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>Settings - {selectedAgentName}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Configure your {requiredKeyName} to use the {selectedAgentName} functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              {requiredKeyName}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full"
              placeholder={`Enter your ${requiredKeyName}`}
            />
          </div>
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
