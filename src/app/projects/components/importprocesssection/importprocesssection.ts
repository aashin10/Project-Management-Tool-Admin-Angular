import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-importprocesssection',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './importprocesssection.html',
  styleUrl: './importprocesssection.css',
})
export class Importprocesssection {
  @Input() icon: any = null;
  @Input() title: string = '';
  @Input() description: string = '';
}
