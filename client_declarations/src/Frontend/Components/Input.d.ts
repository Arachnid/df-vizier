import React from 'react';
export declare const Input: React.ForwardRefExoticComponent<Pick<React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement> & InputProps, "key" | "wide" | keyof React.InputHTMLAttributes<HTMLInputElement>> & React.RefAttributes<HTMLInputElement>>;
interface InputProps {
    wide?: boolean;
}
export declare const DFInput: import("styled-components").StyledComponent<"input", any, {
    wide?: boolean | undefined;
}, never>;
export {};
