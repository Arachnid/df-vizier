import { html } from 'htm/preact';
import { StateUpdater, useCallback, useState } from 'preact/hooks';
import { VNode } from 'preact';

interface TableCell {
    content: VNode;
    sortValue: any;
}

type TableRow = Array<string|TableCell>;

function asTableCell(value: string|TableCell) {
    if(typeof value === "string") {
        return {content: html`${value}`, sortValue: value};
    }
    return value;
}

type CompareFunction<T> = (a: T, b: T) => number;

export function SortableTable({ 
    headings,
    rows,
    compareFunctions,
    sort: [sortByColumn, setSortByColumn],
    reverse: [reverse, setReverse]
}: {
    headings: Array<string>,
    rows: Array<TableRow>,
    compareFunctions: Array<CompareFunction<any>>,
    sort: [number|undefined, StateUpdater<number|undefined>]
    reverse: [boolean, StateUpdater<boolean>]
}) {
    const sortedRows = [...rows];
    if(sortByColumn !== undefined) {
        const compareFunction = compareFunctions[sortByColumn];
        sortedRows.sort((a, b) => {
            let cmp = compareFunction(asTableCell(a[sortByColumn]).sortValue, asTableCell(b[sortByColumn]).sortValue);
            if(reverse) {
                cmp *= -1;
            }
            return cmp;
        })
    }

    const onColumnHeaderClicked = useCallback((columnIndex: number) => {
        if(sortByColumn === columnIndex) {
            if(reverse) {
                setReverse(false);
                setSortByColumn(undefined);
            } else {
                setReverse(true);
            }
        } else {
            setSortByColumn(columnIndex);
            setReverse(false);
        }
    }, [sortByColumn, reverse]);

    return html`<table>
        <thead>
            <tr>
                ${headings.map((heading, idx) => {
                    if(sortByColumn === idx) {
                        return html`<th style=${sortByColumn === idx ? 'font-weight: bold' : ''}>
                            <a onClick=${() => onColumnHeaderClicked(idx)}>
                                ${heading}
                                ${reverse ? '↓' : '↑'}
                            </a>
                        </th>`;
                    } else {
                        return html`<th><a onClick=${() => onColumnHeaderClicked(idx)}>${heading}</a></th>`;
                    }
                })}
            </tr>
        </thead>
        ${sortedRows.map((row) => html`<tr>
            ${row.map((cell) => html`<td>${asTableCell(cell).content}</td>`)}
        </tr>`)}
    </table>`;
}
