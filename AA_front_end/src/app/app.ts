import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Search } from "./features/search/search";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Search],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'AA_front_end';
}
