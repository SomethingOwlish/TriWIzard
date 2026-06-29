import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Multi-line text well — comments, lore notes, character backstory. */
export function Textarea(props: TextareaProps): JSX.Element;
