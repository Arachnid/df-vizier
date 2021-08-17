import React from 'react';
export declare type BtnProps = {
    disabled?: boolean;
    noBorder?: boolean;
    wide?: boolean;
    small?: boolean;
    color?: string;
    borderColor?: string;
    textColor?: string;
    forceActive?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;
export declare function Btn(props: BtnProps): JSX.Element;
