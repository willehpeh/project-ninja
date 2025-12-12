import { Component, ElementRef, output, viewChild } from '@angular/core';
import { CdkDrag, Point } from '@angular/cdk/drag-drop';
import { Subject, tap, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ninja-work-item-card',
  imports: [
    CdkDrag
  ],
  template: `
    <div class="w-56 h-42 bg-yellow-100 p-3 cursor-grab active:cursor-grabbing"
         #card
         cdkDrag 
         cdkDragBoundary="#board" 
         (cdkDragEnded)="onDrop()"
         (cdkDragMoved)="onMove()">
      Stuff
    </div>
  `
})
export class WorkItemCard {

  card = viewChild.required<ElementRef<HTMLElement>>('card');

  droppedAt = output<Point>();
  draggingAt = output<Point>();

  private _draggingAt$ = new Subject<void>();

  constructor() {
    this._draggingAt$.pipe(
      throttleTime(100),
      takeUntilDestroyed(),
      tap(() => this.draggingAt.emit(this.centerPoint()))
    ).subscribe();
  }

  protected onDrop() {
    this.droppedAt.emit(this.centerPoint());
  }

  private centerPoint(): Point {
    const rect: DOMRect = this.card().nativeElement.getBoundingClientRect();
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  protected onMove() {
    this._draggingAt$.next();
  }
}
