import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchHistory } from '../../../core/models/brewery.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-history',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './search-history.html',
  styleUrl: './search-history.scss',
})
export class SearchHistoryComponent {
  history = input<SearchHistory[]>([]);

  select = output<SearchHistory>();
  delete = output<{ id: string; timestamp: string }>();

  faXmark = faXmark;

  //Delete handler that emits the id and timestamp of the item to be deleted
  onDelete(event: Event, item: SearchHistory) {
    event.stopPropagation();
    this.delete.emit({
      id: item.id,
      timestamp: item.displayTimestamp,
    });
  }
}
