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
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="I want to get better at writing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-muted"
          />
          {suggestedTool && (
            <div className="absolute top-full left-0 right-0 mt-1 z-10">
              <Card 
                className="p-2 cursor-pointer hover:bg-accent"
                onClick={() => {
                  onSelectTool(suggestedTool.id);
                  setSearchQuery("");
                }}
              >
                <div className="flex items-center gap-2">
                  <suggestedTool.icon className="h-4 w-4" />
                  <span className="text-sm">Try {suggestedTool.name}</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Tool Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`flex-shrink-0 w-64 cursor-pointer transition-all hover:shadow-md ${
              activeToolId === tool.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectTool(tool.id)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{tool.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {tool.category}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {getToolDescription(tool)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToolBar;