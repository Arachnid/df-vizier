import React from 'react';
/**
 * This component allows you to render several tabs of content. Each tab can be selected for viewing
 * by clicking on its corresponding tab button. Useful for displaying lots of slightly different but
 * related information to the user.
 */
export declare function TabbedView({ tabTitles, tabContents, }: {
    tabTitles: string[];
    tabContents: (tabIndex: number) => React.ReactNode;
}): JSX.Element;
