import { Component, computed, ElementRef, viewChildren } from '@angular/core';
import { WorkItemCard } from './work-item-card/work-item-card';
import { Point } from '@angular/cdk/drag-drop';

@Component({
  selector: 'ninja-board',
  imports: [
    WorkItemCard,
  ],
  template: `
    <div class="flex h-full" id="board">
      <div #column id="todo" class="border-l border-gray-300 flex-grow px-2">
        <h2 class="text-center text-gray-400">
          TO DO
        </h2>
        <ninja-work-item-card (droppedAt)="onDropCard($event)" (draggingAt)="onDragMoveCard($event)" />
      </div>
      <div #column id="doing" class="border-l border-r border-gray-300 flex-grow px-2">
        <h2 class="text-center text-gray-400">
          DOING
        </h2>
        <ninja-work-item-card (droppedAt)="onDropCard($event)" (draggingAt)="onDragMoveCard($event)" />
      </div>
      <div #column id="done" class="border-r border-gray-300 flex-grow px-2">
        <h2 class="text-center text-gray-400">
          DONE
        </h2>
        <ninja-work-item-card (droppedAt)="onDropCard($event)" (draggingAt)="onDragMoveCard($event)" />
      </div>
    </div>
  `
})
export class Board {

  columns = viewChildren<ElementRef<HTMLElement>>('column');
  colRects = computed(() => this.columns().reduce((map, column) =>
    map.set(column, column.nativeElement.getBoundingClientRect()),
    new Map<ElementRef<HTMLElement>, DOMRect>())
  );

  protected onDropCard(point: Point): void {
    this.colRects().forEach((rect, column) => {
      if (this.pointIsInRect(point, rect)) {
        console.log(column.nativeElement.id);
        column.nativeElement.classList.remove('bg-blue-50');
      }
    });
  }

  private pointIsInRect({ x, y }: Point, rect: DOMRect): boolean {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  protected onDragMoveCard(point: Point): void {
    this.colRects().forEach((rect, column) => {
      if (this.pointIsInRect(point, rect)) {
        column.nativeElement.classList.add('bg-blue-50');
        return;
      }
      column.nativeElement.classList.remove('bg-blue-50');
    });
  }
}
