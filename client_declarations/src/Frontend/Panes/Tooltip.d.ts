import React from 'react';
import { TooltipName } from '../Game/WindowManager';
declare type DisplayType = 'inline' | 'block' | 'inline-block' | 'inline-flex' | 'flex';
declare type TooltipProps = {
    children: React.ReactNode;
    name: TooltipName;
    needsCtrl?: boolean;
    display?: DisplayType;
    style?: React.CSSProperties;
    className?: string;
};
export declare function TooltipTrigger({ children, name, display, style, className }: TooltipProps): JSX.Element;
export declare function Tooltip(): JSX.Element;
export {};
