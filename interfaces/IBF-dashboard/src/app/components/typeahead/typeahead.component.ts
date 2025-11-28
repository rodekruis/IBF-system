import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import {
  CheckboxCustomEvent,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonHeader,
  IonItem,
  IonList,
  IonNote,
  IonSearchbar,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

export interface Item {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-typeahead',
  templateUrl: 'typeahead.component.html',
  imports: [
    IonButton,
    IonButtons,
    IonCheckbox,
    IonHeader,
    IonItem,
    IonList,
    IonNote,
    IonSearchbar,
    IonToolbar,
    TranslateModule,
  ],
})
export class TypeaheadComponent implements OnInit {
  @Input() items: Item[] = [];
  @Input() selectedItems: string | string[] = [];
  @Input() enableSearch = false;

  @Output() readonly selectionCancel = new EventEmitter<void>();
  @Output() readonly selectionChange = new EventEmitter<string | string[]>();

  filteredItems: Item[] = [];
  workingSelectedValues: string[] = [];
  multi = false;

  ngOnInit() {
    this.filteredItems = [...this.items];

    if (Array.isArray(this.selectedItems)) {
      this.workingSelectedValues = [...this.selectedItems];
      this.multi = true;
    } else {
      this.workingSelectedValues = [this.selectedItems];
    }
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges() {
    if (this.multi) {
      this.selectionChange.emit(this.workingSelectedValues);
    } else {
      if (this.workingSelectedValues[0] !== this.selectedItems[0]) {
        this.selectionChange.emit(this.workingSelectedValues[0]);
      }
    }

    this.selectionCancel.emit();
  }

  searchbarInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    this.filterList(inputElement.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined || searchQuery.trim() === '') {
      this.filteredItems = [...this.items];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
      const normalizedQuery = searchQuery.toLowerCase();

      this.filteredItems = this.items.filter(({ label, value }) =>
        [label, value].join(' ').toLowerCase().includes(normalizedQuery),
      );
    }
  }

  isChecked(value: string): boolean {
    return this.workingSelectedValues.includes(value);
  }

  checkboxChange(event: CheckboxCustomEvent<string>) {
    const { checked, value } = event.detail;

    if (!this.multi) {
      this.workingSelectedValues = [value];
      this.confirmChanges();
    }

    if (checked) {
      this.workingSelectedValues = [...this.workingSelectedValues, value];
    } else {
      this.workingSelectedValues = this.workingSelectedValues.filter(
        (item) => item !== value,
      );
    }
  }

  get disableConfirm() {
    if (this.items.every((item) => item.disabled)) {
      return true;
    }

    return (
      this.workingSelectedValues.length === this.selectedItems.length &&
      this.workingSelectedValues.every((value) =>
        this.selectedItems.includes(value),
      )
    );
  }
}
