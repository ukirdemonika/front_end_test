import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brewery } from '../../../core/models/brewery.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-brewery-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './brewery-detail.html',
  styleUrl: './brewery-detail.scss',
})
export class BreweryDetail {
  brewery = input<Brewery | null>(null);
  close = output<void>();

  faXmark = faXmark;
}
