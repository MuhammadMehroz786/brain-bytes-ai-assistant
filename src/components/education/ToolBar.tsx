import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { EducationTool } from "./types";

interface ToolBarProps {
  tools: EducationTool[];
  onSelectTool: (toolId: string) => void;
  activeToolId: string;
}

const ToolBar = ({ tools, onSelectTool, activeToolId }: ToolBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getToolDescription = (tool: EducationTool) => {
    switch (tool.id) {
      case 'notion-ai':
        return 'Turn ideas into structured pages instantly';
      case 'chatgpt':
        return 'Chat with AI to solve problems faster';
      case 'task-automation':
        return 'Automate repetitive tasks and workflows';
      default:
        return 'Master this AI tool effectively';
    }
  };

  const getSuggestedTool = (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('writ') || lowerQuery.includes('content') || lowerQuery.includes('blog')) {
      return tools.find(t => t.id === 'notion-ai');
    }
    if (lowerQuery.includes('chat') || lowerQuery.includes('question') || lowerQuery.includes('help')) {
      return tools.find(t => t.id === 'chatgpt');
    }
    if (lowerQuery.includes('automat') || lowerQuery.includes('task') || lowerQuery.includes('workflow')) {
      return tools.find(t => t.id === 'task-automation');
    }
    return null;
  };

  const suggestedTool = searchQuery.length > 3 ? getSuggestedTool(searchQuery) : null;

  return (
    <div className="w-full rounded-xl border bg-gradient-to-r from-primary/5 via-accent/5 to-background p-3 shadow-sm">
      <div className="flex items-stretch gap-3">
        {/* Left: Tool cards (horizontal scroll) */}
        <div className="flex-1 flex gap-3 overflow-x-auto pb-1">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`group flex-shrink-0 w-56 cursor-pointer rounded-xl transition-all hover:shadow-md hover-scale ${
                activeToolId === tool.id ? 'ring-2 ring-primary bg-primary/5' : 'bg-background/80 border-muted'
              }`}
              onClick={() => onSelectTool(tool.id)}
            >
              <div className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium leading-tight truncate">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{getToolDescription(tool)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right: Search */}
        <div className="relative w-[280px] sm:w-[320px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="What do you want to improve?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/70 border-muted rounded-lg"
          />
          {suggestedTool && (
            <div className="absolute top-full right-0 left-0 mt-1 z-20">
              <Card
                className="p-2 cursor-pointer hover:bg-accent rounded-lg shadow-md"
                onClick={() => {
                  onSelectTool(suggestedTool.id);
                  setSearchQuery("");
                }}
              >
                <div className="flex items-center gap-2">
                  <suggestedTool.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">Try {suggestedTool.name}</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolBar;