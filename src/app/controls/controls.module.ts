import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputComponent } from './input/input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './button/button.component';
import { AlertComponent } from './alert/alert.component';
import { RadioGroupComponent } from './radio-group/radio-group.component';

@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
    AlertComponent,
    RadioGroupComponent,
  ],
  exports: [
    InputComponent,
    ButtonComponent,
    AlertComponent,
    RadioGroupComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [],
})
export class ControlsModule {}
