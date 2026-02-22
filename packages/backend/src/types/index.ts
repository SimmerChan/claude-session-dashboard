// 会话索引项（来自 sessions-index.json）
export interface SessionIndexEntry {
  sessionId: string;
  fullPath: string;
  fileMtime: number;
  firstPrompt: string;
  messageCount: number;
  created: string;
  modified: string;
  gitBranch: string;
  projectPath: string;
  isSidechain: boolean;
}

// 会话索引文件结构
export interface SessionsIndex {
  version: number;
  entries: SessionIndexEntry[];
}

// 会话消息类型
export type MessageType = 'user' | 'assistant' | 'tool_use' | 'tool_result';

// 会话消息
export interface SessionMessage {
  type: MessageType;
  timestamp: string;
  content?: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
}

// 搜索结果
export interface SearchResult {
  sessionId: string;
  projectPath: string;
  firstPrompt: string;
  matchedMessages: {
    index: number;
    content: string;
    highlight: string;
  }[];
  score: number;
}
