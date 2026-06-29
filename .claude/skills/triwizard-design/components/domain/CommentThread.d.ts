import * as React from 'react';

export interface Comment {
  id?: string | number;
  author: string;
  role?: string;
  time?: string;
  body: React.ReactNode;
  avatar?: string;
  initials?: string;
}

export interface CommentThreadProps {
  comments: Comment[];
  /** Show a composer; called with the text on submit (⌘/Ctrl+Enter). */
  onSubmit?: (text: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

/** Threaded remarks on a character / lore card, with optional composer. */
export function CommentThread(props: CommentThreadProps): JSX.Element;
