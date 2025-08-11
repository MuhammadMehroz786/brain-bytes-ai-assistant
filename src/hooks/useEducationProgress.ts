import { useCallback } from "react";
import { EDUCATION_DATA } from "@/components/education/data";

type ProgressState = Record<string, { completedCards: string[] }>;

const STORAGE_KEY = "aihub:progress";

function readState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useEducationProgress() {
  const getToolProgress = useCallback((toolId: string) => {
    const state = readState();
    const completed = state[toolId]?.completedCards || [];
    const total = EDUCATION_DATA.tools.find(t => t.id === toolId)?.cards.length || 1;
    const percent = Math.min(100, Math.round((completed.length / total) * 100));
    return { percent, completedCards: completed };
  }, []);

  const markCardComplete = useCallback((toolId: string, cardId: string) => {
    const state = readState();
    const current = new Set(state[toolId]?.completedCards || []);
    current.add(cardId);
    state[toolId] = { completedCards: Array.from(current) };
    writeState(state);
  }, []);

  return { getToolProgress, markCardComplete };
}
