import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RadioOption } from '../../core/types/radio.model';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
})
export class RadioGroupComponent {
  @Input() options: RadioOption[] = [];
  @Input() name = 'radio-group';
  @Input() selectedValue: string | null = null;

  @Output() onSelectionChange = new EventEmitter<string>();

  handleSelection(value: string) {
    this.selectedValue = value;
    this.onSelectionChange.emit(this.selectedValue);
  }
}
