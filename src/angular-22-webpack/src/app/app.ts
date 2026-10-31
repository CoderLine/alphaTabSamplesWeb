import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import * as alphaTab from '@coderline/alphatab';

@Component({
  selector: 'app-root',
  template: `
    <button type="button" [disabled]="!playerReady()" (click)="playPause()">{{ playing() ? 'Pause' : 'Play' }}</button>
    <div #alphaTab></div>
  `,
})
export class App {
  private readonly element = viewChild.required<ElementRef<HTMLDivElement>>('alphaTab');
  private api?: alphaTab.AlphaTabApi;
  protected readonly playerReady = signal(false);
  protected readonly playing = signal(false);

  constructor() {
    // afterNextRender never runs during server-side rendering: alphaTab needs the DOM, workers and Web Audio.
    afterNextRender(() => {
      const api = new alphaTab.AlphaTabApi(this.element().nativeElement, {
        core: {
          file: '/iron-waltz.gp',
          fontDirectory: '/font/',
        },
        player: {
          playerMode: alphaTab.PlayerMode.EnabledAutomatic,
          enableCursor: true,
          soundFont: '/soundfont/sonivox.sf3',
        },
      });
      api.playerReady.on(() => this.playerReady.set(true));
      api.playerStateChanged.on((e) => this.playing.set(e.state === alphaTab.synth.PlayerState.Playing));
      this.api = api;
    });
    inject(DestroyRef).onDestroy(() => this.api?.destroy());
  }

  protected playPause() {
    this.api?.playPause();
  }
}
