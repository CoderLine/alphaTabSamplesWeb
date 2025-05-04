import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as alphaTab from '@coderline/alphatab';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  #alphaTab!: alphaTab.AlphaTabApi;

  @ViewChild('alphaTab') alphaTabElement!: ElementRef<HTMLDivElement>

  playPause() {
    this.#alphaTab.playPause();
  }

  ngAfterViewInit(): void {
    this.#alphaTab = new alphaTab.AlphaTabApi(this.alphaTabElement.nativeElement, {
      core: {
        file: 'https://www.alphatab.net/files/canon.gp',
        fontDirectory: '/font/'
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/soundfont/sonivox.sf2'
      }
    } as alphaTab.Settings);
  }

  ngOnDestroy(): void {
    this.#alphaTab.destroy();
  }

  title = 'alphatab-app';
}
