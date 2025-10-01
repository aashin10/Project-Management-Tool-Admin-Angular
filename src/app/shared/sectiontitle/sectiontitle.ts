import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sectiontitle',
  imports: [],
  templateUrl: './sectiontitle.html',
  styleUrl: './sectiontitle.css',
})
export class Sectiontitle {
  @Input() title = 'Sample Title';
  @Input() description = 'Sample Heading rldfv df dfg dgfdgf d gd gfd gf dfg dfg df';
}
