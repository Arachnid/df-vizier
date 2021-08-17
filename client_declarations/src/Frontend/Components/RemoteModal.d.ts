import * as React from 'react';
/**
 * Allows you to instantiate a modal, and render it into the desired element.
 * Useful for loading temporary modals from ANYWHERE in the UI, not just
 * {@link GameWindowLayout}
 */
export declare function RemoteModal({ title, container, children, hook, }: {
    title: string;
    container: Element;
    children: React.ReactElement;
    hook: [boolean, (set: boolean) => void];
}): React.ReactPortal;
