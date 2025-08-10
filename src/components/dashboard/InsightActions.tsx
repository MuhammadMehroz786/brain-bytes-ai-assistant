import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Eye, Copy, Star, StarOff, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardMenu } from "./CardMenu";

interface InsightActionsProps {
  pinned?: boolean;
  onPin: () => void;
  onCopy: () => void;
  onView: () => void;
  onMarkRead: () => void;
  isClean: boolean;
  onToggleClean: () => void;
}

export const InsightActions: React.FC<InsightActionsProps> = ({ pinned, onPin, onCopy, onView, onMarkRead, isClean, onToggleClean }) => {
  return (
    <div className="flex items-center gap-1">
      {/* Desktop: inline actions */}
      <TooltipProvider>
        <div className="hidden sm:flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="View details" onClick={onView} className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Copy summary" onClick={onCopy} className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy summary</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Toggle Clean/Raw" onClick={onToggleClean} className="h-8 px-2">
                {isClean ? 'Clean' : 'Raw'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Clean/Raw</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Mark as read" onClick={onMarkRead} className="h-8">
                <Check className="h-4 w-4 mr-1" /> Read
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mark as read</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Mobile: overflow menu */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4 mr-2" /> View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy summary
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPin}>
              {pinned ? <Star className="h-4 w-4 mr-2 text-yellow-500" /> : <StarOff className="h-4 w-4 mr-2" />} {pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleClean}>
              {isClean ? 'Show Raw' : 'Show Clean'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMarkRead}>
              <Check className="h-4 w-4 mr-2" /> Mark as read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
