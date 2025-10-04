import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-importprojectcard',
  imports: [],
  templateUrl: './importprojectcard.html',
  styleUrl: './importprojectcard.css',
})
export class Importprojectcard {
  @Input() title: string = '';
  @Input() tag: string = '';
  @Input() description: string = '';
  @Input() issuesCount: number = 0;
  @Input() selected: boolean = false;
}
